import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { LoginPage } from '@pages/login.page';
import { MainPage } from '@pages/main.page';
import { SettingsPage } from '@pages/settings.page';
import { UrlUtils } from '@utils/url.utils';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login test suite', () => {

  let loginPage: LoginPage;
  let mainPage: MainPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    mainPage = new MainPage(page);
  });

  test('TC-AUTH-03: User Login via UI and Session Persistence', async ({ page, request }) => {
    const username = `pw_${faker.string.alphanumeric(8)}`;
    const email = `pw_user_${faker.string.alphanumeric(6)}@example.com`;
    const password = 'Password123!';

    await test.step('Precondition: register a new user via REST API', async () => {
      const apiResponse = await request.post(`${UrlUtils.BASE_API_URL}/users`, {
        data: {
          user: {
            username: username,
            email: email,
            password: password,
          },
        },
      });
      expect(apiResponse.ok()).toBeTruthy();
    });

    await test.step('Navigate to /login, fill in valid credentials and submit the form', async () => {
      await page.goto(new URL('login', UrlUtils.BASE_URL).toString());

      await loginPage.populateLoginForm(email, password);
      await loginPage.getSubmitButton.click();
    });

    await test.step('Check that the user profile link is visible in the navigation bar', async () => {
      await expect(page).toHaveURL(UrlUtils.BASE_URL);
      await expect(mainPage.getProfileLink(username)).toHaveText(username);
    });

    await test.step('Reload the page and check that the authenticated session is retained', async () => {
      await page.reload();

      await expect(mainPage.getProfileLink(username)).toHaveText(username);
      await expect.poll(async () => {
        return await page.evaluate(() => localStorage.getItem('jwtToken'));
      }, {
        message: 'Auth token should persist in localStorage after reload',
        timeout: 10000,
      }).toBeTruthy();
    });
  });

  test('TC-AUTH-04: User Logout and Session Cleanup', async ({ browser, request }) => {
    const username = `pw_${faker.string.alphanumeric(8)}`;
    const email = `pw_user_${faker.string.alphanumeric(6)}@example.com`;
    const password = 'Password123!';

    const apiResponse = await request.post(`${UrlUtils.BASE_API_URL}/users`, {
      data: {
        user: {
          username,
          email,
          password,
        },
      },
    });
    expect(apiResponse.ok()).toBeTruthy();

    const { user } = await apiResponse.json();
    const authenticatedContext = await browser.newContext({
      storageState: {
        cookies: [],
        origins: [
          {
            origin: new URL(UrlUtils.BASE_URL).origin,
            localStorage: [{ name: 'jwtToken', value: user.token }],
          },
        ],
      },
    });
    const authenticatedPage = await authenticatedContext.newPage();
    const settingsPage = new SettingsPage(authenticatedPage);
    const authenticatedMainPage = new MainPage(authenticatedPage);

    try {
      await test.step('Navigate to settings and log out', async () => {
        await authenticatedPage.goto(new URL('settings', UrlUtils.BASE_URL).toString());

        await settingsPage.logoutButton.click();
      });

      await test.step('Verify the guest navigation and cleared authentication token', async () => {
        await expect(authenticatedPage).toHaveURL(UrlUtils.BASE_URL);
        await expect(authenticatedMainPage.signInLink).toBeVisible();
        await expect(authenticatedMainPage.signUpLink).toBeVisible();
        await expect.poll(async () => {
          return await authenticatedPage.evaluate(() => localStorage.getItem('jwtToken'));
        }, {
          message: 'Auth token should be removed from localStorage after logout',
        }).toBeNull();
      });
    } finally {
      await authenticatedContext.close();
    }
  });
});
