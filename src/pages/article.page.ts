import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';

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

  getAuthorLink(username: string): Locator {
    return this.page.locator(`.banner .container a.author[href='/profile/${username}']`);
  }

  getTag(tag: string): Locator {
    return this.page.getByText(tag, { exact: true });
  }

  async openForArticle(slug: string): Promise<void> {
    await this.goto(`article/${slug}`);
  }

  async deleteArticle(): Promise<void> {
    await this.articleActions.getByRole('button', { name: 'Delete Article' }).click();
  }
}
