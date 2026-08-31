import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export interface PublishedArticleView {
  title: string;
  body: string;
  authorUsername: string;
  tags: string[];
}

export class ArticlePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

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

  async expectArticleVisible(article: PublishedArticleView): Promise<void> {
    await expect(this.getTitleHeading()).toHaveText(article.title);
    await expect(this.getBodyText(article.body)).toBeVisible();
    await expect(this.getAuthorLink(article.authorUsername)).toBeVisible();

    for (const tag of article.tags) {
      await expect(this.getTag(tag)).toBeVisible();
    }
  }
}
