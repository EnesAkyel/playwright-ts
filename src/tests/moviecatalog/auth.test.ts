import { test, expect } from '../../utils/fixtures';
import { DataFactory } from '../../utils/dataFactory';
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

    test('invalid credentials show an inline error', async ({ loginPage }) => {
        await epic('Authentication');
        await feature('Login');
        await story('Invalid credentials stay on /login with an error');
        await severity(Severity.CRITICAL);

        await loginPage.login('not-a-real-user', 'not-a-real-password');

        expect(await loginPage.isErrorVisible()).toBeTruthy();
        expect(await loginPage.getErrorMessage()).toContain(
            'Invalid username or password.',
        );
    });
});
