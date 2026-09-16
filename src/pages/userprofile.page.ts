import { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class UserProfilePage extends BasePage {
    readonly avatarImage = this.page.locator('.user-info img.user-img');
    readonly bioText = this.page.locator('.user-info p');

    constructor(page: Page) {
        super(page);
    }

    get articleCards(): Locator {
        return this.page.locator('app-article-preview');
    }
    
    async isAvatarLoaded(): Promise<boolean> {
        return await this.avatarImage.evaluate((img: HTMLImageElement) => {
          return img.complete && img.naturalWidth > 0;
        });
    }
}