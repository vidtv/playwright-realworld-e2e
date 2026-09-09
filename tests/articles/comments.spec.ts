import { expect } from "@playwright/test";
import { test } from "@fixtures/test.fixture";
import { ArticlePage } from "@pages/article.page";
import { MainPage } from "@pages/main.page";
import { faker } from "@faker-js/faker";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Article comments suite', () => {
    let articlePage: ArticlePage;
    let mainPage: MainPage;

    test.beforeEach(async ({ authenticatedPage }) => {
        articlePage = new ArticlePage(authenticatedPage);
        mainPage = new MainPage(authenticatedPage);
    });

    test('TC-COM-01: Add Comment to an Article', async ({ authenticatedUser, createdArticle }) => {
        await test.step('Navigate to the created article, enter text into the comment textarea, click `Post Comment` button and verify date and username of the new comment', async () => {
          await articlePage.openForArticle(createdArticle.slug);

          await articlePage.getCommentTextarea().fill(faker.lorem.paragraph());
          await articlePage.getPostCommentButton().click();

          const todayFormatted = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }).format(new Date());

          await expect(articlePage.getCommentCardAt(0).getCommentDate()).toHaveText(todayFormatted);
          await expect(articlePage.getAuthorLink()).toHaveText(authenticatedUser.username);
        })
    })
})