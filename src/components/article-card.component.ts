import { Locator } from '@playwright/test';

export class ArticleCardComponent {
  constructor(readonly root: Locator) {}

  get self(): Locator {
    return this.root;
  }

  get authorLink(): Locator {
    return this.root.locator('.author');
  }

  get title(): Locator {
    return this.root.getByRole('heading');
  }

  get description(): Locator {
    return this.root.locator('p');
  }

  get favoriteButton(): Locator {
    return this.root.getByRole('button');
  }

  get tags(): Locator {
    return this.root.locator('.tag-default');
  }

  async favorite(): Promise<void> {
    await this.favoriteButton.click();
  }

  async open(): Promise<void> {
    await this.title.click();
  }
}