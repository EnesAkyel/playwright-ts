---
name: playwright-workflow
description: Workflow conventions and known gotchas for implementing test-plan sections in this Playwright suite (movie-catalog-ui / playwright-ts). Use whenever adding or modifying tests here.
---

# Playwright workflow — movie-catalog-ui

## Session workflow

- Work one test-plan section at a time (see `movie-catalog-ui/docs/playwright-test-plan.md`, which is gitignored — local reference only). Don't jump ahead to the next section without being asked.
- Default flow per section: implement → verify → mark the plan doc → commit → push.
- **Never commit or push unless explicitly told to.** If told "don't commit" for a given piece of work, implement and verify it fully but leave it uncommitted — don't ask again later in the same session, just leave it staged/unstaged as-is until told otherwise.
- Mark completed plan-doc headings with `✅ *Implemented — \`<file>.test.ts\`*` (append `& verified` once it's actually been run green, not just written).
- **Verifying against a live backend requires the sibling `movie-catalog-api` repo's own stack.** `playwright-ts`'s `docker-compose.yml` only packages the test runner itself — it doesn't boot the app or API. Locally: `ng serve` (or equivalent) for `movie-catalog-ui` on :4200, and `cd ../movie-catalog-api && docker compose up -d` for the API on :8080 (needs Docker's daemon running — `docker info` to check). `globalSetup.ts` checks both `BASE_URL` and `API_URL` reachability before any test runs and fails fast with a clear message if either is down.
- **After a full project review (not a section-by-section build-out), group any newly-found test-case candidates as one new item** (e.g. a table under its own subsection) rather than scattering unimplemented 🆕 cases into already-✅ sections — keeps "what's actually done" a clean read per section.

## Local verification scope

- **Only run tests locally on `--project=chromium`.** Don't run firefox/webkit locally — CI covers those, and if something fails cross-browser we debug it then.
- **Don't run `npm run lint` or `npm run format:check` locally** — CI enforces both. Skip straight from "tests pass on chromium" to reporting done.
- **Only run the test(s) relevant to what you just changed** — scope the run with `-g`/`--grep` or a file path. Don't run the whole suite "just to check nothing broke" after a change scoped to one file/fixture; if the change is broader (e.g. editing a shared fixture or page object), scope the run to the tests that actually use it, not the entire suite.

## Locators

- If an element you need to interact with or assert on has **no `data-testid`**, say so explicitly rather than silently falling back to a CSS/text/role selector as a permanent locator. A role/CSS selector is fine as a last resort (e.g. `page.locator('p.red[role="alert"]')` for the add-movie form's untagged generic error paragraph), but flag it so a `data-testid` can be added to the app if it's worth hardening.

## Known gotchas (root-caused this project)

- **Route glob collisions**: this app's Angular routes and API paths can be textually identical (e.g. both are `/movie/:mid`). A bare glob like `**/movie/9999` matches the API call *and* the frontend's own navigation/document request. Scope mocks to the full API origin: `context.route(\`${ENV.apiUrl}/movie/9999\`, ...)`.
- **`page.waitForResponse` races**: when two network calls fire in quick succession (e.g. a second lookup triggered inside the first call's success handler), register *all* `waitForResponse()` promises before triggering the action, not sequentially after awaiting the first — otherwise a fast second response can complete before its listener is registered.
- **Component page objects must be instantiated against the actual page under test, not pulled from an unrelated fixture.** `fixtures.ts` used to have an `errorPopup` fixture bound to the default `page` fixture; it was dead code and a trap for tests using `loggedInPage` / `loggedInAddMoviePage` / `loggedInContext`, which run in a separate authenticated browser context with their own `page`. It's been removed — always do `new ErrorPopup(loggedInPage.page)` (or whichever page instance the test is actually driving).
- **Stale overlays block clicks**: if a popup/overlay from an earlier step in the same test is still open, it intercepts pointer events on anything underneath. Dismiss it before interacting with the covered element.
- **`eslint-plugin-playwright`'s `expect-expect` rule** (`assertFunctionNames` in `eslint.config.mjs`) only matches the rightmost identifier of a member expression — `'VisualHelper.compareElement'` never matches. List bare method names (`'compareElement'`) instead.
- **Visual regression tests must be tagged `@visual`, not `@regression`.** CI's default push/PR run is `--grep @regression`; `@visual` only runs via manual `workflow_dispatch`. Local macOS-generated baselines aren't valid for CI — Linux baselines come from the separate `update-snapshots.yml` workflow and must be generated there.
- **Don't drop a fixture arg just because it looks unused to lint — check what its setup does first.** `loginPage` isn't just a page object, its fixture also calls `.open()` to navigate to `/login`. Destructuring only `{ page }` and dropping `loginPage` to silence `@typescript-eslint/no-unused-vars` removes that navigation, so the test starts on a blank page instead of `/login` — silently broke `nfr.test.ts`'s keyboard-navigation test this way. Fix is `const { page } = loginPage;` — keeps the fixture reference (satisfies lint) and the navigation it performs.
- **SonarJS's "tests should include assertions" rule doesn't recognize `expect.soft(x)`** as an assertion call in some plugin versions — it pattern-matches `expect(x)` directly, and `expect.soft` is a different AST shape (a member-expression call). A test using *only* `.soft()` assertions can get flagged as assertion-free even though it isn't. Since the last assertion in a soft-assertion block doesn't need to be soft anyway (nothing runs after it to benefit from continuing past a failure), make it a plain `expect()` — clears the false positive and is arguably more correct.

## Credentials

- Treat this as a real project: never log, print, or leak plaintext usernames/passwords/tokens in test output, commit messages, or artifacts, even for throwaway/mocked credentials.
