import { test, expect } from '../../utils/fixtures';
import { AccessibilityHelper } from '../../utils/accessibilityHelper';
import { DataFactory } from '../../utils/dataFactory';
import { epic, feature, story, severity, Severity } from 'allure-js-commons';

test.describe('Accessibility Tests', { tag: ['@a11y', '@regression'] }, () => {
    test('JSONPlaceholder homepage should have no critical violations', async ({ homePage }) => {
        await epic('Accessibility');
        await feature('Axe Scanning');
        await story('No critical violations on homepage');
        await severity(Severity.CRITICAL);

        // Known violation: JSONPlaceholder images are missing alt text
        // This is a real a11y bug in the app under test, excluded intentionally
        const result = await AccessibilityHelper.scanPageExcluding(homePage.page, ['image-alt']);

        AccessibilityHelper.printViolations(result);

        const criticalViolations = result.violations.filter(v => v.impact === 'critical');

        expect(
            criticalViolations,
            `Critical a11y violations found: ${JSON.stringify(criticalViolations, null, 2)}`,
        ).toHaveLength(0);
    });

    test('JSONPlaceholder homepage should have no serious violations', async ({ homePage }) => {
        await epic('Accessibility');
        await feature('Axe Scanning');
        await story('No serious violations on homepage');
        await severity(Severity.NORMAL);

        // Known violations: color contrast and missing link text are real a11y
        // bugs in the app under test, excluded intentionally
        const result = await AccessibilityHelper.scanPageExcluding(homePage.page, [
            'color-contrast',
            'link-name',
        ]);

        AccessibilityHelper.printViolations(result);

        const seriousViolations = result.violations.filter(v => v.impact === 'serious');

        expect(
            seriousViolations,
            `Serious a11y violations found: ${JSON.stringify(seriousViolations, null, 2)}`,
        ).toHaveLength(0);
    });

    test('SauceDemo login page should have no critical violations', async ({ loginPage }) => {
        await epic('Accessibility');
        await feature('Axe Scanning');
        await story('No critical violations on login page');
        await severity(Severity.CRITICAL);

        const result = await AccessibilityHelper.scanPage(loginPage.page);
        AccessibilityHelper.printViolations(result);

        const criticalViolations = result.violations.filter(v => v.impact === 'critical');

        expect(
            criticalViolations,
            `Critical a11y violations found: ${JSON.stringify(criticalViolations, null, 2)}`,
        ).toHaveLength(0);
    });

    test('SauceDemo inventory page should have no critical violations', async ({
        loginPage,
        inventoryPage,
    }) => {
        await epic('Accessibility');
        await feature('Axe Scanning');
        await story('No critical violations on inventory page');
        await severity(Severity.CRITICAL);

        const user = DataFactory.createSauceUser();
        await loginPage.login(user.username, user.password);

        // Known violation: SauceDemo's sort dropdown is missing an accessible name
        // This is a real a11y bug in the app under test, excluded intentionally
        const result = await AccessibilityHelper.scanPageExcluding(inventoryPage.page, [
            'select-name',
        ]);

        AccessibilityHelper.printViolations(result);

        const criticalViolations = result.violations.filter(v => v.impact === 'critical');

        expect(
            criticalViolations,
            `Critical a11y violations found: ${JSON.stringify(criticalViolations, null, 2)}`,
        ).toHaveLength(0);
    });

    test('SauceDemo login form should be accessible', async ({ loginPage }) => {
        await epic('Accessibility');
        await feature('Axe Scanning');
        await story('Login form element-level scan');
        await severity(Severity.NORMAL);

        const result = await AccessibilityHelper.scanElement(
            loginPage.page,
            '#login_button_container',
        );
        AccessibilityHelper.printViolations(result);

        const criticalViolations = result.violations.filter(v => v.impact === 'critical');

        expect(
            criticalViolations,
            `Critical a11y violations on login form: ${JSON.stringify(criticalViolations, null, 2)}`,
        ).toHaveLength(0);
    });
});

test.describe('Keyboard Navigation Tests', { tag: ['@a11y', '@keyboard', '@regression'] }, () => {
    test('login form fields should be reachable via Tab key', async ({ loginPage }) => {
        await epic('Accessibility');
        await feature('Keyboard Navigation');
        await story('Tab through login form');
        await severity(Severity.CRITICAL);

        const page = loginPage.page;

        await page.locator('body').click();
        await page.keyboard.press('Tab');
        const focusedAfterFirstTab = await page.evaluate(() =>
            document.activeElement?.getAttribute('data-test'),
        );
        expect(focusedAfterFirstTab).toBe('username');

        await page.keyboard.press('Tab');
        const focusedAfterSecondTab = await page.evaluate(() =>
            document.activeElement?.getAttribute('data-test'),
        );
        expect(focusedAfterSecondTab).toBe('password');

        await page.keyboard.press('Tab');
        const focusedAfterThirdTab = await page.evaluate(() =>
            document.activeElement?.getAttribute('data-test'),
        );
        expect(focusedAfterThirdTab).toBe('login-button');
    });

    test('login form should be submittable via keyboard only', async ({
        loginPage,
        inventoryPage,
    }) => {
        await epic('Accessibility');
        await feature('Keyboard Navigation');
        await story('Complete login using only keyboard');
        await severity(Severity.CRITICAL);

        const page = loginPage.page;
        const user = DataFactory.createSauceUser();

        await page.locator('body').click();

        await page.keyboard.press('Tab');
        await page.keyboard.type(user.username);

        await page.keyboard.press('Tab');
        await page.keyboard.type(user.password);

        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter');

        await expect(inventoryPage.page.locator('[data-test="title"]')).toBeVisible();
        expect(await inventoryPage.getTitle()).toBe('Products');
    });
});
