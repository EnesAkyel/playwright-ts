import { test } from '../../utils/fixtures';
import { VisualHelper } from '../../utils/visualHelper';
import { DataFactory } from '../../utils/dataFactory';

test.describe('Visual Regression Tests', { tag: ['@visual'] }, () => {

    test('JSONPlaceholder homepage should match baseline', async ({
                                                                      homePage,
                                                                  }) => {
        await homePage.page.waitForLoadState('networkidle');
        // the homepage has dynamic content below the fold
        // that causes non-deterministic page heights between runs
        await VisualHelper.compareFullPage(
            homePage.page,
            'jsonplaceholder-homepage',
            { fullPage: false }
        );
    });

    test('JSONPlaceholder homepage header should match baseline', async ({
                                                                             homePage,
                                                                         }) => {
        await homePage.page.waitForLoadState('networkidle');
        await VisualHelper.compareElement(
            homePage.page,
            'h1:has-text("JSONPlaceholder")',
            'jsonplaceholder-main-heading'
        );
    });

    test('SauceDemo login page should match baseline', async ({
                                                                  loginPage,
                                                              }) => {
        await loginPage.page.waitForLoadState('networkidle');
        await VisualHelper.compareFullPage(
            loginPage.page,
            'saucedemo-login-page'
        );
    });

    test('SauceDemo login form should match baseline', async ({
                                                                  loginPage,
                                                              }) => {
        await loginPage.page.waitForLoadState('networkidle');
        await VisualHelper.compareElement(
            loginPage.page,
            '#login_button_container',
            'saucedemo-login-form'
        );
    });

    test('SauceDemo inventory page should match baseline', async ({
                                                                      loginPage,
                                                                      inventoryPage,
                                                                  }) => {
        const user = DataFactory.createSauceUser();
        await loginPage.login(user.username, user.password);
        await inventoryPage.page.waitForLoadState('networkidle');
        await VisualHelper.compareFullPage(
            inventoryPage.page,
            'saucedemo-inventory-page'
        );
    });

    test('SauceDemo inventory items should match baseline', async ({
                                                                       loginPage,
                                                                       inventoryPage,
                                                                   }) => {
        const user = DataFactory.createSauceUser();
        await loginPage.login(user.username, user.password);
        await inventoryPage.page.waitForLoadState('networkidle');
        await VisualHelper.compareElement(
            inventoryPage.page,
            '.inventory_list',
            'saucedemo-inventory-list'
        );
    });

});
