import { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import { CommentComponent } from '../components/comment-card.component';

export class ArticlePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly articleActions: Locator = this.page.locator('.article-actions');

  getTitleHeading(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  getBodyText(body: string): Locator {
    return this.page.getByText(body, { exact: true });
  }

  getAuthorLink(): Locator {
    return this.page.locator(`.banner .container a.author`);
  }

  getTag(tag: string): Locator {
    return this.page.getByText(tag, { exact: true });
  }

  getFollowButton(): Locator {
    return this.page.locator('.article-actions app-follow-button');
  }

  getCommentTextarea(): Locator {
    return this.page.locator('.comment-form textarea[placeholder="Write a comment..."]');
  }

  getPostCommentButton(): Locator {
    return this.page.locator('.comment-form button[type="submit"]');
  }

  getCommentCards(): Locator {
    return this.page.locator('app-article-comment');
  }

  getCommentCardAt(index: number): CommentComponent {
    return new CommentComponent(this.getCommentCards().nth(index));
  }

  getSignInOrSignUpBanner(): Locator {
    return this.page.getByText('Sign in or sign up to add comments on this article.');
  }

  async openForArticle(slug: string): Promise<void> {
    await this.goto(`article/${slug}`);
  }

  async deleteArticle(): Promise<void> {
    await this.articleActions.getByRole('button', { name: 'Delete Article' }).click();
  }

  getCommentByText(commentText: string): CommentComponent {
    return new CommentComponent(this.getCommentCards().filter({ hasText : commentText }));
  } 
}
