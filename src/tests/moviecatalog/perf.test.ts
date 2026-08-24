import { test, expect } from '../../utils/fixtures';
import { DataFactory } from '../../utils/dataFactory';
import { ListPage } from '../../pages/moviecatalog/ListPage';
import { ENV } from '../../utils/env';
import { epic, feature, story, severity, Severity } from 'allure-js-commons';

test.describe('Performance budgets', { tag: ['@regression'] }, () => {
    test('movie list loads within budget', async ({ loggedInContext }) => {
        await epic('Performance');
        await feature('Page load');
        await story('The list page reaches DOMContentLoaded/load within a fixed budget');
        await severity(Severity.NORMAL);

        const { page } = loggedInContext;
        await page.goto(`${ENV.baseUrl}/list`);
        await expect(page.getByTestId('search-input')).toBeVisible();

        const timing = await page.evaluate(() => {
            const [entry] = performance.getEntriesByType(
                'navigation',
            ) as PerformanceNavigationTiming[];
            return {
                domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
                loadEventEnd: entry.loadEventEnd,
            };
        });

        expect(timing.domContentLoadedEventEnd).toBeLessThan(5000);
        expect(timing.loadEventEnd).toBeLessThan(8000);
    });

    test('JS heap stays within budget after paging and filtering (Chromium only)', async ({
        loggedInPage,
        browserName,
    }) => {
        test.skip(browserName !== 'chromium', 'performance.memory is a Chromium-only API');

        await epic('Performance');
        await feature('Memory');
        await story('Paging through results and applying filters does not blow the JS heap budget');
        await severity(Severity.NORMAL);

        // page through as many pages as are available, capped so the test stays fast
        for (let i = 0; i < 3; i++) {
            if (await loggedInPage.nextPageButton.isDisabled()) break;
            await loggedInPage.nextPageButton.click();
        }

        await loggedInPage.ratingFilter.selectOption('PG-13');
        await loggedInPage.waitForPageLoad();
        await loggedInPage.ratingFilter.selectOption('');
        await loggedInPage.waitForPageLoad();

        const heapBytes = await loggedInPage.page.evaluate(
            () =>
                (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory
                    ?.usedJSHeapSize ?? 0,
        );

        // a coarse regression guard, not a tuned budget - catches an obvious leak
        // (e.g. an unsubscribed observable), not gradual, expected growth
        expect(heapBytes).toBeLessThan(150 * 1024 * 1024);
    });

    test('add-movie round trip completes within a time threshold', async ({
        loggedInAddMoviePage,
    }) => {
        await epic('Performance');
        await feature('Add movie');
        await story('Fill → submit → list redirect completes under a fixed wall-clock budget');
        await severity(Severity.NORMAL);

        const movie = DataFactory.createMovie();
        const start = Date.now();

        await loggedInAddMoviePage.fill(movie);
        await loggedInAddMoviePage.submit();

        const listPage = new ListPage(loggedInAddMoviePage.page);
        await expect(listPage.listSuccessMessage).toHaveText(/Movie added successfully\./);

        expect(Date.now() - start).toBeLessThan(5000);
    });
});
