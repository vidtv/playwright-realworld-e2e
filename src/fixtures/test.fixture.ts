import { test as base } from '@playwright/test';
import { TodoPage } from '../pages/todo.page';

type Fixtures = {
  todoPage: TodoPage;
};

export const test = base.extend<Fixtures>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await use(todoPage);
  },
});

export { expect } from '@playwright/test';
