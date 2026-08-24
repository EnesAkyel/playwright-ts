import { test, expect } from '../../utils/fixtures';
import { DataFactory } from '../../utils/dataFactory';
import { ErrorPopup } from '../../pages/moviecatalog/ErrorPopup';
import { epic, feature, story, severity, Severity } from 'allure-js-commons';

test.describe('Global error popup', { tag: ['@regression'] }, () => {
    test('a 5XX on any call shows a refreshable popup (mocked)', async ({ loggedInPage }) => {
        await epic('Global error popup');
        await feature('5XX');
        await story('A 5XX response triggers a refreshable "something went wrong" popup');
        await severity(Severity.CRITICAL);

        const errorPopup = new ErrorPopup(loggedInPage.page);

        await loggedInPage.page.route('**/movies*', route =>
            route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }),
        );
        await loggedInPage.ratingFilter.selectOption('PG-13');

        await expect(errorPopup.root).toBeVisible();
        await expect(errorPopup.message).toHaveText(
            'Something went wrong. Please refresh the page and try again.',
        );
        await expect(errorPopup.refreshButton).toBeVisible();

        await Promise.all([
            loggedInPage.page.waitForEvent('load'),
            errorPopup.refreshButton.click(),
        ]);
    });

    test('dismissing the popup is non-destructive', async ({ loggedInPage }) => {
        await epic('Global error popup');
        await feature('Dismiss');
        await story('Dismissing the popup leaves the page underneath untouched');
        await severity(Severity.NORMAL);

        const errorPopup = new ErrorPopup(loggedInPage.page);

        const seededMovieLink = loggedInPage.movieLink(1001);
        await expect(seededMovieLink).toBeVisible();

        await loggedInPage.page.route('**/movies*', route =>
            route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }),
        );
        await loggedInPage.ratingFilter.selectOption('PG-13');

        await expect(errorPopup.root).toBeVisible();
        await errorPopup.dismissButton.click();

        await expect(errorPopup.root).toBeHidden();
        await expect(seededMovieLink).toBeVisible();
    });

    test('4XX popup coexists with a field-specific error, 401 popup suppresses the page entirely', async ({
        loggedInAddMoviePage,
    }) => {
        await epic('Global error popup');
        await feature('Interceptor asymmetry');
        await story(
            '4XX/5XX popups are additive with the page’s own error handling; 401 is exclusive',
        );
        await severity(Severity.CRITICAL);

        const errorPopup = new ErrorPopup(loggedInAddMoviePage.page);

        await test.step('409 duplicate MID: popup and field-level error both appear', async () => {
            await loggedInAddMoviePage.page.route('**/movie', route =>
                route.fulfill({ status: 409, contentType: 'application/json', body: '{}' }),
            );

            await loggedInAddMoviePage.fill(DataFactory.createMovie());
            await loggedInAddMoviePage.submit();

            await expect(errorPopup.root).toBeVisible();
            await expect(errorPopup.message).toHaveText(
                'Something went wrong. Please refresh the page and try again.',
            );
            await expect(loggedInAddMoviePage.midErrorInUse).toBeVisible();
        });

        await test.step('401: popup appears but the form’s own error never renders, page is replaced', async () => {
            // The 409 step's popup is still up and would intercept clicks on the form underneath.
            await errorPopup.dismissButton.click();
            await loggedInAddMoviePage.page.unroute('**/movie');
            await loggedInAddMoviePage.page.route('**/movie', route =>
                route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }),
            );

            // MID was cleared by the 409 branch above; refill just that field so the form is valid again.
            const movie = DataFactory.createMovie();
            await loggedInAddMoviePage.midInput.fill(String(movie.mid));
            await loggedInAddMoviePage.submit();

            await expect(errorPopup.root).toBeVisible();
            await expect(errorPopup.message).toHaveText(
                'Your session has expired. Please log in again.',
            );
            await expect(loggedInAddMoviePage.page).toHaveURL(/\/login$/);
            await expect(loggedInAddMoviePage.errorMessage).toHaveCount(0);
        });
    });

    test('a network failure falls through to the component’s own error, not the popup', async ({
        loggedInPage,
    }) => {
        await epic('Global error popup');
        await feature('Network failure');
        await story('An aborted request (status 0) is neither a 401 nor >= 400 to the interceptor');
        await severity(Severity.NORMAL);

        const errorPopup = new ErrorPopup(loggedInPage.page);

        await loggedInPage.page.route('**/movies*', route => route.abort('failed'));
        await loggedInPage.ratingFilter.selectOption('PG-13');

        await expect(loggedInPage.listErrorMessage).toHaveText(
            'Could not load movies. Please try again later.',
        );
        await expect(errorPopup.root).toBeHidden();
    });
});
