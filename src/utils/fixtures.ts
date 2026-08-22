import { test as base, request, BrowserContext, Page } from '@playwright/test';
import fs from 'node:fs';
import { LoginPage } from '../pages/moviecatalog/LoginPage';
import { ListPage } from '../pages/moviecatalog/ListPage';
import { AddMoviePage } from '../pages/moviecatalog/AddMoviePage';
import { MovieDetailPage } from '../pages/moviecatalog/MovieDetailPage';
import { ErrorPopup } from '../pages/moviecatalog/ErrorPopup';
import { ApiClient } from './apiClient';
import { ENV } from './env';

const AUTH_FILE = '.auth/moviecatalog.json';

type Fixtures = {
    loginPage: LoginPage;
    listPage: ListPage;
    addMoviePage: AddMoviePage;
    movieDetailPage: MovieDetailPage;
    errorPopup: ErrorPopup;
    apiClient: ApiClient;
    loggedInContext: { context: BrowserContext; page: Page };
    loggedInPage: ListPage;
};

export const test = base.extend<Fixtures>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await loginPage.open();
        await use(loginPage);
    },
    listPage: async ({ page }, use) => {
        await use(new ListPage(page));
    },
    addMoviePage: async ({ page }, use) => {
        await use(new AddMoviePage(page));
    },
    movieDetailPage: async ({ page }, use) => {
        await use(new MovieDetailPage(page));
    },
    errorPopup: async ({ page }, use) => {
        await use(new ErrorPopup(page));
    },
    apiClient: async ({}, use) => {
        const requestContext = await request.newContext();
        await use(new ApiClient(requestContext));
        await requestContext.dispose();
    },
    loggedInContext: async ({ browser }, use) => {
        if (!fs.existsSync(AUTH_FILE)) {
            throw new Error(
                `Auth file not found at ${AUTH_FILE}. ` +
                    `Run auth setup first: npx playwright test --project=auth-setup`,
            );
        }
        const context = await browser.newContext({ storageState: AUTH_FILE });
        const page = await context.newPage();
        await use({ context, page });
        await context.close();
    },
    // Navigates to /list immediately; use `loggedInContext` directly when a test
    // needs to install a page.route() mock before the first request fires.
    loggedInPage: async ({ loggedInContext }, use) => {
        const { page } = loggedInContext;
        await page.goto(`${ENV.baseUrl}/list`);
        await use(new ListPage(page));
    },
});

export { expect } from '@playwright/test';
