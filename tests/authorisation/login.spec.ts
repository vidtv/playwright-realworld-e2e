import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { LoginPage } from '@pages/login.page';
import { MainPage } from '@pages/main.page';

const API_BASE_URL = 'https://api.realworld.show/api';

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
      const apiResponse = await request.post(`${API_BASE_URL}/users`, {
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
      await page.goto('https://demo.realworld.show/login');

      await loginPage.populateLoginForm(email, password);
      await loginPage.getSubmitButton.click();
    });

    await test.step('Check that the user profile link is visible in the navigation bar', async () => {
      await expect(page).toHaveURL('https://demo.realworld.show/');
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
});
