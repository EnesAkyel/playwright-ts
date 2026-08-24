import { test, expect } from '../../utils/fixtures';
import { DataFactory } from '../../utils/dataFactory';
import { ListPage } from '../../pages/moviecatalog/ListPage';
import { MovieDetailPage } from '../../pages/moviecatalog/MovieDetailPage';
import { ErrorPopup } from '../../pages/moviecatalog/ErrorPopup';
import { ENV } from '../../utils/env';
import { epic, feature, story, severity, Severity } from 'allure-js-commons';

test.describe('Network mocking depth', { tag: ['@regression'] }, () => {
    test('network failure on the initial list load falls through to the component’s own error', async ({
        loggedInContext,
    }) => {
        await epic('Network mocking');
        await feature('Network failure');
        await story(
            'An aborted request on the very first /list load surfaces the list’s own error, not the popup',
        );
        await severity(Severity.NORMAL);

        const { context, page } = loggedInContext;
        const errorPopup = new ErrorPopup(page);

        await context.route('**/movies*', route => route.abort('failed'));

        const listPage = new ListPage(page);
        await listPage.open();

        await expect(listPage.listErrorMessage).toHaveText(
            'Could not load movies. Please try again later.',
        );
        await expect(errorPopup.root).toBeHidden();
    });

    test('wildcard pattern mocks every movie-detail request', async ({ loggedInContext }) => {
        await epic('Network mocking');
        await feature('Wildcard route patterns');
        await story('One handler intercepts every /movie/:mid request, not just one exact URL');
        await severity(Severity.NORMAL);

        const { context, page } = loggedInContext;
        const movies = [DataFactory.createMovie(), DataFactory.createMovie()];

        let requestCount = 0;
        await context.route(`${ENV.apiUrl}/movie/**`, async route => {
            requestCount++;
            const mid = Number(new URL(route.request().url()).pathname.split('/').pop());
            const movie = movies.find(m => m.mid === mid);
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(movie),
            });
        });

        const detailPage = new MovieDetailPage(page);

        await detailPage.open(movies[0].mid);
        await expect(page.getByRole('cell', { name: movies[0].name })).toBeVisible();

        await detailPage.open(movies[1].mid);
        await expect(page.getByRole('cell', { name: movies[1].name })).toBeVisible();

        expect(requestCount).toBe(2);
    });

    test('changing a filter issues exactly one new request', async ({ loggedInPage }) => {
        await epic('Network mocking');
        await feature('Request spying');
        await story('A single filter change fires exactly one additional request, not a duplicate');
        await severity(Severity.NORMAL);

        let requestCount = 0;
        await loggedInPage.page.route('**/movies*', async route => {
            requestCount++;
            await route.continue();
        });

        // loggedInPage already navigated to /list, so this is the count after the initial load
        const countBeforeFilterChange = requestCount;

        const [response] = await Promise.all([
            loggedInPage.page.waitForResponse(resp => resp.url().includes('rating=PG-13')),
            loggedInPage.ratingFilter.selectOption('PG-13'),
        ]);

        expect(response.ok()).toBeTruthy();
        expect(requestCount).toBe(countBeforeFilterChange + 1);
    });

    test('the UI stays usable while a request is artificially slow', async ({
        loggedInContext,
    }) => {
        await epic('Network mocking');
        await feature('Latency');
        await story('Typing while a request is in flight does not fire a duplicate request');
        await severity(Severity.NORMAL);

        const { context, page } = loggedInContext;

        let requestCount = 0;
        await context.route('**/movies*', async route => {
            requestCount++;
            await new Promise(resolve => setTimeout(resolve, 500));
            await route.continue();
        });

        const listPage = new ListPage(page);
        await listPage.open();

        // the initial (delayed) request is still in flight at this point - type before it resolves
        await listPage.searchInput.pressSequentially('batman');

        // debounce (300ms) plus this route's own 500ms delay before the search request settles
        await page.waitForResponse(resp => resp.url().includes('size=500'));

        await expect(listPage.listErrorMessage).toBeHidden();
        await expect(listPage.noSearchResults).toBeVisible();
        expect(requestCount).toBe(2);
    });
});
