import { test as base, request } from '@playwright/test';
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
    loggedInPage: async ({ browser }, use) => {
        if (!fs.existsSync(AUTH_FILE)) {
            throw new Error(
                `Auth file not found at ${AUTH_FILE}. ` +
                    `Run auth setup first: npx playwright test --project=auth-setup`,
            );
        }
        const context = await browser.newContext({ storageState: AUTH_FILE });
        const page = await context.newPage();
        await page.goto(`${ENV.baseUrl}/list`);
        await use(new ListPage(page));
        await context.close();
    },
});

export { expect } from '@playwright/test';
