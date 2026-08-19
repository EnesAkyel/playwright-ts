/* eslint-disable playwright/expect-expect */
// VisualHelper.compare* wraps expect().toHaveScreenshot() — plugin doesn't resolve member expressions in assertFunctionNames
import { test } from '../../utils/fixtures';
import { VisualHelper } from '../../utils/visualHelper';
import { DataFactory } from '../../utils/dataFactory';

test.describe('Visual Regression Tests', { tag: ['@visual'] }, () => {
    test('JSONPlaceholder homepage should match baseline', async ({ homePage }) => {
        await expect(homePage.page.locator('h1')).toBeVisible();
        await VisualHelper.compareFullPage(homePage.page, 'jsonplaceholder-homepage', {
            fullPage: false,
        });
    });

    test('JSONPlaceholder homepage header should match baseline', async ({ homePage }) => {
        await expect(homePage.page.locator('h1')).toBeVisible();
        await VisualHelper.compareElement(
            homePage.page,
            'h1:has-text("JSONPlaceholder")',
            'jsonplaceholder-main-heading',
        );
    });

    test('SauceDemo login page should match baseline', async ({ loginPage }) => {
        await expect(loginPage.page.locator('#login_button_container')).toBeVisible();
        await VisualHelper.compareFullPage(loginPage.page, 'saucedemo-login-page');
    });

    test('SauceDemo login form should match baseline', async ({ loginPage }) => {
        await expect(loginPage.page.locator('#login_button_container')).toBeVisible();
        await VisualHelper.compareElement(
            loginPage.page,
            '#login_button_container',
            'saucedemo-login-form',
        );
    });

    test('SauceDemo inventory page should match baseline', async ({ loginPage, inventoryPage }) => {
        const user = DataFactory.createSauceUser();
        await loginPage.login(user.username, user.password);
        await expect(inventoryPage.page.locator('.inventory_list')).toBeVisible();
        await VisualHelper.compareFullPage(inventoryPage.page, 'saucedemo-inventory-page');
    });

    test('SauceDemo inventory items should match baseline', async ({
        loginPage,
        inventoryPage,
    }) => {
        const user = DataFactory.createSauceUser();
        await loginPage.login(user.username, user.password);
        await expect(inventoryPage.page.locator('.inventory_list')).toBeVisible();
        await VisualHelper.compareElement(
            inventoryPage.page,
            '.inventory_list',
            'saucedemo-inventory-list',
        );
    });
});
