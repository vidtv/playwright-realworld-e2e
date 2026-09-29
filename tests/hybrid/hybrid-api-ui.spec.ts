import { test } from "@fixtures/test.fixture";
import { UserProfilePage } from "@pages/userprofile.page";
import { expect } from "@playwright/test";
import { UrlUtils } from "@utils/url.utils";
import { z } from "zod";

test.describe('Hybrid UI-API test suite', () => {
    const ARTICLES_COUNT = 3;
    const createdSlugs: string[] = [];

    test.beforeEach( async ({ authorizedRequest }) => {
        const articlePromises = Array.from({ length: ARTICLES_COUNT }, (_, i) =>
            authorizedRequest.post(`${UrlUtils.BASE_API_URL}/articles`, {
                data: {
                    article: {
                        title: `Test Article ${i + 1} ${Date.now()}`,
                        description: `Description ${i + 1}`,
                        body: `Body content ${i + 1}`,
                        tagList: ['automation', 'playwright'],
                    },
                },
            })
        );

        const responses = await Promise.all(articlePromises);

        for (const res of responses) {
            const body = await res.json();
            createdSlugs.push(body.article.slug);
        }
    })

    test.afterEach( async ({ authorizedRequest }) => {
        await Promise.all(
            createdSlugs.map((slug) => authorizedRequest.delete(`${UrlUtils.BASE_API_URL}/articles/${slug}`))
        );

        createdSlugs.length = 0;
    })

    test('TC-HYB-01: Fast state setup via API + fast API teardown', async ({ authenticatedUser, authenticatedPage }) => {
        await test.step('Open the user`s profile page and verify that 3 created articles are displayed', async () => {
            const userProfilePage = new UserProfilePage(authenticatedPage);
            await authenticatedPage.goto(new URL(`/profile/${authenticatedUser.username}`, UrlUtils.BASE_URL).toString());

            await expect(userProfilePage.articleCards).toHaveCount(ARTICLES_COUNT);
        })
    })
})

//  response schemas
const AuthorSchema = z.object({
    username: z.string(),
    bio: z.string().nullable().optional(), // The field may be a string, null, or absent
    image: z.string(),
    following: z.boolean(),
  });
  
  const ArticleSchema = z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    body: z.string().optional(),
    tagList: z.array(z.string()),
    createdAt: z.string(),
    updatedAt: z.string(),
    favorited: z.boolean(),
    favoritesCount: z.number(),
    author: AuthorSchema,
  });
  
  const ArticlesResponseSchema = z.object({
    articles: z.array(ArticleSchema),
    articlesCount: z.number(),
  });

test.describe('API test suite', () => {
    test('TC-HYB-02: API contract & response schema validation', async ({ authorizedRequest }) => {
        await test.step('Retrieve all articles via API with limit parameter and verify that response body matches JSON schema', async () => {
            const articlesLimit = 20;
            const response = await authorizedRequest.get(`${UrlUtils.BASE_API_URL}/articles`, {
                params: { articlesLimit },
            });

            expect(response.status()).toBe(200);
        
            const body = await response.json();
            const parseResult = ArticlesResponseSchema.safeParse(body);

            expect(
                parseResult.success,
                JSON.stringify(parseResult.error?.format(), null, 2)
              ).toBe(true);
            expect(body.articles.length).toBeLessThanOrEqual(articlesLimit);
        })
    })
})
