import { test } from "@fixtures/test.fixture";
import { ArticlePage } from "@pages/article.page";
import { AuthorPage } from "@pages/author.page";
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

    test('TC-SOC-02: Follow / Unfollow Author', async ({ authenticatedPage }) => {
        const authorPage = new AuthorPage(authenticatedPage);

        await test.step('Navigate to the main page, open the first article`s author, click `Follow` button on the author`s page and check that the button title changed', async () => {
            await mainPage.open();
            await mainPage.getArticleCardAt(0).authorLink.click();

            await authorPage.followButton.click();
            await expect(authorPage.followButton).toContainText('Unfollow');
        })

        await test.step('Click `Unfollow` button on the author`s page and check that the button title changed back', async () => {
            await authorPage.followButton.click();
            await expect(authorPage.followButton).toContainText('Follow');
        })
    })
})