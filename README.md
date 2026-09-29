# Playwright RealWorld E2E

An end-to-end and API-assisted test suite for the [RealWorld Conduit](https://github.com/gothinkster/realworld) application. It uses TypeScript, Playwright Test, Page Objects, reusable components, and custom fixtures to cover user journeys without relying on shared test accounts.

## What is covered

- Registration, login, logout, and persisted sessions
- Article creation, feed interactions, editing, and deletion
- Comments, profiles, following, and favorites
- API setup and cleanup for test preconditions
- Network-mocked empty-feed and API-error states
- Hybrid UI/API scenarios

## Prerequisites

- Node.js 20 or later
- Docker and Docker Compose, to run the bundled application stack

## Quick start

Install the test dependencies and Playwright browsers:

```bash
npm install
npx playwright install
```

Start the bundled RealWorld application in a separate terminal:

```bash
docker compose up --build
```

Create a local environment file for running tests from the host machine:

```bash
cp .env.example .env
```

Set the following values in `.env`:

```dotenv
BASE_URL=http://localhost:4200
API_URL=http://localhost:4000/api
```

Then run the Chromium suite:

```bash
npm test
```

The application is available at `http://localhost:4200` and its API is exposed at `http://localhost:4000/api`. Docker-internal test runs use the `client` and `api` service names automatically.

To stop the application stack while retaining database data:

```bash
docker compose down
```

To also remove the local MongoDB volume:

```bash
docker compose down --volumes
```

## Running tests

| Command | Description |
| --- | --- |
| `npm test` | Run the Chromium project |
| `npm run test:all` | Run every configured Playwright project |
| `npm run test:headed` | Run Chromium with a visible browser |
| `npm run test:ui` | Open Playwright UI mode |
| `npm run test:debug` | Run Chromium in Playwright Inspector/debug mode |
| `npm run report` | Open the latest HTML report |
| `npm run lint` | Lint the TypeScript project |
| `docker compose run --rm e2e` | Run the suite from the Docker `e2e` service |

The Playwright configuration runs tests fully in parallel, captures traces on the first retry, and keeps screenshots and videos for failures. In CI it retries failed tests twice and uses two workers.

## Configuration

| Variable | Host-machine value | Purpose |
| --- | --- | --- |
| `BASE_URL` | `http://localhost:4200` | RealWorld web client URL |
| `API_URL` | `http://localhost:4000/api` | RealWorld API base URL |

The code defaults are Docker-network addresses (`http://client:4200` and `http://api:3000/api`), so set both variables when invoking Playwright directly on your machine. `.env` is ignored by Git; use `.env.example` as the starting point.

## Project structure

```text
src/
├── components/       Reusable UI component objects
├── fixtures/         Custom Playwright fixtures and API-backed data setup
├── pages/            Page Object Model classes
└── utils/            URL and shared utilities
tests/
├── articles/         Article, feed, and comment scenarios
├── authorisation/    Registration and login scenarios
├── hybrid/            Combined API and UI scenarios
├── mocking/           Route-mocked resilience scenarios
└── social/            Profile, follow, and favorite scenarios
app/                  Bundled RealWorld client and API applications
docker-compose.yml    Local app, MongoDB, and optional E2E services
playwright.config.ts  Playwright projects and runtime settings
test-cases-plan.md    Documented test coverage plan
```

## Test design

Tests import the project fixture rather than Playwright's base `test` object:

```ts
import { expect, test } from '../../src/fixtures/test.fixture';

test('creates an article', async ({ authenticatedPage, authenticatedUser }) => {
  // Use page objects to act on the UI.
  // Keep assertions in this spec file.
});
```

The fixture creates a unique user with Faker for each authenticated test and exposes:

- `authenticatedUser` and `authToken` for a newly registered user
- `authenticatedPage` with the user's JWT injected before navigation
- `authorizedRequest` for authenticated API setup and cleanup
- `createdArticle` and `createdComment` for disposable API-created test data

Keep UI interaction in `src/pages` or `src/components`. Specs should stay declarative: use the page objects to act, then make web-first `expect` assertions directly in the spec. Avoid fixed waits; await Playwright actions and assertions instead.

## Reports and artifacts

After a run, open the HTML report with `npm run report`. Failure artifacts are written to `test-results/`, and the HTML report is written to `playwright-report/`; both are ignored by Git.
