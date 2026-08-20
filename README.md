# Playwright TypeScript Test Automation Framework

![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=Playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

End-to-end, API, accessibility, visual regression, and performance test suite for [movie-catalog-ui](https://github.com/EnesAkyel/movie-catalog-ui) (backed by [movie-catalog-api](https://github.com/EnesAkyel/movie-catalog-api)), built with Playwright and TypeScript.

> **Status:** infrastructure (fixtures, page objects, auth setup, data factory, API client) is in place; test specs are being ported in from [`docs/playwright-test-plan.md`](https://github.com/EnesAkyel/movie-catalog-ui/blob/main/docs/playwright-test-plan.md) in movie-catalog-ui, section by section.

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
│                          Test Layer                             │
│  Auth │ List │ Add/Edit Movie │ Movie Detail │ Error Popup      │
│  A11y │ Network │ Performance │ Visual │ Cross-cutting NFRs     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                       Fixtures Layer                            │
│         Playwright test.extend() - dependency injection         │
│         for page objects, API client, and auth state            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    Page Object Layer                            │
│  BasePage │ LoginPage │ ListPage │ AddMoviePage                 │
│  MovieDetailPage │ ErrorPopup                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      Utilities Layer                            │
│  ApiClient │ DataFactory │ AccessibilityHelper │ VisualHelper   │
│  SummaryReporter │ DebugHelper │ ENV Config                     │
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
| [ESLint + typescript-eslint](https://typescript-eslint.io) | Static analysis with Playwright-specific rules |
| [Prettier](https://prettier.io) | Opinionated code formatting |
| [@playwright/mcp](https://github.com/microsoft/playwright-mcp) | MCP server - AI agent browser automation (in progress) |
| [GitHub Actions](https://github.com/features/actions) | CI/CD pipeline |

---

## Project Structure

```
playwright-ts/
├── src/
│   ├── pages/                       # Page Object Model
│   │   ├── BasePage.ts              # Shared navigation + wait methods
│   │   └── moviecatalog/
│   │       ├── LoginPage.ts
│   │       ├── ListPage.ts
│   │       ├── AddMoviePage.ts
│   │       ├── MovieDetailPage.ts
│   │       └── ErrorPopup.ts        # Component object - global error popup
│   ├── reporters/
│   │   └── SummaryReporter.ts       # Custom reporter - duration table + summary.json
│   ├── tests/
│   │   ├── setup/
│   │   │   └── moviecatalog.auth.setup.ts  # One-time auth state capture
│   │   └── moviecatalog/            # Spec files land here, ported from the
│   │                                 # movie-catalog-ui test plan section by section
│   └── utils/
│       ├── apiClient.ts               # Typed REST client for movie-catalog-api
│       ├── accessibilityHelper.ts
│       ├── dataFactory.ts             # Faker-based movie/studio builders
│       ├── debugHelper.ts
│       ├── env.ts                     # Config from .env.local, validated at startup
│       ├── fixtures.ts                # Playwright fixture definitions
│       └── visualHelper.ts
├── scripts/
│   └── redact-secrets.sh              # Strips credentials from CI report/trace artifacts
├── .github/
│   ├── actions/
│   │   ├── start-api/                 # Boots movie-catalog-api via Docker Compose
│   │   └── boot-stack/                # start-api + build/serve movie-catalog-ui
│   └── workflows/
│       ├── build-api.yml              # Reusable: builds the movie-catalog-api JAR
│       ├── playwright.yml             # PR + push: @regression (includes @smoke), sharded
│       ├── scheduled.yml              # Nightly regression on Chromium + Firefox
│       └── update-snapshots.yml       # Manual: regenerate Linux visual baselines
├── .env.local                         # Gitignored - the only env file
├── .nvmrc                             # Node 24
├── eslint.config.mjs                  # ESLint 9 flat config with playwright + typescript rules
├── .prettierrc                        # Formatting: 4-space indent, single quotes, trailing commas
├── Dockerfile                         # Node 24 + Playwright browsers - fully self-contained test runner
├── docker-compose.yml                 # Mounts output dirs and injects env vars for local Docker runs
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## Test Coverage

The full case list - one per distinct Playwright technique the suite is meant to demonstrate - lives in [`docs/playwright-test-plan.md`](https://github.com/EnesAkyel/movie-catalog-ui/blob/main/docs/playwright-test-plan.md) in movie-catalog-ui, so it stays next to the app it describes. It covers:

- **Authentication & session** - login, `authGuard` redirects, `authInterceptor` 401 handling, `storageState` persistence
- **Movie list** - debounced search (`page.clock`), filters, sorting, pagination, delete + auto-dismissing toast, data-driven genre navigation
- **Add / edit movie** - client + server-side validation (`expect.soft()`, mocked 400/409), successful submit, visual regression on the form grid
- **Movie detail** - studio-name resolution, mocked 404, layout regression via `locator.boundingBox()`
- **Global error popup** - mocked 4XX/5XX, the 401-vs-other-errors asymmetry in `authInterceptor`
- **Accessibility** - axe-core scans (page + element level), keyboard-only flows
- **Network mocking depth** - `route.abort()`, wildcard patterns, request spy/count, artificial latency
- **Performance budgets** - navigation timing, JS heap (Chromium), end-to-end journey timing
- **Cross-cutting NFRs** - multi-browser parity, `page.on('dialog')` regression guard

Tag conventions carried over from the previous suite: `@smoke`, `@regression`, `@api`, `@a11y`, `@visual`, `@unit`.

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

Config lives in `.env.local` (gitignored) - there's no dev/staging/prod switching. Both the local run and CI point at a `movie-catalog-ui` + `movie-catalog-api` instance running on `localhost` (in CI, the stack is built and started fresh in the runner - see [CI/CD](#cicd)).

```bash
# .env.local
BASE_URL=http://localhost:4200
API_URL=http://localhost:8080/api/v1
MOVIE_CATALOG_USERNAME=<a valid movie-catalog-api user>
MOVIE_CATALOG_PASSWORD=<that user's password>
TIMEOUT=30000
```

`BASE_URL` points at movie-catalog-ui, `API_URL` at movie-catalog-api directly (used by `ApiClient` and by the auth-setup project's UI login).

---

## Running Tests

```bash
# All tests
npm test

# By tag
npm run test:smoke        # Quick sanity - runs on every commit
npm run test:regression   # Full suite
npm run test:api          # API tests only
npm run test:a11y         # Accessibility tests only
npm run test:unit         # Unit tests only

# By browser
npm run test:chrome
npm run test:firefox

# Specific suite
npx playwright test src/tests/moviecatalog/

# By name
npx playwright test -g "valid login navigates to the movie list"

# Headed (watch the browser)
npm run test:headed

# Update visual baselines (local)
npm run test:visual:update

# Visual tests only (excluded from regression suite)
npm run test:visual

# Code quality
npm run lint          # ESLint
npm run lint:fix      # ESLint with auto-fix
npm run format        # Prettier
npm run format:check  # Prettier check (CI-safe)
```

### Running with Docker

```bash
# Build the image
docker compose build

# Run the full regression suite (results land in playwright-report/ and allure-results/)
docker compose --env-file .env.local run -T --rm playwright

# Run a specific tag
docker compose --env-file .env.local run -T --rm playwright ./node_modules/.bin/playwright test --grep @smoke

# Run a specific file
docker compose --env-file .env.local run -T --rm playwright ./node_modules/.bin/playwright test src/tests/moviecatalog/

# Override browser
docker compose --env-file .env.local run -T --rm playwright ./node_modules/.bin/playwright test --project=firefox
```

`--env-file .env.local` feeds credentials to the container. `-T` disables pseudo-TTY allocation so output streams to the terminal correctly in non-interactive shells.

---

## Reports

Four reporters run on every test execution:

| Reporter | Output | Purpose |
|---|---|---|
| Playwright HTML | `playwright-report/` | Interactive local report - `npm run report` |
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

## Checking for Dependency Upgrades

```bash
# List outdated npm packages (current vs. wanted vs. latest)
npm outdated

# Explain why a package is pinned to its current range (peer dependency chain)
npm explain <package>

# Bump Playwright and re-download matching browser binaries together
npm install -D @playwright/test@latest
npx playwright install --with-deps
```

---

## CI/CD

### `playwright.yml` - PR and push
- Triggers on every pull request and push to `main`
- `lint` job runs ESLint + Prettier check first. Blocks tests on failure
- `test` job splits the `@regression` suite across **3 parallel shards** on Chromium
- Each shard uploads its own Allure results and JUnit XML as artifacts
- `allure-report` job merges all shard results, restores history from the previous run for trend charts, and uploads the generated report

### `publish-report` job - GitHub Pages
- Runs after `allure-report` on pushes to `main` only
- Deploys the generated Allure report to GitHub Pages for persistent public access

### `update-snapshots.yml` - Manual baseline update
- Triggered manually from the Actions tab
- Generates Linux visual baselines on `ubuntu-latest`
- Uploads snapshots as a downloadable artifact to commit into the repo

---

## Design Decisions

**Page Object Model** - locators and actions live in page classes; tests call methods, never touch selectors directly. Keeps tests readable and locators maintainable in one place.

**Fixture-based DI** - `test.extend()` wires up page objects so each test declares what it needs with no setup boilerplate. Fixtures compose cleanly for complex scenarios.

**DataFactory** - Faker.js generates unique test data per run. No hardcoded strings that silently break across environments or parallel runs.

**No environment switching** - there's no deployed dev/staging/prod for this project, so the suite doesn't pretend there is one. `.env.local` holds config for local runs; CI builds and boots `movie-catalog-api` + `movie-catalog-ui` fresh in the runner and points at `localhost` (see `boot-stack`). One less axis of config drift to debug.

**Soft assertions** - `expect.soft()` in smoke tests lets all checks run before failing, giving a complete picture of what's broken in a single pass.

**test.step()** - complex flows are broken into named steps that surface in Allure and HTML reports, making failure diagnosis faster.

**expect().toPass()** - used instead of manual `waitForFunction` for async state polling. Cleaner and respects Playwright's retry-ability model.

**Custom SummaryReporter** - prints a duration table and top 5 slowest tests to stdout and writes `test-results/summary.json`. Useful for spotting performance regressions in CI logs without opening the full report.

**Visual regression strategy** - OS-specific baselines (`-darwin.png`, `-linux.png`) committed per platform. Full-page screenshots use `maxDiffPixelRatio` tolerance for rendering noise; element screenshots use a tighter `maxDiffPixels` budget.

**ApiClient wrapper** - thin class around Playwright's `APIRequestContext`. Keeps API calls out of test bodies and makes hybrid API + UI tests readable.

**ESLint + Prettier** - `eslint-plugin-playwright` enforces Playwright-specific best practices (prefer web-first assertions, no raw timeouts, no networkidle). `typescript-eslint` catches unused variables and unsafe `any` usage. Prettier enforces consistent formatting. Both run in CI via `npm run lint` and `npm run format:check`.

**Visual tests isolated from regression** - screenshot comparisons are OS-sensitive and require committed baseline files. Running them in CI without matching baselines causes false failures. They run locally via `npm run test:visual` and baselines are regenerated manually via the `update-snapshots` workflow when intentional UI changes are made.

**Global setup** - `src/utils/globalSetup.ts` runs before any test. It validates that `BASE_URL` and `API_URL` are set, then checks HTTP reachability for both movie-catalog-ui and movie-catalog-api. Tests never start if the environment is misconfigured.

**`loggedInPage` fixture** - creates a fresh browser context with the persisted auth storageState (`.auth/moviecatalog.json`) so tests can start directly on `/list` without calling `loginPage.login()`. Requires the `auth-setup` project to have run first.

**Test sharding** - the regression suite is split across 3 parallel machines in CI using `--shard=N/3`. Each shard runs independently and uploads its own results. The Allure job merges them into a single report.

**Allure history trending** - the `allure-report` CI job downloads the `allure-history` artifact from the previous successful push to `main`, injects it into the current results before generating, and saves the new history back. This produces Allure's built-in trend charts (pass rate, duration, flakiness) across runs without external storage.

**Docker** - `Dockerfile` uses `node:24-bookworm` and installs Playwright browsers via `--with-deps` so the image is fully self-contained. `PLAYWRIGHT_BROWSERS_PATH` is set outside `/app` so browsers survive volume mounts. `docker-compose.yml` sets `ipc: host` and `shm_size: 2gb` which Chromium requires to avoid renderer crashes in containers. Output directories are mounted as volumes so results are accessible on the host after the run.

---

## Author

**Enes Akyel**
SDET | QA Automation Engineer
[LinkedIn](https://www.linkedin.com/in/enes-akyel-2a77a7122/) • [GitHub](https://github.com/EnesAkyel)
