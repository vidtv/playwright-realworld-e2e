import { Page } from '@playwright/test';

export class SettingsPage {
  constructor(private readonly page: Page) {}

  get logoutButton() {
    return this.page.getByText('Or click here to logout');
  }
}
