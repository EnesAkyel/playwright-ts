# Playwright TypeScript Test Automation Framework

![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=Playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

End-to-end, API, accessibility, visual regression, and performance test suite for [SauceDemo](https://www.saucedemo.com) and [JSONPlaceholder](https://jsonplaceholder.typicode.com), built with Playwright and TypeScript.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Test Coverage](#test-coverage)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Reports](#reports)
- [CI/CD](#cicd)
- [Design Decisions](#design-decisions)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Test Layer                              │
│  E2E │ Checkout Validation │ Cart │ Popup │ API+UI │ A11y │     │
│  Keyboard │ Performance │ Visual │ Network │ Auth │ Unit        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                       Fixtures Layer                             │
│         Playwright test.extend() — dependency injection          │
│         for page objects, API client, and auth state            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    Page Object Layer                              │
│  BasePage │ HomePage │ LoginPage │ InventoryPage                 │
│  CartPage │ CheckoutPage                                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      Utilities Layer                              │
│  ApiClient │ DataFactory │ AccessibilityHelper │ VisualHelper    │
│  SummaryReporter │ DebugHelper │ ENV Config                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [Playwright](https://playwright.dev) | Browser automation + API testing |
| [TypeScript](https://www.typescriptlang.org) | Type-safe test code |
| [Faker.js](https://fakerjs.dev) | Dynamic test data generation |
| [axe-core](https://github.com/dequelabs/axe-core) | Accessibility scanning |
| [Allure](https://docs.qameta.io/allure/) | Rich HTML reporting with history |
| [GitHub Actions](https://github.com/features/actions) | CI/CD pipeline |

---

## Project Structure

```
playwright-ts/
├── src/
│   ├── pages/                       # Page Object Model
│   │   ├── BasePage.ts              # Shared navigation + wait methods
│   │   ├── HomePage.ts
│   │   └── saucedemo/
│   │       ├── LoginPage.ts
│   │       ├── InventoryPage.ts
│   │       ├── CartPage.ts
│   │       └── CheckoutPage.ts
│   ├── reporters/
│   │   └── SummaryReporter.ts       # Custom reporter — duration table + summary.json
│   ├── tests/
│   │   ├── accessibility/
│   │   │   └── accessibility.test.ts  # axe-core scans + keyboard navigation
│   │   ├── combined/
│   │   │   └── apiAndUi.test.ts       # API + UI hybrid tests
│   │   ├── network/
│   │   │   └── networkMocking.test.ts # Request interception + mocking
│   │   ├── performance/
│   │   │   └── performance.test.ts    # Navigation timing + JS heap budgets
│   │   ├── saucedemo/
│   │   │   ├── e2e.test.ts            # E2E checkout + cart removal
│   │   │   ├── checkout-validation.test.ts  # Negative form validation
│   │   │   ├── login.test.ts
│   │   │   ├── popup.test.ts          # Multi-tab / popup handling
│   │   │   └── authPersistence.test.ts
│   │   ├── setup/
│   │   │   └── auth.setup.ts          # One-time auth state capture
│   │   ├── unit/
│   │   │   └── dataFactory.test.ts
│   │   ├── visual/
│   │   │   └── visual.test.ts         # Screenshot baseline comparison
│   │   └── homepage.test.ts
│   └── utils/
│       ├── apiClient.ts               # Typed REST client
│       ├── accessibilityHelper.ts
│       ├── dataFactory.ts             # Faker-based builders
│       ├── debugHelper.ts
│       ├── env.ts                     # Multi-env config with validation
│       ├── fixtures.ts                # Playwright fixture definitions
│       └── visualHelper.ts
├── .github/workflows/
│   ├── playwright.yml                 # PR + push: full regression on Chromium
│   ├── scheduled.yml                  # Nightly regression on Chromium + Firefox
│   └── update-snapshots.yml           # Manual: regenerate Linux visual baselines
├── .env.dev / .env.staging / .env.prod
├── .nvmrc                             # Node 24
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## Test Coverage

### E2E — SauceDemo (`@e2e @regression`)
- Full checkout flow with `test.step()` for structured reporting
- Smoke test using `expect.soft()` across multiple UI landmarks
- Product sorting (price low→high, high→low)
- Add single and multiple items to cart

### Checkout Validation (`@regression`)
- Empty form submission — error message assertion
- Missing last name and missing zip code errors
- Error clears after correcting fields
- Continue shopping navigation flow

### Cart Item Removal (`@regression`)
- Remove single item — badge disappears
- Badge decrements when one of many items removed
- `expect().toPass()` polling for async badge state
- Re-add item after removal
- Cart contents verified after partial removal

### Multi-Tab / Popup (`@regression`)
- `page.waitForEvent('popup')` for Twitter / Facebook / LinkedIn footer links
- Original page state preserved after popup closes

### API + UI Combined (`@regression`)
- Validate API responses and UI state in a single test
- Create, update, fetch posts via JSONPlaceholder API
- Endpoint health check across all resources

### Network Mocking (`@regression`)
- Mock GET /posts with synthetic data
- Intercept POST body and assert payload
- Simulate 500 and 404 responses
- Block analytics requests
- Add artificial latency

### Accessibility (`@a11y @regression`)
- axe-core scans on all pages with impact-level filtering
- Known violation exclusion with documented rationale
- Keyboard Tab order through login form
- Keyboard-only login flow (no mouse)

### Performance (`@performance @regression`)
- `performance.getEntriesByType('navigation')` — DOMContentLoaded and load budgets
- `performance.memory` — JS heap size budget (Chromium)
- End-to-end checkout duration threshold

### Visual Regression (`@visual @regression`)
- Full-page and element-level baseline comparison
- OS-specific baselines (darwin / linux)
- `maxDiffPixelRatio` tolerance for rendering noise

### Auth Persistence
- Storagestate reuse — inventory loads without login
- Session cookie validation

---

## Getting Started

### Prerequisites

- Node.js 24+
- npm 10+

```bash
# Use the correct Node version (if using nvm)
nvm use
```

### Installation

```bash
git clone https://github.com/EnesAkyel/playwright-ts.git
cd playwright-ts

npm install
npx playwright install
```

### Environment Setup

The framework resolves config by `ENV` variable (`dev` / `staging` / `prod`).  
Local overrides go in `.env.local` (gitignored).

```bash
# .env.local
BASE_URL=https://jsonplaceholder.typicode.com
SAUCE_URL=https://www.saucedemo.com
SAUCE_USERNAME=standard_user
SAUCE_PASSWORD=secret_sauce
TIMEOUT=30000
```

---

## Running Tests

```bash
# All tests
npm test

# By environment
npm run test:dev
npm run test:staging
npm run test:prod

# By tag
npm run test:smoke        # Quick sanity — runs on every commit
npm run test:regression   # Full suite
npm run test:api          # API tests only
npm run test:a11y         # Accessibility tests only
npm run test:unit         # Unit tests only

# By browser
npm run test:chrome
npm run test:firefox

# Specific suite
npx playwright test src/tests/saucedemo/
npx playwright test src/tests/performance/

# By name
npx playwright test -g "should complete full checkout flow"

# Headed (watch the browser)
npm run test:headed

# Update visual baselines (local)
npm run test:visual:update
```

---

## Reports

Four reporters run on every test execution:

| Reporter | Output | Purpose |
|---|---|---|
| Playwright HTML | `playwright-report/` | Interactive local report — `npm run report` |
| JUnit XML | `test-results/junit.xml` | CI dashboard integration |
| Allure | `allure-results/` | Rich history + trends + severity breakdown |
| SummaryReporter | `test-results/summary.json` | Duration table, top 5 slowest tests, console summary |

```bash
# Playwright HTML report
npm run report

# Allure report
npm run allure:generate
npm run allure:serve
```

Allure reports include `epic`, `feature`, `story`, and `severity` labels on every test for structured navigation.

---

## CI/CD

### `playwright.yml` — PR and push
- Triggers on every pull request and push to `main`
- Runs full `@regression` suite on Chromium
- Uploads HTML report and JUnit XML as artifacts
- Generates Allure report as a separate job

### `scheduled.yml` — Nightly regression
- Runs at 02:00 UTC daily
- Matrix: Chromium + Firefox
- Creates a GitHub issue on failure for visibility

### `update-snapshots.yml` — Manual baseline update
- Triggered manually from the Actions tab
- Generates Linux visual baselines on `ubuntu-latest`
- Uploads snapshots as a downloadable artifact to commit into the repo

---

## Design Decisions

**Page Object Model** — locators and actions live in page classes; tests call methods, never touch selectors directly. Keeps tests readable and locators maintainable in one place.

**Fixture-based DI** — `test.extend()` wires up page objects so each test declares what it needs with no setup boilerplate. Fixtures compose cleanly for complex scenarios.

**DataFactory** — Faker.js generates unique test data per run. No hardcoded strings that silently break across environments or parallel runs.

**Multi-env config** — `.env.dev / .staging / .prod` swap URLs with one flag. `.env.local` allows personal overrides without touching shared config.

**Soft assertions** — `expect.soft()` in smoke tests lets all checks run before failing, giving a complete picture of what's broken in a single pass.

**test.step()** — complex flows are broken into named steps that surface in Allure and HTML reports, making failure diagnosis faster.

**expect().toPass()** — used instead of manual `waitForFunction` for async state polling. Cleaner and respects Playwright's retry-ability model.

**Custom SummaryReporter** — prints a duration table and top 5 slowest tests to stdout and writes `test-results/summary.json`. Useful for spotting performance regressions in CI logs without opening the full report.

**Visual regression strategy** — OS-specific baselines (`-darwin.png`, `-linux.png`) committed per platform. Full-page screenshots use `maxDiffPixelRatio` tolerance for rendering noise; element screenshots use a tighter `maxDiffPixels` budget.

**ApiClient wrapper** — thin class around Playwright's `APIRequestContext`. Keeps API calls out of test bodies and makes hybrid API + UI tests readable.

---

## Author

**Enes Akyel**
SDET | QA Automation Engineer
[LinkedIn](https://www.linkedin.com/in/enes-akyel-2a77a7122/) • [GitHub](https://github.com/EnesAkyel)
