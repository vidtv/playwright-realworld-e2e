import { expect } from '@playwright/test';
import { test } from '@fixtures/test.fixture';
import { MainPage } from '@pages/main.page';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Network mocking suite', () => {
  let mainPage: MainPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    mainPage = new MainPage(authenticatedPage);

    await authenticatedPage.route('**/api/articles**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: { 'access-control-allow-origin': '*' },
          body: JSON.stringify({ articles: [], articlesCount: 0 }),
        });
        return;
      }

      await route.fallback();
    });
  });

  test('TC-MOCK-01: Empty Feed UI Resilience (Empty State)', async ({ authenticatedPage, authenticatedUser }) => {
    await test.step('Intercept articles API with an empty payload and navigate to Home', async () => {
      await mainPage.open();
    });

    await test.step('Verify the empty feed placeholder is rendered without a spinner or UI crash', async () => {
      await expect(mainPage.emptyFeedMessage).toBeVisible();
      await expect(mainPage.loadingArticlesIndicator).toBeHidden();
      await expect(mainPage.articleCards).toHaveCount(0);
      await expect(mainPage.getProfileLink(authenticatedUser.username)).toBeVisible();
      await expect(authenticatedPage).toHaveURL(/\/$/);
    });
  });
});
