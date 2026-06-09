import { test, expect } from '../../utils/fixtures';
import { DataFactory } from '../../utils/dataFactory';

test.describe('SauceDemo - Login', { tag: ['@smoke', '@regression'] }, () => {

    test('should login with valid credentials', async ({ loginPage, inventoryPage }) => {
        const user = DataFactory.createSauceUser();
        await loginPage.login(user.username, user.password);
        const title = await inventoryPage.getTitle();
        expect(title).toBe('Products');
    });

    test('should show error with invalid credentials', async ({ loginPage }) => {
        await loginPage.login('invalid_user', 'invalid_password');
        expect(await loginPage.isErrorVisible()).toBeTruthy();
        const error = await loginPage.getErrorMessage();
        expect(error).toContain('Username and password do not match');
    });

    test('should show error with empty credentials', async ({ loginPage }) => {
        await loginPage.login('', '');
        expect(await loginPage.isErrorVisible()).toBeTruthy();
        const error = await loginPage.getErrorMessage();
        expect(error).toContain('Username is required');
    });

    test('should show error with empty password', async ({ loginPage }) => {
        const user = DataFactory.createSauceUser();
        await loginPage.login(user.username, '');
        expect(await loginPage.isErrorVisible()).toBeTruthy();
        const error = await loginPage.getErrorMessage();
        expect(error).toContain('Password is required');
    });

});
