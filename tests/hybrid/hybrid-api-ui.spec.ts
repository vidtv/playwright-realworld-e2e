import { test } from "@fixtures/test.fixture";
import { UserProfilePage } from "@pages/userprofile.page";
import { expect } from "@playwright/test";
import { UrlUtils } from "@utils/url.utils";

test.describe('Hybrid UI-API test suite', () => {
    const ARTICLES_COUNT = 3;
    const createdSlugs: String[] = [];

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

    test('TC-HYB-01: Fast State Setup via API + Fast UI Teardown', async ({ authenticatedUser, authenticatedPage }) => {
        await test.step('Open the user`s profile page and verify that 3 created articles are displayed', async () => {
            const userProfilePage = new UserProfilePage(authenticatedPage);
            await authenticatedPage.goto(new URL(`/profile/${authenticatedUser.username}`, UrlUtils.BASE_URL).toString());

            await expect(userProfilePage.articleCards).toHaveCount(ARTICLES_COUNT);
        })
    })
})