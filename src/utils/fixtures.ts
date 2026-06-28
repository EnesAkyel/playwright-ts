import { test as base, request } from '@playwright/test';
import * as fs from 'fs';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/saucedemo/LoginPage';
import { InventoryPage } from '../pages/saucedemo/InventoryPage';
import { CartPage } from '../pages/saucedemo/CartPage';
import { CheckoutPage } from '../pages/saucedemo/CheckoutPage';
import { ApiClient } from './apiClient';
import { ENV } from './env';

const AUTH_FILE = '.auth/sauce.json';

type Fixtures = {
    homePage: HomePage;
    loginPage: LoginPage;
    inventoryPage: InventoryPage;
    cartPage: CartPage;
    checkoutPage: CheckoutPage;
    apiClient: ApiClient;
    loggedInPage: InventoryPage;
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
    loggedInPage: async ({ browser }, use) => {
        if (!fs.existsSync(AUTH_FILE)) {
            throw new Error(
                `Auth file not found at ${AUTH_FILE}. ` +
                    `Run auth setup first: npx playwright test --project=auth-setup`,
            );
        }
        const context = await browser.newContext({ storageState: AUTH_FILE });
        const page = await context.newPage();
        await page.goto(`${ENV.sauceUrl}/inventory.html`);
        await use(new InventoryPage(page));
        await context.close();
    },
});

export { expect } from '@playwright/test';
