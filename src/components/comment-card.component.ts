import { Locator } from "@playwright/test";

export class CommentComponent {
    constructor(readonly root: Locator) {}

    getCommentAuthorName(): Locator {
        return this.root.locator('.card-footer').getByRole('link', { name: /^[a-z0-9_-]+$/i });
    }

    getCommentDate(): Locator {
        return this.root.locator('.date-posted');
    }
}