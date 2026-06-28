import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import { ENV } from '../../utils/env';

test.describe('Auth State Persistence (storageState)', { tag: ['@auth', '@performance'] }, () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${ENV.sauceUrl}/inventory.html`);
        await page.waitForLoadState('networkidle');
    });

    test('navigates directly to inventory without logging in', async ({ page }) => {
        await expect(page.locator('[data-test="title"]')).toHaveText('Products');
        await expect(page).toHaveURL(/inventory\.html/);
    });

    test('session cookie is present from persisted auth state', async ({ context }) => {
        const cookies = await context.cookies();
        const sessionCookie = cookies.find(c => c.name === 'session-username');
        expect(sessionCookie).toBeDefined();
        expect(sessionCookie!.value).toBe(ENV.sauceUsername || 'standard_user');
    });

    test('all six products render with persisted auth state', async ({ page }) => {
        const items = page.locator('[data-test="inventory-item"]');
        await expect(items).toHaveCount(6);
    });

    test('can add item to cart using persisted auth state', async ({ page }) => {
        await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
        const badge = page.locator('[data-test="shopping-cart-badge"]');
        await expect(badge).toBeVisible();
        await expect(badge).toHaveText('1');
    });

    test('auth file captures session cookie with correct domain and value', async () => {
        const authState = JSON.parse(fs.readFileSync('.auth/sauce.json', 'utf-8'));

        expect(authState).toHaveProperty('cookies');
        expect(authState).toHaveProperty('origins');

        const sessionCookie = authState.cookies.find(
            (c: { name: string }) => c.name === 'session-username',
        );
        expect(sessionCookie).toBeDefined();
        expect(sessionCookie.value).toBe(ENV.sauceUsername || 'standard_user');
        expect(sessionCookie.domain).toContain('saucedemo.com');
    });

    test('second page in same authenticated context reaches inventory directly', async ({
        context,
    }) => {
        const secondPage = await context.newPage();

        await secondPage.goto(`${ENV.sauceUrl}/inventory.html`);
        await secondPage.waitForLoadState('networkidle');

        await expect(secondPage.locator('[data-test="title"]')).toHaveText('Products');
        await expect(secondPage).toHaveURL(/inventory\.html/);

        await secondPage.close();
    });
});
