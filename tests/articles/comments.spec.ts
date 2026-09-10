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

    test('TC-COM-02: Delete Own Comment', async ({ authenticatedPage, createdArticle, createdComment }) => {
        const commentCard = articlePage.getCommentByText(createdComment.body);

        await test.step('Navigate to the created article and check that the created comment and delete button are displayed', async () => {
            await articlePage.openForArticle(createdArticle.slug);
            await expect(commentCard.getSelf()).toBeVisible();
            await expect(commentCard.getDeleteButton()).toBeVisible();
        })

        await test.step('Click the delete button on user`s comment card and verify backend response that the comment is deleted', async () => {
            const [response] = await Promise.all([
                authenticatedPage.waitForResponse(
                    (res) => res.url().includes(`/api/articles/${createdArticle.slug}/comments/`) && res.request().method() === 'DELETE'
                ),
                commentCard.getDeleteButton().click(),
            ])
            expect([200, 204]).toContain(response.status());

            await expect(commentCard.getSelf()).toBeHidden();
        })
    })
})