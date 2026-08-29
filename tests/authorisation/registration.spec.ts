import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { RegisterPage } from '@pages/registration.page';
import { MainPage } from '@pages/main.page';
import { UrlUtils } from '@utils/url.utils';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Registration test suite', () => {

  let registerPage: RegisterPage;
  let mainPage: MainPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    mainPage = new MainPage(page);

    await page.goto(new URL('register', UrlUtils.BASE_URL).toString());
  });

  test('TC-AUTH-01: Successful User Registration', async ({ page }) => {
    const uniqueUsername = faker.internet.username().replace(/[^a-zA-Z0-9]/g, '');
    const uniqueEmail = faker.internet.email().toLowerCase();
    const password = faker.internet.password({ length: 12, memorable: false, pattern: /[A-Z]/, });

    await test.step('Populate new user registration form, click "Sign Up" button and check that main page is opened and username is displayed in the header', async () => {
      await registerPage.populateRegistrationForm(uniqueUsername, uniqueEmail, password);
      await registerPage.getSubmitButton.click();
  
      await expect(page).toHaveURL(UrlUtils.BASE_URL)
      await expect(mainPage.getProfileLink(uniqueUsername)).toHaveText(uniqueUsername);
    })

    await test.step('Check that JWT token is stored in localStorage after registration', async () => {
      await expect.poll(async () => {
        return await page.evaluate(() => localStorage.getItem('jwtToken'));
      }, {
        message: 'Auth token should be stored in localStorage after registration',
        timeout: 10000,
      }).toBeTruthy();
    })
  });

  test('TC-AUTH-02: Registration Form Validation (Mandatory Fields & Invalid Format)', async ({ }) => {
    await test.step('Open the registration page, do not populate any of fields and check that Sign Up button is disabled', async () => {
      expect(registerPage.getSubmitButton).toBeDisabled;
    });

    await test.step('Populate Username and Email and leave Password field empty, and check that Sign Up button is still disabled', async () => {
      const testUsername = faker.internet.username().replace(/[^a-zA-Z0-9]/g, '');
      const testEmail = faker.internet.email().toLowerCase();

      await registerPage.getUsernameInput.fill(testUsername);
      await registerPage.getEmailInput.fill(testEmail);

      expect(registerPage.getSubmitButton).toBeDisabled;
    })
  });
});
