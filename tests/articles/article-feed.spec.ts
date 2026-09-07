import { expect, test } from '@playwright/test';
import { MainPage } from '@pages/main.page';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Article feed suite', () => {
  test('TC-ART-05: Global Feed Pagination and filtering by Popular Tag', async ({ page }) => {
    const mainPage = new MainPage(page);
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
      for (let index = 0; index < articleCardCount; index += 1) {
        await expect(mainPage.getArticleCardAt(index).getTag(selectedTag)).toBeVisible();
      }
    });
  });
});
