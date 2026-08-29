import { test as setup, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import * as fs from 'fs';
import * as path from 'path';
import { UrlUtils } from '@utils/url.utils';

const authFile = path.join(__dirname, '../.auth/user.json');

setup('Register a new user via API and persist authentication state', async ({ request, baseURL }) => {
  // 1. Dynamically generate clean, unique user credentials
  const uniqueUsername = `pw_${faker.string.alphanumeric(8)}`;
  const uniqueEmail = `pw_user_${faker.string.alphanumeric(6)}@example.com`;
  const password = 'Password123!';

  // 2. Register user directly via API
  const response = await request.post('/api/users', {
    data: {
      user: {
        username: uniqueUsername,
        email: uniqueEmail,
        password: password,
      },
    },
  });

  // Verify successful creation (201 Created / 200 OK)
  expect(response.ok()).toBeTruthy();

  const responseBody = await response.json();
  const token = responseBody.user.token;

  // 3. Ensure target directory exists
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // 4. Construct storageState with JWT token in localStorage
  const storageState = {
    cookies: [],
    origins: [
      {
        origin: new URL(baseURL || UrlUtils.BASE_URL).origin,
        localStorage: [
          {
            name: 'jwtToken', // Key used by Conduit React / Angular clients
            value: token,
          },
        ],
      },
    ],
  };

  // 5. Save state to disk for dependent test suites
  fs.writeFileSync(authFile, JSON.stringify(storageState, null, 2), 'utf-8');
});
