import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { ENV } from '../../utils/env';

export class MovieDetailPage extends BasePage {
    readonly studioName: Locator;
    readonly editMovieLink: Locator;
    readonly deleteMovieButton: Locator;
    readonly confirmDeleteYes: Locator;
    readonly confirmDeleteNo: Locator;

    constructor(page: Page) {
        super(page);
        this.studioName = page.getByTestId('studio-name');
        this.editMovieLink = page.getByTestId('edit-movie-link');
        this.deleteMovieButton = page.getByTestId('delete-movie-button');
        this.confirmDeleteYes = page.getByTestId('confirm-delete-yes');
        this.confirmDeleteNo = page.getByTestId('confirm-delete-no');
    }

    async open(mid: number | string) {
        await this.navigate(`${ENV.baseUrl}/movie/${mid}`);
    }
}
