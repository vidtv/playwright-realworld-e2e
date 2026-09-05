import { faker } from '@faker-js/faker';
import { expect } from '@playwright/test';
import { ArticlePage } from '@pages/article.page';
import { EditorPage, type ArticleFormData } from '@pages/editor.page';
import { test } from '@fixtures/test.fixture';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Article creation suite', () => {
  let editorPage: EditorPage;
  let articlePage: ArticlePage;

  test.beforeEach(async ({ authenticatedPage }) => {
    editorPage = new EditorPage(authenticatedPage);
    articlePage = new ArticlePage(authenticatedPage);
  });

  test('TC-ART-01: Create a New Article (Happy Path)', async ({ authenticatedPage, authenticatedUser }) => {
    const articleData: ArticleFormData = {
      title: `Article ${faker.string.alphanumeric(8)}`,
      description: faker.lorem.sentence(),
      body: faker.lorem.paragraph(),
      tags: [faker.string.alphanumeric(6).toLowerCase(), faker.string.alphanumeric(7).toLowerCase()],
    };

    await test.step('Navigate to the article editor', async () => {
      await editorPage.open();
      await expect(editorPage.titleInput).toBeVisible();
    });

    await test.step('Fill in the article form, publish the article and verify redirect', async () => {
      await editorPage.fillArticleForm(articleData);
      await editorPage.bodyInput.blur();
      await expect(editorPage.publishButton).toBeEnabled();

      await editorPage.publishButton.click(),

      await expect(authenticatedPage).toHaveURL(/\/article\/.+/, { timeout: 15_000 });

      authenticatedPage.on('response', (res) => {
        if (res.url().includes('/api/articles') && res.status() >= 400) {
          console.log(`[API ERROR] ${res.status()} ${res.url()}`);
        }
      });
      await expect(articlePage.getTitleHeading()).toBeVisible();
    });

    await test.step('Verify and published article details', async () => {
      await expect(articlePage.getTitleHeading()).toHaveText(articleData.title);
      await expect(articlePage.getBodyText(articleData.body)).toBeVisible();
      await expect(articlePage.getAuthorLink(authenticatedUser.username)).toBeVisible();

      for (const tag of articleData.tags) {
        await expect(articlePage.getTag(tag)).toBeVisible();
      }
    });
  })

  test('TC-ART-02: Article Creation Validation (Mandatory Fields)', async({ authenticatedPage, authenticatedUser }) => {
    await test.step('Navigate to the article editor', async () => {
      await editorPage.open();
      await expect(editorPage.titleInput).toBeVisible();
    });

    await test.step('Populate only description field, leave other fields empty, click "Publish Article" and verify error notification messages', async () => {
      await editorPage.descriptionInput.fill(faker.lorem.sentence());
      await editorPage.publishArticle();

      await expect(editorPage.errorNotifications).toHaveText([EditorPage.ERROR_MESSAGES.BLANK_TITLE_ERROR, EditorPage.ERROR_MESSAGES.BLANK_BODY_ERROR]);
    })
  })
});
