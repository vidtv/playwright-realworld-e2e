import { Page } from '@playwright/test';
import { UrlUtils } from '@utils/url.utils';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(new URL(path, UrlUtils.BASE_URL).toString());
  }
}
