import { expect } from '@playwright/test';
import { test } from '@fixtures/test.fixture';
import { MainPage } from '@pages/main.page';
import { ArticlePage } from '@pages/article.page';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Article feed suite', () => {
  let articlePage: ArticlePage;
  let mainPage: MainPage;
  
  test.beforeEach(async ({ authenticatedPage }) => {
    articlePage = new ArticlePage(authenticatedPage);
    mainPage = new MainPage(authenticatedPage);
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
  
    await test.step('Navigate to Home page, open the first article from the global feed and follow the author', async () => {
      await mainPage.open();
  
      await mainPage.getArticleCardAt(0).open();
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
