# Test Cases Plan: RealWorld (Conduit) E2E Automation Suite

**Stack:** TypeScript • Playwright • Page Object / Component Model • REST API Fixtures • Network Route Mocking  
**Target Application:** Conduit (RealWorld App)

---

## 1. Authentication & User Management (Auth)

### TC-AUTH-01: Successful User Registration
* **Layer:** UI / E2E
* **Preconditions:** Unique email and username generated dynamically (e.g. via `@faker-js/faker`).
* **Steps:**
  1. Navigate to `/register`.
  2. Enter valid unique `username`, `email`, and `password`.
  3. Click "Sign up".
* **Expected Result:**
  * User is redirected to the home feed.
  * Header displays the registered username.
  * Auth token is stored in `localStorage`.

### TC-AUTH-02: Registration Validation Errors
* **Layer:** UI Negative
* **Preconditions:** Registered user already exists in DB/State.
* **Steps:**
  1. Navigate to `/register`.
  2. Enter existing `email` and `username`.
  3. Click "Sign up".
* **Expected Result:**
  * Inline/top error messages are displayed (e.g., `email has already been taken`, `username has already been taken`).
  * User remains on `/register`.

### TC-AUTH-03: User Login via UI and Session Persistence
* **Layer:** UI / State
* **Preconditions:** User is registered via API.
* **Steps:**
  1. Navigate to `/login`.
  2. Fill in valid credentials.
  3. Submit the form.
* **Expected Result:**
  * User profile link is visible in the navigation bar.
  * Reloading the page retains the authenticated session.

### TC-AUTH-04: User Logout and Session Cleanup
* **Layer:** UI
* **Preconditions:** User is logged in (using `storageState`).
* **Steps:**
  1. Navigate to `/settings`.
  2. Click "Or click here to logout".
* **Expected Result:**
  * User is redirected to the Home page.
  * Navigation bar shows "Sign in" and "Sign up" links.
  * Auth token is purged from `localStorage`.

---

## 2. Article Lifecycle & Feeds (CRUD)

### TC-ART-01: Create a New Article (Happy Path)
* **Layer:** UI / E2E
* **Preconditions:** Authenticated session (`storageState`).
* **Steps:**
  1. Navigate to `/editor`.
  2. Fill in Title, Description, Body (Markdown), and Tags.
  3. Click "Publish Article".
* **Expected Result:**
  * Redirected to `/article/{slug}`.
  * Article title, body, author metadata, and tag list match input.

### TC-ART-02: Article Creation Validation (Mandatory Fields)
* **Layer:** UI Negative
* **Preconditions:** Authenticated session.
* **Steps:**
  1. Navigate to `/editor`.
  2. Leave Title and Body blank, fill only Description.
  3. Click "Publish Article".
* **Expected Result:**
  * Validation errors appear: `title can't be blank`, `body can't be blank`.
  * Article is not published.

### TC-ART-03: Edit Existing Article
* **Layer:** Hybrid (API Setup + UI Action)
* **Preconditions:** Article created via API fixture under current user.
* **Steps:**
  1. Open `/editor/{slug}` for the created article.
  2. Update Title and Body text.
  3. Click "Publish Article".
* **Expected Result:**
  * Article view displays updated content and new slug URL.

### TC-ART-04: Delete Article by Author
* **Layer:** Hybrid (API Setup + UI Action)
* **Preconditions:** Article created via API fixture.
* **Steps:**
  1. Navigate to the article page `/article/{slug}`.
  2. Click the "Delete Article" button.
  3. Handle confirmation dialog if present.
* **Expected Result:**
  * User is redirected to the home feed.
  * Article is no longer listed in "Global Feed" or author's profile.

### TC-ART-05: Global Feed Pagination and Filtering by Popular Tag
* **Layer:** UI
* **Preconditions:** Public view.
* **Steps:**
  1. Navigate to Home `/`.
  2. Click a specific tag in the "Popular Tags" sidebar.
* **Expected Result:**
  * "Global Feed" tab switches to or adds the tagged feed tab.
  * All listed articles contain the selected tag chip.

### TC-ART-06: Your Feed vs Global Feed Visibility
* **Layer:** UI / State
* **Preconditions:** User follows at least one author who has published articles.
* **Steps:**
  1. Navigate to Home `/`.
  2. Switch between "Your Feed" and "Global Feed" tabs.
* **Expected Result:**
  * "Your Feed" displays only articles from followed authors.
  * "Global Feed" displays public articles from all authors.

---

## 3. Comments & Social Engagement

### TC-COM-01: Add Comment to an Article
* **Layer:** Hybrid (API Setup + UI Action)
* **Preconditions:** Article exists (API-created), user authenticated.
* **Steps:**
  1. Navigate to `/article/{slug}`.
  2. Enter text into the comment textarea.
  3. Click "Post Comment".
* **Expected Result:**
  * New comment appears in the comments list with author avatar and timestamp.

### TC-COM-02: Delete Own Comment
* **Layer:** Hybrid (API Setup + UI Action)
* **Preconditions:** Article exists with a comment posted by current user (via API).
* **Steps:**
  1. Navigate to `/article/{slug}`.
  2. Click the trash icon on user's comment card.
* **Expected Result:**
  * Comment element is removed from the DOM.
  * Backend returns 200/204 on DELETE endpoint.

### TC-COM-03: Comment Section for Guest Users (Read-only)
* **Layer:** UI (Unauthenticated)
* **Preconditions:** Article with comments exists.
* **Steps:**
  1. Navigate to `/article/{slug}` as guest.
* **Expected Result:**
  * Comment input form is replaced with "Sign in or sign up to add comments" banner.
  * Existing comments remain readable.

---

## 4. Profile, Following & Favorites

### TC-SOC-01: Favorite / Unfavorite Article
* **Layer:** Hybrid / UI
* **Preconditions:** Article exists by another user, current user authenticated.
* **Steps:**
  1. Open target article or find it in Global Feed.
  2. Click the Favorite (heart) button.
  3. Refresh the page and verify state.
  4. Click Favorite button again to unfavorite.
* **Expected Result:**
  * Favorite count increments by 1; button style changes to active state.
  * Second click decrements count by 1 and resets button style.

### TC-SOC-02: Follow / Unfollow Author
* **Layer:** Hybrid / UI
* **Preconditions:** Author profile exists, current user authenticated.
* **Steps:**
  1. Navigate to author profile `/profile/{username}`.
  2. Click "+ Follow {username}".
  3. Click "Unfollow {username}".
* **Expected Result:**
  * Button label switches to "Unfollow {username}".
  * Clicking again toggles back to "+ Follow {username}".

### TC-SOC-03: Update User Settings (Bio & Avatar)
* **Layer:** UI
* **Preconditions:** Authenticated session.
* **Steps:**
  1. Navigate to `/settings`.
  2. Update Bio and Profile Picture URL.
  3. Click "Update Settings".
* **Expected Result:**
  * Profile page reflects updated bio and avatar image.

---

## 5. Hybrid & API Integration Patterns

### TC-HYB-01: Fast State Setup via API + Fast UI Teardown
* **Layer:** API Fixture + UI Assertions
* **Preconditions:** Reusable API client helper attached to Playwright test fixture.
* **Steps:**
  1. `test.beforeEach`: Create temporary user and 3 articles via `request` API context.
  2. Load user profile on UI.
* **Expected Result:**
  * UI instantly displays all 3 articles in "My Articles" tab without UI creation overhead.
  * `test.afterEach`: Cleanup data via API DELETE requests.

### TC-HYB-02: API Contract & Response Schema Validation
* **Layer:** API
* **Preconditions:** API endpoint `/api/articles`.
* **Steps:**
  1. Send GET request to `/api/articles?limit=10`.
* **Expected Result:**
  * Response status is 200 OK.
  * JSON body matches JSON schema (contains `articles` array, `articlesCount` integer, correct article properties).

---

## 6. Resilience & Network Mocking (`page.route`)

### TC-MOCK-01: Empty Feed UI Resilience (Empty State)
* **Layer:** Network Mocking (`page.route`)
* **Preconditions:** Authenticated user.
* **Steps:**
  1. Intercept `GET **/api/articles*` and return `{ articles: [], articlesCount: 0 }`.
  2. Navigate to Home `/`.
* **Expected Result:**
  * "No articles are here... yet." placeholder message is cleanly rendered.
  * No broken spinners or UI crashes.

### TC-MOCK-02: Server 500 Error Handling & Graceful Degradation
* **Layer:** Network Mocking (`page.route`)
* **Preconditions:** Any route.
* **Steps:**
  1. Intercept `GET **/api/tags` with HTTP 500 Internal Server Error.
  2. Navigate to Home `/`.
* **Expected Result:**
  * Main article feed still loads properly.
  * Tags container displays an appropriate error/empty state without freezing the UI thread.
