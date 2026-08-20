import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { ENV } from '../../utils/env';
import { Movie } from '../../utils/dataFactory';

export class AddMoviePage extends BasePage {
    private readonly addUrl = `${ENV.baseUrl}/add`;

    readonly midInput: Locator;
    readonly nameInput: Locator;
    readonly genreSelect: Locator;
    readonly priceInput: Locator;
    readonly ratingSelect: Locator;
    readonly studioInput: Locator;
    readonly submitButton: Locator;
    readonly fieldErrors: Locator;
    readonly midErrorInUse: Locator;
    readonly midErrorRequired: Locator;
    readonly nameErrorRequired: Locator;
    readonly priceErrorRequired: Locator;
    readonly studioErrorRequired: Locator;

    constructor(page: Page) {
        super(page);
        this.midInput = page.getByTestId('mid-input');
        this.nameInput = page.getByTestId('name-input');
        this.genreSelect = page.getByTestId('genre-select');
        this.priceInput = page.getByTestId('price-input');
        this.ratingSelect = page.getByTestId('rating-select');
        this.studioInput = page.getByTestId('studio-input');
        this.submitButton = page.getByTestId('submit-button');
        this.fieldErrors = page.getByTestId('field-errors');
        this.midErrorInUse = page.getByTestId('mid-error-in-use');
        this.midErrorRequired = page.getByTestId('mid-error-required');
        this.nameErrorRequired = page.getByTestId('name-error-required');
        this.priceErrorRequired = page.getByTestId('price-error-required');
        this.studioErrorRequired = page.getByTestId('studio-error-required');
    }

    async openAdd() {
        await this.navigate(this.addUrl);
    }

    async openEdit(mid: number | string) {
        await this.navigate(`${ENV.baseUrl}/movie/${mid}/edit`);
    }

    async fill(movie: Movie) {
        await this.midInput.fill(String(movie.mid));
        await this.nameInput.fill(movie.name);
        await this.genreSelect.selectOption(movie.genre);
        await this.priceInput.fill(String(movie.price));
        await this.ratingSelect.selectOption(movie.rating);
        await this.studioInput.fill(String(movie.studio));
    }

    async submit() {
        await this.submitButton.click();
    }

    async touchAllFieldsWithoutFilling() {
        for (const locator of [this.midInput, this.nameInput, this.priceInput, this.studioInput]) {
            await locator.click();
            await locator.press('Tab');
        }
    }
}
