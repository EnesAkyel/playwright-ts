import { test, expect } from '../../utils/fixtures';
import { DataFactory } from '../../utils/dataFactory';
import { epic, feature, story, severity, Severity } from 'allure-js-commons';

const BUDGET_MS = {
    domContentLoaded: 5000,
    loadEvent: 8000,
    jsHeapMb: 50,
};

async function getHeapMb(page: import('@playwright/test').Page): Promise<number> {
    return page.evaluate(() => {
        const mem = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
        return mem ? mem.usedJSHeapSize / (1024 * 1024) : 0;
    });
}

test.describe('Performance Metrics', { tag: ['@performance', '@regression'] }, () => {
    test('SauceDemo login page should load within budget', async ({ loginPage }) => {
        await epic('Performance');
        await feature('Page Load Times');
        await story('Login page load budget');
        await severity(Severity.NORMAL);

        const [navEntry] = await loginPage.page.evaluate(
            () => performance.getEntriesByType('navigation') as PerformanceNavigationTiming[],
        );

        expect(navEntry.domContentLoadedEventEnd, 'DOMContentLoaded exceeded budget').toBeLessThan(
            BUDGET_MS.domContentLoaded,
        );
        expect(navEntry.loadEventEnd, 'load event exceeded budget').toBeLessThan(
            BUDGET_MS.loadEvent,
        );
    });

    test('SauceDemo inventory page should load within budget', async ({
        loginPage,
        inventoryPage,
    }) => {
        await epic('Performance');
        await feature('Page Load Times');
        await story('Inventory page load budget after login');
        await severity(Severity.NORMAL);

        const user = DataFactory.createSauceUser();
        await loginPage.login(user.username, user.password);
        await expect(inventoryPage.page.locator('[data-test="title"]')).toBeVisible();

        const [navEntry] = await inventoryPage.page.evaluate(
            () => performance.getEntriesByType('navigation') as PerformanceNavigationTiming[],
        );
        expect(navEntry.domContentLoadedEventEnd, 'DOMContentLoaded exceeded budget').toBeLessThan(
            BUDGET_MS.domContentLoaded,
        );
    });

    test('SauceDemo inventory page JS heap should be within budget', async ({
        loginPage,
        inventoryPage,
        browserName,
    }) => {
        test.skip(browserName !== 'chromium', 'performance.memory is Chromium-only');
        await epic('Performance');
        await feature('Page Load Times');
        await story('Inventory page JS heap budget');
        await severity(Severity.NORMAL);

        const user = DataFactory.createSauceUser();
        await loginPage.login(user.username, user.password);
        await expect(inventoryPage.page.locator('[data-test="title"]')).toBeVisible();

        const heapMb = await getHeapMb(inventoryPage.page);
        expect(heapMb, `JS heap ${heapMb.toFixed(1)} MB exceeded ${BUDGET_MS.jsHeapMb} MB budget`).toBeLessThan(
            BUDGET_MS.jsHeapMb,
        );
    });

    test('JSONPlaceholder homepage should load within budget', async ({ homePage }) => {
        await epic('Performance');
        await feature('Page Load Times');
        await story('JSONPlaceholder homepage load budget');
        await severity(Severity.MINOR);

        const [navEntry] = await homePage.page.evaluate(
            () => performance.getEntriesByType('navigation') as PerformanceNavigationTiming[],
        );

        expect(navEntry.domContentLoadedEventEnd, 'DOMContentLoaded exceeded budget').toBeLessThan(
            BUDGET_MS.domContentLoaded,
        );
        expect(navEntry.loadEventEnd, 'load event exceeded budget').toBeLessThan(
            BUDGET_MS.loadEvent,
        );
    });

    test('JSONPlaceholder homepage JS heap should be within budget', async ({
        homePage,
        browserName,
    }) => {
        test.skip(browserName !== 'chromium', 'performance.memory is Chromium-only');
        await epic('Performance');
        await feature('Page Load Times');
        await story('JSONPlaceholder homepage JS heap budget');
        await severity(Severity.MINOR);

        const heapMb = await getHeapMb(homePage.page);
        expect(heapMb, `JS heap ${heapMb.toFixed(1)} MB exceeded ${BUDGET_MS.jsHeapMb} MB budget`).toBeLessThan(
            BUDGET_MS.jsHeapMb,
        );
    });

    test('SauceDemo checkout flow should complete within time threshold', async ({
        loginPage,
        inventoryPage,
        cartPage,
        checkoutPage,
    }) => {
        await epic('Performance');
        await feature('User Journey Timing');
        await story('End-to-end checkout duration');
        await severity(Severity.NORMAL);

        const user = DataFactory.createSauceUser();
        const checkoutUser = DataFactory.createUser();

        const start = Date.now();

        await loginPage.login(user.username, user.password);
        await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
        await inventoryPage.goToCart();
        await cartPage.proceedToCheckout();
        await checkoutPage.fillShippingInfo(checkoutUser);
        await checkoutPage.continue();
        await checkoutPage.finish();

        const duration = Date.now() - start;
        expect(duration, `Checkout took ${duration}ms, expected < 15000ms`).toBeLessThan(15000);
    });
});
