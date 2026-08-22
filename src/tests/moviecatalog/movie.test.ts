import { test, expect } from '../../utils/fixtures';
import { DataFactory } from '../../utils/dataFactory';
import { AddMoviePage } from '../../pages/moviecatalog/AddMoviePage';
import { ListPage } from '../../pages/moviecatalog/ListPage';
import { VisualHelper } from '../../utils/visualHelper';
import { ENV } from '../../utils/env';
import { epic, feature, story, severity, Severity } from 'allure-js-commons';

test.describe('Add/Edit movie', { tag: ['@regression'] }, () => {
    test('all required-field errors surface together on empty submit', async ({
        loggedInAddMoviePage,
    }) => {
        await epic('Add/Edit movie');
        await feature('Client-side validation');
        await story(
            'Every required-field error surfaces at once; submit stays disabled throughout',
        );
        await severity(Severity.NORMAL);

        await loggedInAddMoviePage.touchAllFieldsWithoutFilling();

        await expect.soft(loggedInAddMoviePage.midErrorRequired).toBeVisible();
        await expect.soft(loggedInAddMoviePage.nameErrorRequired).toBeVisible();
        await expect.soft(loggedInAddMoviePage.priceErrorRequired).toBeVisible();
        await expect.soft(loggedInAddMoviePage.studioErrorRequired).toBeVisible();
        await expect.soft(loggedInAddMoviePage.submitButton).toBeDisabled();
    });

    test('server-side validation errors map to the right fields (mocked)', async ({
        loggedInAddMoviePage,
    }) => {
        await epic('Add/Edit movie');
        await feature('Server-side validation');
        await story('A 400 with a structured errors[] body renders as a field-level message');
        await severity(Severity.NORMAL);

        await loggedInAddMoviePage.page.route('**/movie', route =>
            route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({ errors: [{ field: 'price', message: 'must be positive' }] }),
            }),
        );

        await loggedInAddMoviePage.fill(DataFactory.createMovie());
        await loggedInAddMoviePage.submit();

        await expect(loggedInAddMoviePage.fieldErrors).toHaveText(/price: must be positive/);
    });

    test('duplicate MID (409) clears the field and flags it (mocked)', async ({
        loggedInAddMoviePage,
    }) => {
        await epic('Add/Edit movie');
        await feature('Server-side validation');
        await story('A 409 on submit clears just the MID field and keeps the rest of the form');
        await severity(Severity.NORMAL);

        await loggedInAddMoviePage.page.route('**/movie', route =>
            route.fulfill({ status: 409, contentType: 'application/json', body: '{}' }),
        );

        const movie = DataFactory.createMovie();
        await loggedInAddMoviePage.fill(movie);
        await loggedInAddMoviePage.submit();

        await expect(loggedInAddMoviePage.midInput).toHaveValue('');
        await expect(loggedInAddMoviePage.midErrorInUse).toBeVisible();
        await expect(loggedInAddMoviePage.nameInput).toHaveValue(movie.name);
        await expect(loggedInAddMoviePage.priceInput).toHaveValue(String(movie.price));
        await expect(loggedInAddMoviePage.studioInput).toHaveValue(String(movie.studio));
    });

    test('successful add navigates to the list with a success banner', async ({
        loggedInAddMoviePage,
    }) => {
        await epic('Add/Edit movie');
        await feature('Create');
        await story('A valid submit redirects to the list and shows a success banner');
        await severity(Severity.CRITICAL);

        const movie = DataFactory.createMovie();
        await loggedInAddMoviePage.fill(movie);

        await test.step('submit and await the real POST', async () => {
            const [response] = await Promise.all([
                loggedInAddMoviePage.page.waitForResponse(
                    resp => resp.url().endsWith('/movie') && resp.request().method() === 'POST',
                ),
                loggedInAddMoviePage.submit(),
            ]);
            expect(response.ok()).toBeTruthy();
        });

        await test.step('redirects to the list with a success banner', async () => {
            await expect(loggedInAddMoviePage.page).toHaveURL(/\/list$/);
            const listPage = new ListPage(loggedInAddMoviePage.page);
            await expect(listPage.listSuccessMessage).toHaveText(/Movie added successfully\./);
        });
    });

    test('edit mode pre-fills the form and locks the MID', async ({
        loggedInContext,
        apiClient,
    }) => {
        await epic('Add/Edit movie');
        await feature('Edit');
        await story('Opening a known movie for edit locks the MID and pre-fills every other field');
        await severity(Severity.NORMAL);

        await apiClient.login(ENV.username, ENV.password);
        const existing = await apiClient.getMovie('1001');

        const addMoviePage = new AddMoviePage(loggedInContext.page);
        await addMoviePage.openEdit('1001');

        await expect(
            loggedInContext.page.getByRole('heading', { name: 'Edit Movie' }),
        ).toBeVisible();
        await expect(addMoviePage.midInput).toBeDisabled();
        await expect(addMoviePage.midInput).toHaveValue('1001');
        await expect(addMoviePage.nameInput).toHaveValue(existing.name);
        await expect(addMoviePage.genreSelect).toHaveValue(existing.genre);
        await expect(addMoviePage.priceInput).toHaveValue(String(existing.price));
        await expect(addMoviePage.ratingSelect).toHaveValue(existing.rating);
        await expect(addMoviePage.studioInput).toHaveValue(String(existing.studio));
    });

    test('submit stays disabled until the whole form is valid', async ({
        loggedInAddMoviePage,
    }) => {
        await epic('Add/Edit movie');
        await feature('Client-side validation');
        await story('Submit only enables once the last required field becomes valid');
        await severity(Severity.NORMAL);

        const movie = DataFactory.createMovie();

        await expect(loggedInAddMoviePage.submitButton).toBeDisabled();

        await loggedInAddMoviePage.midInput.fill(String(movie.mid));
        await expect(loggedInAddMoviePage.submitButton).toBeDisabled();

        await loggedInAddMoviePage.nameInput.fill(movie.name);
        await expect(loggedInAddMoviePage.submitButton).toBeDisabled();

        await loggedInAddMoviePage.priceInput.fill(String(movie.price));
        await expect(loggedInAddMoviePage.submitButton).toBeDisabled();

        await loggedInAddMoviePage.studioInput.fill(String(movie.studio));
        await expect(loggedInAddMoviePage.submitButton).toBeEnabled();
    });
});

test('add-movie fields render as a uniform grid (visual regression) @visual', async ({
    loggedInAddMoviePage,
    browserName,
}) => {
    await epic('Add/Edit movie');
    await feature('Layout');
    await story('Input/select box-sizing stays visually aligned across the form grid');
    await severity(Severity.MINOR);

    test.skip(
        browserName === 'webkit',
        'Linux baseline is only generated for chromium/firefox — see update-snapshots.yml',
    );

    await VisualHelper.compareElement(loggedInAddMoviePage.page, 'form', 'add-movie-form-grid');
});
