import { faker } from '@faker-js/faker';
import { APIRequestContext, Page, test as base } from '@playwright/test';
import { UrlUtils } from '@utils/url.utils';

export interface ArticleData {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
}

interface RegisteredUser {
  username: string;
  email: string;
  password: string;
  token: string;
}

type CustomFixtures = {
  authenticatedUser: RegisteredUser;
  authenticatedPage: Page;
  authToken: string;
  authorizedRequest: APIRequestContext;
  createdArticle: ArticleData;
};

async function registerUser(request: APIRequestContext): Promise<RegisteredUser> {
  const userPayload = {
    user: {
      username: `user_${faker.string.alphanumeric(8)}`,
      email: `user_${faker.string.alphanumeric(6)}@example.com`,
      password: 'Password123!',
    },
  };

  const regResponse = await request.post(`${UrlUtils.BASE_API_URL}/users`, {
    data: userPayload,
  });

  if (!regResponse.ok()) {
    throw new Error(`Failed to register user: ${regResponse.status()} ${await regResponse.text()}`);
  }

  const responseBody: { user: RegisteredUser } = await regResponse.json();
  return responseBody.user;
}

export const test = base.extend<CustomFixtures>({
  authenticatedUser: async ({ request }, use) => {
    const user = await registerUser(request);
    await use(user);
  },

  authenticatedPage: async ({ page, authenticatedUser }, use) => { 
    await page.addInitScript((user) => {
      window.localStorage.clear(); // clear past context
      window.localStorage.setItem('jwtToken', user.token);
    }, authenticatedUser);

    // send a correct username to frontend
    await page.route('**/api/user', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: { 'access-control-allow-origin': '*' },
          body: JSON.stringify({ user: authenticatedUser }),
        });
      } else {
        await route.fallback();
      }
    });

    // mock for comments in order to avoid router crash
    await page.route('**/api/articles/**/comments', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET, POST, OPTIONS',
          'access-control-allow-headers': '*',
        },
        body: JSON.stringify({ comments: [] }),
      });
    });

    await use(page);
  },

  authToken: async ({ authenticatedUser }, use) => {
    await use(authenticatedUser.token);
  },

  authorizedRequest: async ({ playwright, authToken }, use) => {
    // Create a standard context with pre-installed header
    const context = await playwright.request.newContext({
      extraHTTPHeaders: {
        Authorization: `Token ${authToken}`,
      },
    });

    // Transfer native APIRequestContext to tests/other fixtures
    await use(context);

    await context.dispose();
  },

  createdArticle: async ({ authorizedRequest }, use) => {
    const newArticle = {
      article: {
        title: `Test Title ${faker.string.alphanumeric(5)}`,
        description: faker.lorem.sentence(),
        body: faker.lorem.paragraph(),
        tagList: ['automation', 'playwright'],
      },
    };

    const response = await authorizedRequest.post(`${UrlUtils.BASE_API_URL}/articles`, {
      data: newArticle,
    });

    if (!response.ok()) {
      throw new Error(`Failed to create article via API: ${response.status()} ${await response.text()}`);
    }

    const body: { article: ArticleData } = await response.json();
    const created = body.article;

    await use(created);

    await authorizedRequest.delete(`${UrlUtils.BASE_API_URL}/articles/${created.slug}`);
  },
});
