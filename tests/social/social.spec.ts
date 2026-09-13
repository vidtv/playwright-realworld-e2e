import { test } from "@fixtures/test.fixture";
import { ArticlePage } from "@pages/article.page";
import { MainPage } from "@pages/main.page";
import { expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Profile, Following & Favorites test suite', () => {
    let mainPage: MainPage;
    let articlePage: ArticlePage;

    test.beforeEach( async ({ authenticatedPage }) => {
        mainPage = new MainPage(authenticatedPage);
        articlePage = new ArticlePage(authenticatedPage);
    })

    test('TC-SOC-01: Favorite / Unfavorite Article', async () => {
        let initialCounter : number;
        await test.step('Navigate to the main page, open the first article from the feed', async () => {
            await mainPage.open();
            await mainPage.getArticleCardAt(0).open();

            initialCounter = await articlePage.getFavoriteButtonCounter();
        })

        await test.step('Click Favorite button and check that followers counter has incremented and the button title changed', async () => {
            await articlePage.getFavoriteButton().click();

            const expectedCount = initialCounter + 1;
            await expect(articlePage.getFavoriteButton()).toContainText(`Unfavorite Article (${expectedCount})`);
        })

        await test.step('Click Unfavorite button and check followers counter has decremented and the button title changed back', async () => {
            await articlePage.getFavoriteButton().click();

            await expect(articlePage.getFavoriteButton()).toContainText(`Favorite Article (${initialCounter})`);
        })
    })
})