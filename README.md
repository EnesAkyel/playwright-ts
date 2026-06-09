# Playwright TypeScript Test Automation Framework

![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=Playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

End-to-end and API test suite for [SauceDemo](https://www.saucedemo.com) and [JSONPlaceholder](https://jsonplaceholder.typicode.com), built with Playwright and TypeScript. Covers E2E flows, API + UI hybrid tests, accessibility scanning, and visual regression, with Allure reporting and GitHub Actions CI.

---

## Table of Contents

- [Framework Architecture](#-framework-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Test Coverage](#-test-coverage)
- [Getting Started](#-getting-started)
- [Running Tests](#-running-tests)
- [Allure Reports](#-allure-reports)
- [CI/CD](#-cicd)
- [Design Patterns](#-design-patterns)

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Test Layer                        │
│  E2E Tests │ API+UI Tests │ A11y Tests │ Visual Tests│
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│                  Fixtures Layer                      │
│         Dependency Injection via Playwright          │
│         Fixtures (LoginPage, InventoryPage...)       │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│               Page Object Layer                      │
│    BasePage │ HomePage │ LoginPage │ InventoryPage   │
│             │ CartPage │ CheckoutPage                │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│                 Utilities Layer                      │
│  ApiClient │ DataFactory │ AccessibilityHelper       │
│  VisualHelper │ DebugHelper │ ENV Config             │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [Playwright](https://playwright.dev) | Browser automation |
| [TypeScript](https://www.typescriptlang.org) | Type-safe test code |
| [Faker.js](https://fakerjs.dev) | Dynamic test data generation |
| [axe-core](https://github.com/dequelabs/axe-core) | Accessibility testing |
| [Allure](https://docs.qameta.io/allure/) | HTML test reporting |
| [GitHub Actions](https://github.com/features/actions) | CI/CD pipeline |

---

## Project Structure

```
playwright-ts/
├── src/
│   ├── pages/                  # Page Object Model classes
│   │   ├── BasePage.ts         # Shared page methods
│   │   ├── HomePage.ts         # JSONPlaceholder home page
│   │   └── saucedemo/          # SauceDemo page objects
│   │       ├── LoginPage.ts
│   │       ├── InventoryPage.ts
│   │       ├── CartPage.ts
│   │       └── CheckoutPage.ts
│   ├── tests/                  # Test suites
│   │   ├── accessibility/      # Accessibility tests
│   │   ├── combined/           # API + UI combined tests
│   │   ├── saucedemo/          # E2E tests
│   │   ├── unit/               # Utility unit tests
│   │   ├── visual/             # Visual regression tests
│   │   └── homepage.test.ts    # JSONPlaceholder UI smoke tests
│   └── utils/                  # Utilities and helpers
│       ├── apiClient.ts        # REST API client
│       ├── accessibilityHelper.ts
│       ├── dataFactory.ts      # Faker-based test data
│       ├── debugHelper.ts      # Debugging utilities
│       ├── env.ts              # Environment config
│       ├── fixtures.ts         # Playwright fixtures
│       └── visualHelper.ts     # Screenshot comparison
├── .env.dev                    # Dev environment config
├── .env.staging                # Staging environment config
├── .env.prod                   # Prod environment config
├── playwright.config.ts        # Playwright configuration
├── tsconfig.json               # TypeScript configuration
└── package.json
```

---

## Test Coverage

### E2E Tests — SauceDemo
- ✅ Login with valid credentials
- ✅ Login error handling (invalid, empty credentials)
- ✅ Product inventory display and sorting
- ✅ Add single and multiple items to cart
- ✅ Full checkout flow (login → cart → shipping → confirmation)

### API + UI Combined Tests
- ✅ API returns expected data and UI loads successfully
- ✅ Create, update, and delete posts via API
- ✅ Fetch user and validate their posts
- ✅ Validate all endpoints return HTTP 200
- ✅ Parallel post creation with data integrity checks

### Accessibility Tests
- ✅ Critical violation detection on all pages
- ✅ Serious violation detection
- ✅ Element-level accessibility scanning
- ✅ Known violation exclusion with documentation

### Visual Regression Tests
- ✅ Full page screenshot comparison
- ✅ Element-level screenshot comparison
- ✅ Baseline management

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/playwright-ts.git
cd playwright-ts

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Copy environment file
cp .env.dev .env
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run against a specific environment
npm run test:dev
npm run test:staging
npm run test:prod

# Run by tag
npm run test:smoke        # @smoke — quick sanity on every commit
npm run test:regression   # @regression — full suite
npm run test:api          # @api — API tests only
npm run test:a11y         # @a11y — accessibility tests only
npm run test:unit         # @unit — utility unit tests

# Run a specific test suite
npx playwright test src/tests/saucedemo/
npx playwright test src/tests/accessibility/
npx playwright test src/tests/combined/

# Run on a specific browser
npm run test:chrome
npm run test:firefox

# Run a specific test by name
npx playwright test -g "should complete full checkout flow"

# Run in headed mode (see the browser)
npm run test:headed

# Update visual regression baselines
npm run test:visual:update
```

---

## Reports

Three reporters run on every test execution:

| Reporter | Output | Purpose |
|---|---|---|
| Playwright HTML | `playwright-report/` | Interactive local report — `npm run report` |
| JUnit XML | `test-results/junit.xml` | CI dashboard integration (GitHub Actions, Jenkins) |
| Allure | `allure-results/` | Rich history + trends report |

```bash
# Open Playwright HTML report (after any test run)
npm run report

# Generate and open Allure report
npm run allure:generate
npm run allure:serve
```

---

## CI/CD

Tests run automatically on every push and pull request via **GitHub Actions**:

- Runs on `ubuntu-latest`
- Executes against Chromium and Firefox
- `retries: 2` and `workers: 2` in CI; `retries: 0` locally
- Uploads Playwright HTML report and JUnit XML as build artifacts
- Supports environment-based configuration

---

## Design Decisions

**Page Object Model** — locators and actions live in page classes; tests only call methods, never touch selectors directly.

**Fixture-based DI** — `test.extend()` wires up page objects so each test declares what it needs without any setup boilerplate.

**DataFactory** — Faker.js generates unique test data per run; no hardcoded strings that silently break on env changes.

**Multi-env config** — `.env.dev / .staging / .prod` swap the base URLs so the same suite runs on any environment with one flag.

**ApiClient wrapper** — thin class around Playwright's `APIRequestContext` keeps API calls out of test bodies and makes hybrid tests readable.

---

## Author

**Enes Akyel**  
SDET | QA Automation Engineer  
[LinkedIn](https://www.linkedin.com/in/enes-akyel-2a77a7122/) • [GitHub](https://github.com/EnesAkyel)