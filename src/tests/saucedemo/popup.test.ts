import { test, expect } from '../../utils/fixtures';
import { DataFactory } from '../../utils/dataFactory';
import { epic, feature, story, severity, Severity } from 'allure-js-commons';

test.describe('SauceDemo - Multi-Tab / Popup Handling', { tag: ['@regression'] }, () => {

    test.beforeEach(async ({ loginPage, inventoryPage }) => {
        const user = DataFactory.createSauceUser();
        await loginPage.login(user.username, user.password);
        await expect(inventoryPage.page.locator('[data-test="title"]')).toBeVisible();
    });

    test('should open Twitter link in a new tab', async ({ page }) => {
        await epic('Social Links');
        await feature('External Links');
        await story('Twitter link opens in new tab');
        await severity(Severity.MINOR);

        const [popup] = await Promise.all([
            page.waitForEvent('popup'),
            page.locator('.social_twitter a').click(),
        ]);

        await popup.waitForLoadState('domcontentloaded');
        // Twitter rebranded to X; the link redirects to x.com
        expect(popup.url()).toMatch(/twitter\.com|x\.com/);
        await popup.close();
    });

    test('should open Facebook link in a new tab', async ({ page }) => {
        await epic('Social Links');
        await feature('External Links');
        await story('Facebook link opens in new tab');
        await severity(Severity.MINOR);

        const [popup] = await Promise.all([
            page.waitForEvent('popup'),
            page.locator('.social_facebook a').click(),
        ]);

        await popup.waitForLoadState('domcontentloaded');
        expect(popup.url()).toContain('facebook.com');
        await popup.close();
    });

    test('should open LinkedIn link in a new tab', async ({ page }) => {
        await epic('Social Links');
        await feature('External Links');
        await story('LinkedIn link opens in new tab');
        await severity(Severity.MINOR);

        const [popup] = await Promise.all([
            page.waitForEvent('popup'),
            page.locator('.social_linkedin a').click(),
        ]);

        await popup.waitForLoadState('domcontentloaded');
        expect(popup.url()).toContain('linkedin.com');
        await popup.close();
    });

    test('should retain original page state after closing popup', async ({ page, inventoryPage }) => {
        await epic('Social Links');
        await feature('External Links');
        await story('Page state preserved after popup closes');
        await severity(Severity.NORMAL);

        await inventoryPage.addItemToCartByName('Sauce Labs Backpack');

        const [popup] = await Promise.all([
            page.waitForEvent('popup'),
            page.locator('.social_twitter a').click(),
        ]);

        await popup.waitForLoadState('domcontentloaded');
        await popup.close();

        expect(await inventoryPage.getCartBadgeCount()).toBe(1);
        expect(await inventoryPage.getTitle()).toBe('Products');
    });

});
