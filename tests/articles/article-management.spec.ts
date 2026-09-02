import { faker } from '@faker-js/faker';
import { expect } from '@playwright/test';
import { ArticlePage } from '@pages/article.page';
import { EditorPage } from '@pages/editor.page';
import { test } from '@fixtures/test.fixture';
import { MainPage } from '@pages/main.page';
import { UrlUtils } from '@utils/url.utils';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Article management (edit/delete) suite', () => {
  let editorPage: EditorPage;
  let articlePage: ArticlePage;
  let mainPage: MainPage;
  
  test.beforeEach(async ({ authenticatedPage }) => {
    editorPage = new EditorPage(authenticatedPage);
    articlePage = new ArticlePage(authenticatedPage);
    mainPage = new MainPage(authenticatedPage);
  });

  test('TC-ART-03: Edit Existing Article', async ({ authenticatedPage, authenticatedUser, createdArticle }) => {
    const updatedTitle = `Updated ${faker.lorem.words(3)} ${faker.string.alphanumeric(4)}`;
    const updatedBody = faker.lorem.paragraph();
    const originalSlug = createdArticle.slug;

    await test.step('Open the created article in the editor', async () => {
      await editorPage.openForArticle(createdArticle.slug);

      await expect(editorPage.titleInput).toBeVisible();
      await expect(editorPage.titleInput).toHaveValue(createdArticle.title);
      await expect(editorPage.bodyInput).toHaveValue(createdArticle.body);
    });

    await test.step('Update the article title and body, then republish it', async () => {
      await editorPage.titleInput.fill(updatedTitle);
      await editorPage.bodyInput.fill(updatedBody);
      await editorPage.publishArticle();
    });

    await test.step('Verify the updated article view and rewritten slug', async () => {
      await expect(authenticatedPage).toHaveURL(/\/article\/[^/]+$/);

      const updatedSlug = new URL(authenticatedPage.url()).pathname.split('/').filter(Boolean).pop();

      expect(updatedSlug).toBeTruthy();
      expect(updatedSlug).not.toBe(originalSlug);

      if (updatedSlug) {
        createdArticle.slug = updatedSlug;
      }

      await expect(articlePage.getTitleHeading()).toHaveText(updatedTitle);
      await expect(articlePage.getBodyText(updatedBody)).toBeVisible();
      await expect(articlePage.getAuthorLink(authenticatedUser.username)).toBeVisible();
    });
  });

  test('TC-ART-04: Delete Existing Article', async ({ authenticatedPage, createdArticle }) => {
    await test.step('Open the created article in the editor', async () => {
      await articlePage.openForArticle(createdArticle.slug);
    });

    await test.step('Delete the article and verify that the main page is displayed and the article is no longer visible in the feed', async () => {
      await articlePage.deleteArticle();

      await expect(authenticatedPage).toHaveURL(UrlUtils.BASE_URL);

      await expect(mainPage.getArticleCard(createdArticle.slug).self).not.toBeAttached();
    });
  });
});
