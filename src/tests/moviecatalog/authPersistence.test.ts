import fs from 'node:fs';
import { test, expect } from '../../utils/fixtures';
import { ENV } from '../../utils/env';
import { epic, feature, story, severity, Severity } from 'allure-js-commons';

const AUTH_FILE = '.auth/moviecatalog.json';

// This project's storageState is set to AUTH_FILE and depends on auth-setup
// (see playwright.config.ts's `chromium-authenticated` project), so `page`/`context`
// here are already authenticated before the test body runs.
test.describe('Authenticated session persistence', { tag: ['@regression'] }, () => {
    test('the storageState fixture lands on /list fully authenticated, with zero UI login steps', async ({
        page,
    }) => {
        await epic('Authentication');
        await feature('Auth fixture');
        await story('storageState reuse skips the login form entirely');
        await severity(Severity.CRITICAL);

        await page.goto(`${ENV.baseUrl}/list`);

        await expect(page).toHaveURL(/\/list$/);
        await expect(page.getByTestId('logout-button')).toBeVisible();
    });

    test('the persisted storageState file captures a working token', async () => {
        await epic('Authentication');
        await feature('Auth fixture');
        await story('The auth-setup project persists a non-empty authToken to disk');
        await severity(Severity.NORMAL);

        const state = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
        const origin = state.origins?.find((o: { origin: string }) => o.origin === ENV.baseUrl);
        expect(origin).toBeDefined();

        const authToken = origin.localStorage.find(
            (item: { name: string }) => item.name === 'authToken',
        );
        expect(authToken).toBeDefined();
        expect(authToken.value.length).toBeGreaterThan(0);
    });

    test('a second page in the same authenticated context reaches /list directly', async ({
        page,
        context,
    }) => {
        await epic('Authentication');
        await feature('Auth fixture');
        await story('Auth state is context-scoped, not page-scoped');
        await severity(Severity.NORMAL);

        await page.goto(`${ENV.baseUrl}/list`);
        await expect(page.getByTestId('logout-button')).toBeVisible();

        const secondPage = await context.newPage();
        await secondPage.goto(`${ENV.baseUrl}/list`);

        await expect(secondPage).toHaveURL(/\/list$/);
        await expect(secondPage.getByTestId('logout-button')).toBeVisible();

        await secondPage.close();
    });
});
