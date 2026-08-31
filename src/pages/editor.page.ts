import { Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export interface ArticleFormData {
  title: string;
  description: string;
  body: string;
  tags: string[];
}

export class EditorPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get titleInput() {
    return this.page.getByPlaceholder('Article Title');
  }

  get descriptionInput() {
    return this.page.getByPlaceholder("What's this article about?");
  }

  get bodyInput() {
    return this.page.getByPlaceholder('Write your article (in markdown)');
  }

  get tagsInput() {
    return this.page.getByPlaceholder('Enter tags');
  }

  get publishButton() {
    return this.page.getByRole('button', { name: 'Publish Article', exact: true });
  }

  async open(): Promise<void> {
    await this.goto('editor');
  }

  async fillArticleForm(article: ArticleFormData): Promise<void> {
    await this.titleInput.fill(article.title);
    await this.descriptionInput.fill(article.description);
    await this.bodyInput.fill(article.body);

    for (const tag of article.tags) {
      await this.tagsInput.fill(tag);
      await this.tagsInput.press('Enter');
    }
  }

  async publishArticle(): Promise<void> {
    await this.publishButton.click();
  }
}
