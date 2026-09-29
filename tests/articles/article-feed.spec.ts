import { APIRequestContext, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { test } from '@fixtures/test.fixture';
import { MainPage } from '@pages/main.page';
import { ArticlePage } from '@pages/article.page';
import { UrlUtils } from '@utils/url.utils';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Article feed suite', () => {
  let articlePage: ArticlePage;
  let mainPage: MainPage;

  let createdSlug: string;
  let articleOwnerRequest: APIRequestContext | undefined;
  const testTag = `tag-${Date.now()}`;
  
  test.beforeEach(async ({ authenticatedPage, playwright, request }) => {
    articlePage = new ArticlePage(authenticatedPage);
    mainPage = new MainPage(authenticatedPage);

    const username = `feeduser${faker.string.alphanumeric(8)}`;
    const email = `feeduser${faker.string.alphanumeric(6).toLowerCase()}@example.com`;
    const password = 'Password123!';

    const registrationResponse = await request.post(`${UrlUtils.BASE_API_URL}/users`, {
      data: { user: { username, email, password } },
    });
    if (!registrationResponse.ok()) {
      throw new Error(
        `Failed to register feed author: ${registrationResponse.status()} ${await registrationResponse.text()}`,
      );
    }

    const { user } = (await registrationResponse.json()) as {
      user: { token: string };
    };
    articleOwnerRequest = await playwright.request.newContext({
      extraHTTPHeaders: { Authorization: `Token ${user.token}` },
    });

    const response = await articleOwnerRequest.post(`${UrlUtils.BASE_API_URL}/articles`, {
      data: {
        article: {
          title: `Feed Test Article ${Date.now()}`,
          description: 'Test Description',
          body: 'Test Body Content',
          tagList: [testTag],
        },
      },
    });
    if (!response.ok()) {
      throw new Error(`Failed to create feed article: ${response.status()} ${await response.text()}`);
    }

    const body = (await response.json()) as { article: { slug: string } };
    createdSlug = body.article.slug;
  });

  test.afterEach(async () => {
    if (createdSlug) {
      await articleOwnerRequest?.delete(`${UrlUtils.BASE_API_URL}/articles/${createdSlug}`);
    }
    await articleOwnerRequest?.dispose();
    articleOwnerRequest = undefined;
    createdSlug = '';
  });

  test('TC-ART-05: Global Feed Pagination and filtering by Popular Tag', async () => {
    let selectedTag: string = '';

    await test.step('Navigate to Home page and select a tag from Popular Tags', async () => {
      await mainPage.open();
      await expect(mainPage.popularTags.first()).toBeVisible();

      const tagText = (await mainPage.popularTags.first().textContent())?.trim();
      expect(tagText).toBeTruthy();

      if (!tagText) {
        throw new Error('No selectable popular tag was found.');
      }

      selectedTag = tagText;
      await mainPage.selectPopularTag(selectedTag);

      await expect(mainPage.getTaggedFeedTab(selectedTag)).toBeVisible();
    });

    await test.step('Verify every listed article contains the selected tag', async () => {
      await expect(mainPage.articleCards.first()).toBeVisible();

      const articleCardCount = await mainPage.articleCards.count();
      for (let index = 0; index < articleCardCount; index++) {
        await expect(mainPage.getArticleCardAt(index).getTag(selectedTag)).toBeVisible();
      }
    });
  });

  test('TC-ART-06: Your Feed vs Global Feed visibility', async () => {
    let selectedAuthorName = '';
  
    await test.step('Open the test article from the global feed and follow its author', async () => {
      await articlePage.openForArticle(createdSlug);
      await articlePage.getFollowButton().click();
  
      selectedAuthorName = (await articlePage.getAuthorLink().innerText()).trim();
    });
  
    await test.step('Navigate to Your Feed and verify that only the first author articles are displayed', async () => {
      await mainPage.openYourFeed();
  
      await expect(mainPage.articleCards.first()).toBeVisible();
  
      const articleCardCount = await mainPage.articleCards.count();
      for (let index = 0; index < articleCardCount; index++) {
        await expect(mainPage.getArticleCardAt(index).authorLink).toHaveText(selectedAuthorName);
      }
    });
  });
});
