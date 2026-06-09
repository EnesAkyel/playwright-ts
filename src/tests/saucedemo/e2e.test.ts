import { test, expect } from '../../utils/fixtures';
import { DataFactory } from '../../utils/dataFactory';

test.describe('SauceDemo - E2E Checkout Flow', { tag: ['@regression', '@e2e'] }, () => {

    test.beforeEach(async ({ loginPage, inventoryPage }) => {
        const user = DataFactory.createSauceUser();
        await loginPage.login(user.username, user.password);
        await expect(inventoryPage.page.locator('[data-test="title"]')).toBeVisible();
    });

    test('should display all products on inventory page', async ({ inventoryPage }) => {
        const count = await inventoryPage.getItemCount();
        expect(count).toBe(6);
    });

    test('should add a single item to cart', async ({ inventoryPage }) => {
        await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
        expect(await inventoryPage.isCartBadgeVisible()).toBeTruthy();
        expect(await inventoryPage.getCartBadgeCount()).toBe(1);
    });

    test('should add multiple items to cart', async ({ inventoryPage }) => {
        await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
        await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');
        expect(await inventoryPage.getCartBadgeCount()).toBe(2);
    });

    test('should sort products by price low to high', async ({ inventoryPage }) => {
        await inventoryPage.sortBy('lohi');
        const prices = await inventoryPage.getProductPrices();
        const sorted = [...prices].sort((a, b) => a - b);
        expect(prices).toEqual(sorted);
    });

    test('should sort products by price high to low', async ({ inventoryPage }) => {
        await inventoryPage.sortBy('hilo');
        const prices = await inventoryPage.getProductPrices();
        const sorted = [...prices].sort((a, b) => b - a);
        expect(prices).toEqual(sorted);
    });

    test('should complete full checkout flow', async ({
                                                          inventoryPage,
                                                          cartPage,
                                                          checkoutPage,
                                                      }) => {
        const user = DataFactory.createUser();

        await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
        await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');

        // badge update is async — wait before asserting count
        await inventoryPage.page.waitForFunction(() => {
            const badge = document.querySelector('[data-test="shopping-cart-badge"]');
            return badge && badge.textContent === '2';
        });

        expect(await inventoryPage.getCartBadgeCount()).toBe(2);

        await inventoryPage.goToCart();

        await inventoryPage.page.waitForFunction(() => {
            return document.querySelectorAll('[data-test="inventory-item-desc"]').length === 2;
        });

        expect(await cartPage.getTitle()).toBe('Your Cart');
        expect(await cartPage.getCartItemCount()).toBe(2);

        await cartPage.proceedToCheckout();
        await checkoutPage.fillShippingInfo(user);
        await checkoutPage.continue();

        const total = await checkoutPage.getOrderTotal();
        expect(total).toContain('Total:');

        await checkoutPage.finish();

        const header = await checkoutPage.getConfirmationHeader();
        expect(header).toBe('Thank you for your order!');
    });

});
