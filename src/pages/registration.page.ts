import { Page } from "@playwright/test";

export class RegisterPage {
  constructor(private readonly page: Page) {}

  get getUsernameInput() {
    return this.page.locator('input[name="username"]');
  }

  get getEmailInput() {
    return this.page.locator('input[name="email"]');
  }

  get getPasswordInput() {
    return this.page.locator('input[name="password"]');
  }

  get getSubmitButton() {
    return this.page.locator('button[type="submit"]');
  }

  async populateRegistrationForm(username: string, email: string, password: string) {
    await this.getUsernameInput.fill(username);
    await this.getEmailInput.fill(email);
    await this.getPasswordInput.fill(password);
  }
}