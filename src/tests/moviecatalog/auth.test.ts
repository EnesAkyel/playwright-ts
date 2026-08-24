import { test, expect } from '../../utils/fixtures';
import { DataFactory } from '../../utils/dataFactory';
import { ErrorPopup } from '../../pages/moviecatalog/ErrorPopup';
import { ENV } from '../../utils/env';
import { epic, feature, story, severity, Severity } from 'allure-js-commons';

test.describe('Authentication & session', { tag: ['@regression'] }, () => {
    test(
        'valid login navigates to the movie list',
        { tag: ['@smoke'] },
        async ({ loginPage, page }) => {
            await epic('Authentication');
            await feature('Login');
            await story('Valid credentials navigate to /list');
            await severity(Severity.BLOCKER);

            const { username, password } = DataFactory.createCredentials();
            await loginPage.login(username, password);

            await expect(page).toHaveURL(/\/list$/);
            await expect(page.getByTestId('logout-button')).toBeVisible();
        },
    );

    test('invalid credentials show an inline error', async ({ loginPage, page }) => {
        await epic('Authentication');
        await feature('Login');
        await story('Invalid credentials stay on /login with an error');
        await severity(Severity.CRITICAL);

        const errorPopup = new ErrorPopup(page);

        await loginPage.login('not-a-real-user', 'not-a-real-password');

        expect(await loginPage.isErrorVisible()).toBeTruthy();
        expect(await loginPage.getErrorMessage()).toContain('Invalid username or password.');
        // /auth/login is exempt from the interceptor's popup handling — a bad login is not a
        // session expiry, so it must never surface the global error popup.
        await expect(errorPopup.root).toBeHidden();
    });

    test('a mocked 401 from the login endpoint shows the same inline error', async ({
        loginPage,
        page,
    }) => {
        await epic('Authentication');
        await feature('Login');
        await story(
            'A 401 response (any body) renders the fixed inline error, not the response body',
        );
        await severity(Severity.NORMAL);

        const errorPopup = new ErrorPopup(page);

        await page.route('**/auth/login', route =>
            route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Unauthorized' }),
            }),
        );

        await loginPage.login('someuser', 'somepassword');

        expect(await loginPage.isErrorVisible()).toBeTruthy();
        expect(await loginPage.getErrorMessage()).toContain('Invalid username or password.');
        await expect(page).toHaveURL(/\/login$/);
        // Same exemption as above, this time with a mocked 401 instead of the real backend's
        // rejection — confirms the exemption is keyed off the request URL, not the response.
        await expect(errorPopup.root).toBeHidden();
    });

    test('unauthenticated access to a protected route redirects to /login', async ({ page }) => {
        await epic('Authentication');
        await feature('Route guard');
        await story('authGuard redirects to /login when no token is present');
        await severity(Severity.CRITICAL);

        for (const path of ['/list', '/add', '/movie/1001']) {
            await test.step(`goto ${path} without a session redirects to /login`, async () => {
                await page.goto(`${ENV.baseUrl}${path}`);
                await expect(page).toHaveURL(/\/login$/);
            });
        }
    });

    test('a 401 on any authenticated call logs out and shows a popup (mocked)', async ({
        loggedInPage,
    }) => {
        await epic('Authentication');
        await feature('Session expiry');
        await story(
            "A 401 on any call triggers logout + a popup, not the page's own error message",
        );
        await severity(Severity.CRITICAL);

        const errorPopup = new ErrorPopup(loggedInPage.page);

        await loggedInPage.page.route('**/movies*', route =>
            route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Unauthorized' }),
            }),
        );

        await loggedInPage.ratingFilter.selectOption('PG-13');

        await expect(errorPopup.root).toBeVisible();
        await expect(errorPopup.message).toHaveText(
            'Your session has expired. Please log in again.',
        );
        await expect(errorPopup.refreshButton).toBeHidden();
        await expect(loggedInPage.page).toHaveURL(/\/login$/);

        const token = await loggedInPage.page.evaluate(() => localStorage.getItem('authToken'));
        expect(token).toBeNull();
        await expect(loggedInPage.listErrorMessage).toBeHidden();
    });

    test('logout button clears the session', async ({ loggedInPage }) => {
        await epic('Authentication');
        await feature('Logout');
        await story('Logout clears the token and the guard re-blocks /list');
        await severity(Severity.CRITICAL);

        await loggedInPage.logoutButton.click();
        await expect(loggedInPage.page).toHaveURL(/\/login$/);

        const token = await loggedInPage.page.evaluate(() => localStorage.getItem('authToken'));
        expect(token).toBeNull();

        await loggedInPage.open();
        await expect(loggedInPage.page).toHaveURL(/\/login$/);
    });
});
