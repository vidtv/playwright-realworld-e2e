import { Locator, Page } from '@playwright/test';
import { ArticleCardComponent } from '../components/article-card.component';
import { BasePage } from './base.page';

export class MainPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get popularTags(): Locator {
    return this.page.getByText('Popular Tags', { exact: true }).locator('..').getByRole('link');
  }

  get articleCards(): Locator {
    return this.page.locator('app-article-preview');
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  async openYourFeed(): Promise<void> {
    await this.goto('/?feed=following');
  }

  async selectPopularTag(tag: string): Promise<void> {
    await this.popularTags.getByText(tag, { exact: true }).click();
  }

  getTaggedFeedTab(tag: string): Locator {
    return this.page
      .getByRole('link', { name: 'Global Feed', exact: true })
      .locator('..')
      .locator('..')
      .getByRole('listitem')
      .filter({ hasText: tag });
  }

  getProfileLink(username: string): Locator {
    return this.page.locator(`a[href='/profile/${username}']`);
  }

  get signInLink() {
    return this.page.getByRole('link', { name: 'Sign in', exact: true });
  }

  get signUpLink() {
    return this.page.getByRole('link', { name: 'Sign up', exact: true });
  }

  getArticleCard(slug: string): ArticleCardComponent {
    return new ArticleCardComponent(this.page.locator(`app-article-preview:has(a.preview-link[href='/article/${slug}'])`));
  }

  getArticleCardAt(index: number): ArticleCardComponent {
    return new ArticleCardComponent(this.articleCards.nth(index));
  }
}
