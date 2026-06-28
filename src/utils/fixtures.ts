import { test as base, request } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/saucedemo/LoginPage';
import { InventoryPage } from '../pages/saucedemo/InventoryPage';
import { CartPage } from '../pages/saucedemo/CartPage';
import { CheckoutPage } from '../pages/saucedemo/CheckoutPage';
import { ApiClient } from './apiClient';

type Fixtures = {
    homePage: HomePage;
    loginPage: LoginPage;
    inventoryPage: InventoryPage;
    cartPage: CartPage;
    checkoutPage: CheckoutPage;
    apiClient: ApiClient;
};

export const test = base.extend<Fixtures>({
    homePage: async ({ page }, use) => {
        const homePage = new HomePage(page);
        await homePage.open();
        await use(homePage);
    },
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await loginPage.open();
        await use(loginPage);
    },
    inventoryPage: async ({ page }, use) => {
        await use(new InventoryPage(page));
    },
    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },
    checkoutPage: async ({ page }, use) => {
        await use(new CheckoutPage(page));
    },
    apiClient: async ({}, use) => {
        const requestContext = await request.newContext();
        await use(new ApiClient(requestContext));
        await requestContext.dispose();
    },
});

export { expect } from '@playwright/test';
