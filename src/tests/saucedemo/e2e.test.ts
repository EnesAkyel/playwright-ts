import { test, expect } from '../../utils/fixtures';
import { DataFactory } from '../../utils/dataFactory';
import { epic, feature, story, severity, Severity } from 'allure-js-commons';

test.describe('SauceDemo - E2E Checkout Flow', { tag: ['@regression', '@e2e'] }, () => {

    test.beforeEach(async ({ loginPage, inventoryPage }) => {
        const user = DataFactory.createSauceUser();
        await loginPage.login(user.username, user.password);
        await expect(inventoryPage.page.locator('[data-test="title"]')).toBeVisible();
    });

    test('smoke: key UI elements visible on inventory page', { tag: ['@smoke'] }, async ({ inventoryPage }) => {
        await epic('Inventory');
        await feature('Page Layout');
        await severity(Severity.CRITICAL);

        expect.soft(await inventoryPage.getTitle()).toBe('Products');
        expect.soft(await inventoryPage.isCartBadgeVisible()).toBeFalsy();
        expect.soft(await inventoryPage.getItemCount()).toBeGreaterThan(0);
        await expect.soft(inventoryPage.page.locator('[data-test="product-sort-container"]')).toBeVisible();
        await expect.soft(inventoryPage.page.locator('.footer_copy')).toBeVisible();
    });

    test('should display all products on inventory page', async ({ inventoryPage }) => {
        await epic('Inventory');
        await feature('Product Listing');
        await severity(Severity.NORMAL);

        const count = await inventoryPage.getItemCount();
        expect(count).toBe(6);
    });

    test('should add a single item to cart', async ({ inventoryPage }) => {
        await epic('Cart');
        await feature('Add to Cart');
        await severity(Severity.CRITICAL);

        await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
        expect(await inventoryPage.isCartBadgeVisible()).toBeTruthy();
        expect(await inventoryPage.getCartBadgeCount()).toBe(1);
    });

    test('should add multiple items to cart', async ({ inventoryPage }) => {
        await epic('Cart');
        await feature('Add to Cart');
        await severity(Severity.NORMAL);

        await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
        await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');
        expect(await inventoryPage.getCartBadgeCount()).toBe(2);
    });

    test('should sort products by price low to high', async ({ inventoryPage }) => {
        await epic('Inventory');
        await feature('Sorting');
        await severity(Severity.MINOR);

        await inventoryPage.sortBy('lohi');
        const prices = await inventoryPage.getProductPrices();
        const sorted = [...prices].sort((a, b) => a - b);
        expect(prices).toEqual(sorted);
    });

    test('should sort products by price high to low', async ({ inventoryPage }) => {
        await epic('Inventory');
        await feature('Sorting');
        await severity(Severity.MINOR);

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
        await epic('Checkout');
        await feature('E2E Purchase');
        await story('Happy path checkout with multiple items');
        await severity(Severity.BLOCKER);

        const user = DataFactory.createUser();

        await test.step('Add items to cart', async () => {
            await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
            await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');
            await expect(async () => {
                expect(await inventoryPage.getCartBadgeCount()).toBe(2);
            }).toPass({ timeout: 5000 });
        });

        await test.step('Navigate to cart and verify items', async () => {
            await inventoryPage.goToCart();
            await expect(inventoryPage.page.locator('[data-test="inventory-item-desc"]')).toHaveCount(2);
            expect(await cartPage.getTitle()).toBe('Your Cart');
            expect(await cartPage.getCartItemCount()).toBe(2);
        });

        await test.step('Fill in shipping information', async () => {
            await cartPage.proceedToCheckout();
            await checkoutPage.fillShippingInfo(user);
            await checkoutPage.continue();
        });

        await test.step('Verify order total', async () => {
            const total = await checkoutPage.getOrderTotal();
            expect(total).toContain('Total:');
        });

        await test.step('Confirm order', async () => {
            await checkoutPage.finish();
            const header = await checkoutPage.getConfirmationHeader();
            expect(header).toBe('Thank you for your order!');
        });
    });

});

test.describe('SauceDemo - Cart Item Removal', { tag: ['@regression'] }, () => {

    test.beforeEach(async ({ loginPage, inventoryPage }) => {
        const user = DataFactory.createSauceUser();
        await loginPage.login(user.username, user.password);
        await expect(inventoryPage.page.locator('[data-test="title"]')).toBeVisible();
    });

    test('should remove an item from the inventory page', async ({ inventoryPage }) => {
        await epic('Cart');
        await feature('Remove from Cart');
        await severity(Severity.CRITICAL);

        await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
        expect(await inventoryPage.getCartBadgeCount()).toBe(1);

        await inventoryPage.removeItemFromCartByName('Sauce Labs Backpack');
        expect(await inventoryPage.isCartBadgeVisible()).toBeFalsy();
    });

    test('should decrement badge count when one item is removed', async ({ inventoryPage }) => {
        await epic('Cart');
        await feature('Remove from Cart');
        await severity(Severity.NORMAL);

        await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
        await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');
        expect(await inventoryPage.getCartBadgeCount()).toBe(2);

        await inventoryPage.removeItemFromCartByName('Sauce Labs Backpack');
        expect(await inventoryPage.getCartBadgeCount()).toBe(1);
    });

    test('should hide badge after emptying cart', async ({ inventoryPage }) => {
        await epic('Cart');
        await feature('Remove from Cart');
        await story('Badge disappears when cart is empty');
        await severity(Severity.CRITICAL);

        await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
        await inventoryPage.removeItemFromCartByName('Sauce Labs Backpack');

        await expect(async () => {
            expect(await inventoryPage.isCartBadgeVisible()).toBeFalsy();
        }).toPass({ timeout: 3000 });
    });

    test('should allow re-adding an item after removing it', async ({ inventoryPage }) => {
        await epic('Cart');
        await feature('Remove from Cart');
        await severity(Severity.NORMAL);

        await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
        await inventoryPage.removeItemFromCartByName('Sauce Labs Backpack');
        await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
        expect(await inventoryPage.getCartBadgeCount()).toBe(1);
    });

    test('should preserve remaining items when removing one from multi-item cart', async ({ inventoryPage, cartPage }) => {
        await epic('Cart');
        await feature('Remove from Cart');
        await severity(Severity.NORMAL);

        await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
        await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');
        await inventoryPage.addItemToCartByName('Sauce Labs Bolt T-Shirt');

        await inventoryPage.removeItemFromCartByName('Sauce Labs Bike Light');
        expect(await inventoryPage.getCartBadgeCount()).toBe(2);

        await inventoryPage.goToCart();
        const names = await cartPage.getCartItemNames();
        expect(names).toContain('Sauce Labs Backpack');
        expect(names).toContain('Sauce Labs Bolt T-Shirt');
        expect(names).not.toContain('Sauce Labs Bike Light');
    });

});
