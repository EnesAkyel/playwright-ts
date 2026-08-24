import { test, expect } from '../../utils/fixtures';
import { MovieDetailPage } from '../../pages/moviecatalog/MovieDetailPage';
import { AccessibilityHelper } from '../../utils/accessibilityHelper';
import { epic, feature, story, severity, Severity } from 'allure-js-commons';

function criticalViolations(result: { violations: { impact: string | null }[] }) {
    return result.violations.filter(v => v.impact === 'critical');
}

test.describe('Accessibility', { tag: ['@regression', '@a11y'] }, () => {
    test('login page has no critical violations', async ({ loginPage }) => {
        await epic('Accessibility');
        await feature('Login');
        await story('The login page has no critical-impact axe-core violations');
        await severity(Severity.NORMAL);

        const result = await AccessibilityHelper.scanPage(loginPage.page);
        AccessibilityHelper.printViolations(result);

        expect(criticalViolations(result)).toEqual([]);
    });

    test('movie list page has no critical violations', async ({ loggedInPage }) => {
        await epic('Accessibility');
        await feature('Movie list');
        await story('The filter form, table, and pagination have no critical violations');
        await severity(Severity.NORMAL);

        const result = await AccessibilityHelper.scanPage(loggedInPage.page);
        AccessibilityHelper.printViolations(result);

        expect(criticalViolations(result)).toEqual([]);
    });

    test('add-movie form is accessible at the element level', async ({ loggedInAddMoviePage }) => {
        await epic('Accessibility');
        await feature('Add movie');
        await story('The add-movie form has no critical violations, scanned in isolation');
        await severity(Severity.NORMAL);

        const result = await AccessibilityHelper.scanElement(loggedInAddMoviePage.page, 'form');
        AccessibilityHelper.printViolations(result);

        expect(criticalViolations(result)).toEqual([]);
    });

    test('movie detail page has no critical violations', async ({ loggedInContext }) => {
        await epic('Accessibility');
        await feature('Movie detail');
        await story('The movie detail page has no critical violations');
        await severity(Severity.NORMAL);

        const detailPage = new MovieDetailPage(loggedInContext.page);
        await detailPage.open('1001');

        const result = await AccessibilityHelper.scanPage(loggedInContext.page);
        AccessibilityHelper.printViolations(result);

        expect(criticalViolations(result)).toEqual([]);
    });
});
