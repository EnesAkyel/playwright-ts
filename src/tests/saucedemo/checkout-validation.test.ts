import { test, expect } from '../../utils/fixtures';
import { DataFactory } from '../../utils/dataFactory';
import { epic, feature, story, severity, Severity } from 'allure-js-commons';

test.describe('SauceDemo - Checkout Form Validation', { tag: ['@regression'] }, () => {

    test.beforeEach(async ({ loginPage, inventoryPage, cartPage }) => {
        const user = DataFactory.createSauceUser();
        await loginPage.login(user.username, user.password);
        await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
        await inventoryPage.goToCart();
        await cartPage.proceedToCheckout();
    });

    test('should show error when submitting an empty checkout form', async ({ checkoutPage }) => {
        await epic('Checkout');
        await feature('Form Validation');
        await story('Empty form submission');
        await severity(Severity.CRITICAL);

        await checkoutPage.continue();

        expect(await checkoutPage.isErrorVisible()).toBeTruthy();
        expect(await checkoutPage.getErrorMessage()).toContain('First Name is required');
    });

    test('should show error when last name is missing', async ({ checkoutPage }) => {
        await epic('Checkout');
        await feature('Form Validation');
        await story('Missing last name');
        await severity(Severity.NORMAL);

        await checkoutPage.fillFirstName('John');
        await checkoutPage.continue();

        expect(await checkoutPage.isErrorVisible()).toBeTruthy();
        expect(await checkoutPage.getErrorMessage()).toContain('Last Name is required');
    });

    test('should show error when zip code is missing', async ({ checkoutPage }) => {
        await epic('Checkout');
        await feature('Form Validation');
        await story('Missing postal code');
        await severity(Severity.NORMAL);

        await checkoutPage.fillFirstName('John');
        await checkoutPage.fillLastName('Doe');
        await checkoutPage.continue();

        expect(await checkoutPage.isErrorVisible()).toBeTruthy();
        expect(await checkoutPage.getErrorMessage()).toContain('Postal Code is required');
    });

    test('should allow cancelling and returning to cart', async ({ inventoryPage, cartPage, checkoutPage }) => {
        await epic('Checkout');
        await feature('Navigation');
        await story('Continue shopping from cart');
        await severity(Severity.MINOR);

        await checkoutPage.page.goBack();
        await cartPage.continueShopping();

        await expect(inventoryPage.page.locator('[data-test="title"]')).toBeVisible();
        expect(await inventoryPage.getTitle()).toBe('Products');
    });

    test('should clear error message after correcting a field', async ({ checkoutPage }) => {
        await epic('Checkout');
        await feature('Form Validation');
        await story('Error clears on correction');
        await severity(Severity.MINOR);

        await checkoutPage.continue();
        expect(await checkoutPage.isErrorVisible()).toBeTruthy();

        await checkoutPage.fillFirstName('Jane');
        await checkoutPage.fillLastName('Smith');
        await checkoutPage.fillZipCode('12345');
        await checkoutPage.continue();

        expect(await checkoutPage.isErrorVisible()).toBeFalsy();
    });

});
