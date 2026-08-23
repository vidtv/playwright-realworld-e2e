import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { RegisterPage } from '@pages/registration.page';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Registration test suite', () => {

  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    
    await page.goto('https://demo.realworld.show/register');
  });

  test('TC-AUTH-01: Successful User Registration', async ({ page }) => {
    const uniqueUsername = faker.internet.username().replace(/[^a-zA-Z0-9]/g, '');
    const uniqueEmail = faker.internet.email().toLowerCase();
    const password = faker.internet.password({ length: 12, memorable: false, pattern: /[A-Z]/, });

    test.step('Populate form on the registration page', async () => {
      await page.goto('https://demo.realworld.show/register');
      
      await registerPage.populateAndSubmitForm(uniqueUsername, uniqueEmail, password);
    });

    await expect(page).toHaveURL('https://demo.realworld.show/')
    await expect(page.locator(`a[href='/profile/${uniqueUsername}']`)).toHaveText(uniqueUsername);
  });
});