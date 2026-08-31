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

  const responseBody: { user: RegisteredUser } = await regResponse.json();
  return responseBody.user;
}

export const test = base.extend<CustomFixtures>({
  authToken: async ({ request }, use) => {
    const user = await registerUser(request);
    await use(user.token);
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

  authenticatedPage: async ({ page, authToken }, use) => {
    await page.addInitScript((token: string) => {
      window.localStorage.setItem('jwtToken', token);
    }, authToken);

    await use(page);
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

    const body: { article: ArticleData } = await response.json();
    const created = body.article;

    await use(created);

    await authorizedRequest.delete(`${UrlUtils.BASE_API_URL}/articles/${created.slug}`);
  },
});
