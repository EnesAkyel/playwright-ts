import { test, expect } from '../../utils/fixtures';
import { DataFactory } from '../../utils/dataFactory';
import { MovieDetailPage } from '../../pages/moviecatalog/MovieDetailPage';
import { ListPage } from '../../pages/moviecatalog/ListPage';
import { ENV } from '../../utils/env';
import { epic, feature, story, severity, Severity } from 'allure-js-commons';

test.describe('Movie detail', { tag: ['@regression'] }, () => {
    test('studio ID resolves to studio name', async ({ loggedInContext, apiClient }) => {
        await epic('Movie detail');
        await feature('Studio resolution');
        await story('The studio ID on a movie is resolved to its name via a second lookup');
        await severity(Severity.NORMAL);

        await apiClient.login(ENV.username, ENV.password);
        const movie = await apiClient.getMovie('1001');
        const studios = await apiClient.getStudios();
        const expectedStudio = studios.content.find(studio => studio.sid === movie.studio);
        expect(expectedStudio).toBeDefined();

        const { page } = loggedInContext;
        const detailPage = new MovieDetailPage(page);

        // Both listeners are registered before navigating so neither response can slip
        // past unobserved — the studios call fires fast enough after the movie call
        // that awaiting movieResponse before registering the second listener would race it.
        const movieResponse = page.waitForResponse(
            resp => resp.url().endsWith('/movie/1001') && resp.request().method() === 'GET',
        );
        const studiosResponse = page.waitForResponse(
            resp => resp.url().includes('/studios') && resp.request().method() === 'GET',
        );
        await detailPage.open('1001');
        await movieResponse;
        await studiosResponse;

        await expect(detailPage.studioName).toHaveText(expectedStudio!.name);
    });

    test('nonexistent MID shows a not-found message (mocked)', async ({ loggedInContext }) => {
        await epic('Movie detail');
        await feature('Not found');
        await story('A 404 on the movie fetch renders a not-found message instead of the table');
        await severity(Severity.NORMAL);

        const { context, page } = loggedInContext;
        // Scoped to the API origin only — a bare '**/movie/9999' glob also matches the
        // frontend's own page-navigation request, since /movie/:mid is both the API path
        // and the Angular route, and would replace the whole app shell with the mock body.
        await context.route(`${ENV.apiUrl}/movie/9999`, route =>
            route.fulfill({ status: 404, contentType: 'application/json', body: '{}' }),
        );

        const detailPage = new MovieDetailPage(page);
        await detailPage.open('9999');

        await expect(detailPage.errorMessage).toHaveText("Movie 9999 doesn't exist.");
    });

    test('edit and delete sit in separate left/right cells', async ({ loggedInContext }) => {
        await epic('Movie detail');
        await feature('Layout');
        await story('Delete sits to the right of Edit — a regression guard for the table layout');
        await severity(Severity.MINOR);

        const detailPage = new MovieDetailPage(loggedInContext.page);
        await detailPage.open('1001');

        const editBox = await detailPage.editMovieLink.boundingBox();
        const deleteBox = await detailPage.deleteMovieButton.boundingBox();

        expect(editBox).not.toBeNull();
        expect(deleteBox).not.toBeNull();
        expect(deleteBox!.x).toBeGreaterThan(editBox!.x);
    });

    test('confirming delete from the detail page returns to the list', async ({
        loggedInContext,
        apiClient,
    }) => {
        await epic('Movie detail');
        await feature('Delete');
        await story('Confirming delete from the detail page redirects to the list with a banner');
        await severity(Severity.CRITICAL);

        await apiClient.login(ENV.username, ENV.password);
        const movie = await apiClient.createMovie(DataFactory.createMovie());

        const { page } = loggedInContext;
        const detailPage = new MovieDetailPage(page);
        await detailPage.open(movie.mid);

        await test.step('confirm delete', async () => {
            await detailPage.deleteMovieButton.click();
            await expect(detailPage.confirmDeleteYes).toBeVisible();
            await detailPage.confirmDeleteYes.click();
        });

        await test.step('redirects to the list with a success banner', async () => {
            await expect(page).toHaveURL(/\/list$/);
            const listPage = new ListPage(page);
            await expect(listPage.listSuccessMessage).toHaveText(/Movie deleted successfully\./);
        });
    });
});
