# Playwright Real-World E2E Framework

TypeScript + Playwright end-to-end test framework with Page Object Model, custom fixtures, and environment configuration.

## Project Structure

```
├── src/
│   ├── config/        # Environment and runtime configuration
│   ├── fixtures/      # Custom Playwright test fixtures
│   ├── pages/         # Page Object Model classes
│   └── utils/         # Shared test data and helpers
├── tests/             # Test specifications
├── playwright.config.ts
└── tsconfig.json
```

## Getting Started

```bash
# Install dependencies
npm install

# Install browsers (first time only)
npx playwright install

# Copy environment config
cp .env.example .env

# Run all tests
npm test

# Run tests in headed mode
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Open HTML report
npm run report
```

## Writing Tests

Use the custom fixture to access page objects:

```typescript
import { test, expect } from '../src/fixtures/test.fixture';

test('example', async ({ todoPage }) => {
  await todoPage.open();
  await todoPage.addTodo('My task');
  await todoPage.expectTodoVisible('My task');
});
```

## Configuration

| Variable   | Default                              | Description        |
|------------|--------------------------------------|--------------------|
| `BASE_URL` | `https://demo.playwright.dev/todomvc` | Application URL   |

## Scripts

| Command              | Description                    |
|----------------------|--------------------------------|
| `npm test`           | Run all tests (Chromium only)  |
| `npm run test:all`   | Run across all browser projects|
| `npm run test:headed`| Run with visible browser       |
| `npm run test:ui`    | Open Playwright UI mode        |
| `npm run test:debug` | Run in debug mode              |
| `npm run report`     | Open last HTML report          |
