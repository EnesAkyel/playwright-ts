import { test, expect } from '../../utils/fixtures';
import { AccessibilityHelper } from '../../utils/accessibilityHelper';
import { DataFactory } from '../../utils/dataFactory';

test.describe('Accessibility Tests', { tag: ['@a11y', '@regression'] }, () => {

    test('JSONPlaceholder homepage should have no critical violations', async ({
                                                                                   homePage,
                                                                               }) => {
        // Known violation: JSONPlaceholder images are missing alt text
        // This is a real a11y bug in the app under test, excluded intentionally
        const result = await AccessibilityHelper.scanPageExcluding(
            homePage.page,
            ['image-alt']
        );

        AccessibilityHelper.printViolations(result);

        const criticalViolations = result.violations.filter(
            v => v.impact === 'critical'
        );

        expect(
            criticalViolations,
            `Critical a11y violations found: ${JSON.stringify(criticalViolations, null, 2)}`
        ).toHaveLength(0);
    });

    test('JSONPlaceholder homepage should have no serious violations', async ({
                                                                                  homePage,
                                                                              }) => {
        // Known violations: color contrast and missing link text are real a11y
        // bugs in the app under test, excluded intentionally
        const result = await AccessibilityHelper.scanPageExcluding(
            homePage.page,
            ['color-contrast', 'link-name']
        );

        AccessibilityHelper.printViolations(result);

        const seriousViolations = result.violations.filter(
            v => v.impact === 'serious'
        );

        expect(
            seriousViolations,
            `Serious a11y violations found: ${JSON.stringify(seriousViolations, null, 2)}`
        ).toHaveLength(0);
    });

    test('SauceDemo login page should have no critical violations', async ({
                                                                               loginPage,
                                                                           }) => {
        const result = await AccessibilityHelper.scanPage(loginPage.page);
        AccessibilityHelper.printViolations(result);

        const criticalViolations = result.violations.filter(
            v => v.impact === 'critical'
        );

        expect(
            criticalViolations,
            `Critical a11y violations found: ${JSON.stringify(criticalViolations, null, 2)}`
        ).toHaveLength(0);
    });

    test('SauceDemo inventory page should have no critical violations', async ({
                                                                                   loginPage,
                                                                                   inventoryPage,
                                                                               }) => {
        const user = DataFactory.createSauceUser();
        await loginPage.login(user.username, user.password);

        // Known violation: SauceDemo's sort dropdown is missing an accessible name
        // This is a real a11y bug in the app under test, excluded intentionally
        const result = await AccessibilityHelper.scanPageExcluding(
            inventoryPage.page,
            ['select-name']
        );

        AccessibilityHelper.printViolations(result);

        const criticalViolations = result.violations.filter(
            v => v.impact === 'critical'
        );

        expect(
            criticalViolations,
            `Critical a11y violations found: ${JSON.stringify(criticalViolations, null, 2)}`
        ).toHaveLength(0);
    });

    test('SauceDemo login form should be accessible', async ({ loginPage }) => {
        const result = await AccessibilityHelper.scanElement(
            loginPage.page,
            '#login_button_container'
        );
        AccessibilityHelper.printViolations(result);

        const criticalViolations = result.violations.filter(
            v => v.impact === 'critical'
        );

        expect(
            criticalViolations,
            `Critical a11y violations on login form: ${JSON.stringify(criticalViolations, null, 2)}`
        ).toHaveLength(0);
    });

    test('should log full accessibility report for all pages', async ({
                                                                          homePage,
                                                                          loginPage,
                                                                      }) => {
        const pages = [
            { name: 'JSONPlaceholder', page: homePage.page },
            { name: 'SauceDemo Login', page: loginPage.page },
        ];

        for (const { name, page } of pages) {
            const result = await AccessibilityHelper.scanPage(page);
            console.log(`\n📋 Accessibility Report — ${name}`);
            console.log(`   ✅ Passes    : ${result.passes}`);
            console.log(`   ❌ Violations: ${result.violations.length}`);
            console.log(`   ⚠️  Incomplete: ${result.incomplete}`);
            AccessibilityHelper.printViolations(result);
        }
    });

});
