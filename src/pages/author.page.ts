import { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class AuthorPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    get followButton(): Locator {
        return this.page.locator('app-follow-button button');
    }
}