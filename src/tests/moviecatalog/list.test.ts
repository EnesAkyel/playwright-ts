import { test, expect } from '../../utils/fixtures';
import { DataFactory, GENRES } from '../../utils/dataFactory';
import { ListPage } from '../../pages/moviecatalog/ListPage';
import { ENV } from '../../utils/env';
import { epic, feature, story, severity, Severity } from 'allure-js-commons';

function moviesPage(overrides: {
    content?: ReturnType<typeof DataFactory.createMovies>;
    totalPages?: number;
    totalElements?: number;
}) {
    const content = overrides.content ?? DataFactory.createMovies(10);
    return {
        content,
        page: 0,
        size: 10,
        totalElements: overrides.totalElements ?? content.length,
        totalPages: overrides.totalPages ?? 1,
    };
}

test.describe('Movie list', { tag: ['@regression'] }, () => {
    test('search is debounced to a single request', async ({ loggedInPage }) => {
        await epic('Movie list');
        await feature('Search');
        await story('Typing debounces to exactly one request, fired only after the clock advances');
        await severity(Severity.NORMAL);

        let requestCount = 0;
        await loggedInPage.page.route('**/movies*', async route => {
            requestCount++;
            await route.continue();
        });

        await loggedInPage.page.clock.install();

        await loggedInPage.searchInput.pressSequentially('batman');
        expect(requestCount).toBe(0);

        await loggedInPage.page.clock.runFor(300);
        await expect.poll(() => requestCount).toBe(1);
    });

    test('no search matches shows the empty state (mocked)', async ({ loggedInContext }) => {
        await epic('Movie list');
        await feature('Search');
        await story('A search string matching nothing renders the empty-state row, not the list');
        await severity(Severity.NORMAL);

        const { context, page } = loggedInContext;
        await context.route('**/movies*', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(moviesPage({ content: DataFactory.createMovies(2) })),
            }),
        );

        const listPage = new ListPage(page);
        await listPage.open();

        await listPage.searchInput.fill('zzzznonexistentmoviezzzz');

        await expect(listPage.noSearchResults).toBeVisible();
        await expect(listPage.noSearchResults).toHaveText('No movies match your search.');
        await expect(listPage.prevPageButton).toBeHidden();
        await expect(listPage.nextPageButton).toBeHidden();
    });

    test('rating + price filters combine and reset to page 0', async ({ loggedInContext }) => {
        await epic('Movie list');
        await feature('Filters');
        await story('Changing a filter re-fetches with the combined query and resets to page 0');
        await severity(Severity.NORMAL);

        const { context, page } = loggedInContext;
        await context.route('**/movies*', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(moviesPage({ totalPages: 3, totalElements: 25 })),
            }),
        );

        const listPage = new ListPage(page);
        await listPage.open();

        await listPage.nextPageButton.click();

        const [response] = await Promise.all([
            page.waitForResponse(
                resp => resp.url().includes('rating=PG-13') && resp.url().includes('minPrice=10'),
            ),
            listPage.ratingFilter.selectOption('PG-13'),
            listPage.minPriceInput.fill('10'),
        ]);

        expect(response.url()).toContain('page=0');
    });

    test('sort toggles direction on repeated clicks', async ({ loggedInPage }) => {
        await epic('Movie list');
        await feature('Sorting');
        await story(
            'Repeated clicks on a sort column flip direction; the other column switches ascending',
        );
        await severity(Severity.NORMAL);

        // sortColumn defaults to 'mid' ascending, so the arrow is already showing
        await expect(loggedInPage.sortArrow('mid')).toHaveText('▲');

        await loggedInPage.sortByMid.click();
        await expect(loggedInPage.sortArrow('mid')).toHaveText('▼');

        await loggedInPage.sortByMid.click();
        await expect(loggedInPage.sortArrow('mid')).toHaveText('▲');

        await loggedInPage.sortByName.click();
        await expect(loggedInPage.sortArrow('name')).toHaveText('▲');
        await expect(loggedInPage.sortArrow('mid')).toBeHidden();
    });

    test('pagination buttons disable at both boundaries (mocked)', async ({ loggedInContext }) => {
        await epic('Movie list');
        await feature('Pagination');
        await story('Prev/Next disable exactly at the first/last page boundary');
        await severity(Severity.NORMAL);

        const { context, page } = loggedInContext;
        await context.route('**/movies*', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(moviesPage({ totalPages: 3, totalElements: 25 })),
            }),
        );

        const listPage = new ListPage(page);
        await listPage.open();

        await expect(listPage.prevPageButton).toBeDisabled();
        await expect(listPage.nextPageButton).toBeEnabled();

        await listPage.nextPageButton.click();
        await listPage.nextPageButton.click();

        await expect(listPage.nextPageButton).toBeDisabled();
        await expect(listPage.prevPageButton).toBeEnabled();
    });

    test('delete confirmation flow and auto-dismissing toast', async ({
        loggedInPage,
        apiClient,
    }) => {
        await epic('Movie list');
        await feature('Delete');
        await story('Confirming a delete removes the row and auto-dismisses the success toast');
        await severity(Severity.CRITICAL);

        await apiClient.login(ENV.username, ENV.password);
        const movie = await apiClient.createMovie(DataFactory.createMovie());

        await test.step('search for the seeded movie by MID', async () => {
            await loggedInPage.searchInput.fill(String(movie.mid));
            await expect(loggedInPage.movieLink(movie.mid)).toBeVisible();
        });

        await loggedInPage.page.clock.install();

        await test.step('confirm delete', async () => {
            await loggedInPage.deleteButton(movie.mid).click();
            await expect(loggedInPage.confirmDeleteYes(movie.mid)).toBeVisible();
            await loggedInPage.confirmDeleteYes(movie.mid).click();

            await expect(loggedInPage.movieLink(movie.mid)).toBeHidden();
            await expect(loggedInPage.listSuccessMessage).toHaveText(
                /Movie deleted successfully\./,
            );
        });

        await test.step('toast auto-dismisses after 4s', async () => {
            await loggedInPage.page.clock.runFor(4000);
            await expect(loggedInPage.listSuccessMessage).toBeHidden();
        });
    });

    test('canceling a pending delete leaves the row intact', async ({
        loggedInPage,
        apiClient,
    }) => {
        await epic('Movie list');
        await feature('Delete');
        await story('Declining the delete confirmation leaves the row untouched');
        await severity(Severity.NORMAL);

        await apiClient.login(ENV.username, ENV.password);
        const movie = await apiClient.createMovie(DataFactory.createMovie());

        await loggedInPage.searchInput.fill(String(movie.mid));
        await expect(loggedInPage.movieLink(movie.mid)).toBeVisible();

        await loggedInPage.deleteButton(movie.mid).click();
        await loggedInPage.confirmDeleteNo(movie.mid).click();

        await expect(loggedInPage.movieLink(movie.mid)).toBeVisible();
        await expect(loggedInPage.confirmDeleteYes(movie.mid)).toBeHidden();
    });

    for (const genre of GENRES) {
        test(`genre link "${genre}" filters and self-marks active`, async ({ loggedInPage }) => {
            await epic('Movie list');
            await feature('Genre navbar');
            await story(`Clicking the ${genre} genre link filters and marks it active`);
            await severity(Severity.MINOR);

            await loggedInPage.genreLink(genre).click();

            await expect(loggedInPage.page).toHaveURL(new RegExp(`/genre/${genre}$`));
            await expect(loggedInPage.genreLink(genre)).toHaveClass(/active/);

            const siblings = GENRES.filter(other => other !== genre);
            for (const sibling of siblings) {
                await expect(loggedInPage.genreLink(sibling)).not.toHaveClass(/active/);
            }
        });
    }
});
