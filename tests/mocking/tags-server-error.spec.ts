import { expect } from '@playwright/test';
import { test } from '@fixtures/test.fixture';
import { MainPage } from '@pages/main.page';

test.describe('Network mocking suite', () => {
  let mainPage: MainPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);

    await page.route('**/api/tags', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          headers: { 'access-control-allow-origin': '*' },
          body: JSON.stringify({ errors: { body: ['Internal Server Error'] } }),
        });
        return;
      }

      await route.fallback();
    });
  });

  test('TC-MOCK-02: Server 500 Error Handling & Graceful Degradation', async ({ page }) => {
    await test.step('Intercept tags API with a server error and navigate to Home', async () => {
      await mainPage.open();
    });

    await test.step('Verify the article feed still loads and the tags area does not freeze the UI', async () => {
      await expect(mainPage.articleCards.first().or(mainPage.emptyFeedMessage)).toBeVisible();
      await expect(mainPage.loadingArticlesIndicator).toBeHidden();
      await expect(mainPage.popularTagsContainer).toBeVisible();
      await expect(mainPage.popularTags).toHaveCount(0);
      await expect(page).toHaveURL(/\/$/);
    });
  });
});
