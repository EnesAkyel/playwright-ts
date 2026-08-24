import { Page } from '@playwright/test';
import { test, expect } from '../../utils/fixtures';
import { DataFactory } from '../../utils/dataFactory';
import { ListPage } from '../../pages/moviecatalog/ListPage';
import { MovieDetailPage } from '../../pages/moviecatalog/MovieDetailPage';
import { ENV } from '../../utils/env';
import { epic, feature, story, severity, Severity } from 'allure-js-commons';

// Repeatedly presses Tab until the focused element carries the given data-testid, so the
// test doesn't hardcode a brittle tab-stop count through the genre navbar / filter form.
async function tabUntilFocused(page: Page, testId: string, maxTabs = 40) {
    for (let i = 0; i < maxTabs; i++) {
        await page.keyboard.press('Tab');
        const focusedTestId = await page.evaluate(
            () => document.activeElement?.getAttribute('data-testid') ?? null,
        );
        if (focusedTestId === testId) return;
    }
    throw new Error(
        `Could not reach an element with data-testid="${testId}" within ${maxTabs} Tab presses`,
    );
}

test.describe('Cross-cutting / non-functional', { tag: ['@regression'] }, () => {
    test('keyboard-only path through login → search → detail → back', async ({ page }) => {
        await epic('Non-functional');
        await feature('Keyboard accessibility');
        await story('Login, search, open a detail page, and return to the list, mouse-free');
        await severity(Severity.NORMAL);

        const { username, password } = DataFactory.createCredentials();

        await test.step('log in via the keyboard', async () => {
            await tabUntilFocused(page, 'username-input');
            await page.keyboard.type(username);

            await tabUntilFocused(page, 'password-input');
            await page.keyboard.type(password);

            await tabUntilFocused(page, 'login-submit');
            await page.keyboard.press('Enter');

            await expect(page).toHaveURL(/\/list$/);
        });

        const listPage = new ListPage(page);

        await test.step('search for a known movie via the keyboard', async () => {
            await tabUntilFocused(page, 'search-input');
            await page.keyboard.type('1001');

            await expect(listPage.movieLink(1001)).toBeVisible();
        });

        await test.step('tab to the result link and open it', async () => {
            await tabUntilFocused(page, 'movie-link-1001');
            await page.keyboard.press('Enter');

            await expect(page).toHaveURL(/\/movie\/1001$/);
        });

        const detailPage = new MovieDetailPage(page);

        await test.step('tab back to the list link and return', async () => {
            await expect(detailPage.listLink).toBeVisible();
            await tabUntilFocused(page, 'list-link');
            await page.keyboard.press('Enter');

            await expect(page).toHaveURL(/\/list$/);
        });
    });

    test('no native dialogs anywhere in the delete flow', async ({
        loggedInContext,
        apiClient,
    }) => {
        await epic('Non-functional');
        await feature('Delete confirmation');
        await story('The list and detail delete flows never rely on a native browser dialog');
        await severity(Severity.NORMAL);

        await apiClient.login(ENV.username, ENV.password);
        const listMovie = await apiClient.createMovie(DataFactory.createMovie());
        const detailMovie = await apiClient.createMovie(DataFactory.createMovie());

        const { page } = loggedInContext;

        let dialogFired = false;
        page.on('dialog', dialog => {
            dialogFired = true;
            void dialog.dismiss();
        });

        await test.step('delete flow on the list page', async () => {
            const listPage = new ListPage(page);
            await listPage.open();

            await listPage.searchInput.fill(String(listMovie.mid));
            await expect(listPage.movieLink(listMovie.mid)).toBeVisible();

            await listPage.deleteButton(listMovie.mid).click();
            await expect(listPage.confirmDeleteYes(listMovie.mid)).toBeVisible();
            await listPage.confirmDeleteYes(listMovie.mid).click();

            await expect(listPage.movieLink(listMovie.mid)).toBeHidden();
        });

        await test.step('delete flow on the detail page', async () => {
            const detailPage = new MovieDetailPage(page);
            await detailPage.open(detailMovie.mid);

            await detailPage.deleteMovieButton.click();
            await expect(detailPage.confirmDeleteYes).toBeVisible();
            await detailPage.confirmDeleteYes.click();

            await expect(page).toHaveURL(/\/list$/);
        });

        expect(dialogFired).toBeFalsy();
    });
});
