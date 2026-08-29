import { Page } from "@playwright/test";

export class LoginPage {
  constructor(private readonly page: Page) {}

  get getEmailInput() {
    return this.page.locator('input[name="email"]');
  }

  get getPasswordInput() {
    return this.page.locator('input[name="password"]');
  }

  get getSubmitButton() {
    return this.page.locator('button[type="submit"]');
  }

  async populateLoginForm(email: string, password: string) {
    await this.getEmailInput.fill(email);
    await this.getPasswordInput.fill(password);
  }
}
