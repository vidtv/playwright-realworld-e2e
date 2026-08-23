import { Page } from "@playwright/test";

export class RegisterPage {
  constructor(private readonly page: Page) {}

  async getUsernameInput() {
    return this.page.locator('input[name="username"]');
  }

  async getEmailInput() {
    return this.page.locator('input[name="email"]');
  }

  async getPasswordInput() {
    return this.page.locator('input[name="password"]');
  }

  async getSubmitButton() {
    return this.page.locator('button[type="submit"]');
  }

  async populateAndSubmitForm(username: string, email: string, password: string) {
    await (await this.getUsernameInput()).fill(username);
    await (await this.getEmailInput()).fill(email);
    await (await this.getPasswordInput()).fill(password);
    await (await this.getSubmitButton()).click();
  }
}