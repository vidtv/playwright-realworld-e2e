import { Locator, Page } from '@playwright/test';
import { ArticleCardComponent } from '../components/article-card.component';

export class MainPage {
  constructor(private readonly page: Page) {}

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
}
