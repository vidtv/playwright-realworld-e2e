import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.use({ storageState: { cookies: [], origins: [] } });

test('TC-AUTH-01: Successful User Registration', async ({ page }) => {
  const uniqueUsername = faker.internet.username().replace(/[^a-zA-Z0-9]/g, '');
  const uniqueEmail = faker.internet.email().toLowerCase();
  const password = faker.internet.password({ length: 12, memorable: false, pattern: /[A-Z]/, });

  test.step('Populate form on the registration page', async () => {
    await page.goto('https://demo.realworld.show/register');
    await page.fill('input[name="username"]', uniqueUsername);
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
  });

  await expect(page).toHaveURL('https://demo.realworld.show/')
  await expect(page.locator(`a[href='/profile/${uniqueUsername}']`)).toHaveText(uniqueUsername);
});