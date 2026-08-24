import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { ENV } from '../../utils/env';

export class ListPage extends BasePage {
    private readonly url = `${ENV.baseUrl}/list`;

    readonly searchInput: Locator;
    readonly ratingFilter: Locator;
    readonly minPriceInput: Locator;
    readonly maxPriceInput: Locator;
    readonly sortByMid: Locator;
    readonly sortByName: Locator;
    readonly prevPageButton: Locator;
    readonly nextPageButton: Locator;
    readonly noSearchResults: Locator;
    readonly listSuccessMessage: Locator;
    readonly listErrorMessage: Locator;
    readonly addMovieLink: Locator;
    readonly logoutButton: Locator;

    constructor(page: Page) {
        super(page);
        this.logoutButton = page.getByTestId('logout-button');
        this.searchInput = page.getByTestId('search-input');
        this.ratingFilter = page.getByTestId('rating-filter');
        this.minPriceInput = page.getByTestId('min-price-input');
        this.maxPriceInput = page.getByTestId('max-price-input');
        this.sortByMid = page.getByTestId('sort-by-mid');
        this.sortByName = page.getByTestId('sort-by-name');
        this.prevPageButton = page.getByTestId('prev-page-button');
        this.nextPageButton = page.getByTestId('next-page-button');
        this.noSearchResults = page.getByTestId('no-search-results');
        this.listSuccessMessage = page.getByTestId('list-success-message');
        this.listErrorMessage = page.getByTestId('list-error-message');
        this.addMovieLink = page.getByTestId('add-movie-link');
    }

    async open() {
        await this.navigate(this.url);
    }

    movieLink(mid: number | string): Locator {
        return this.page.getByTestId(`movie-link-${mid}`);
    }

    deleteButton(mid: number | string): Locator {
        return this.page.getByTestId(`delete-movie-${mid}`);
    }

    confirmDeleteYes(mid: number | string): Locator {
        return this.page.getByTestId(`confirm-delete-yes-${mid}`);
    }

    confirmDeleteNo(mid: number | string): Locator {
        return this.page.getByTestId(`confirm-delete-no-${mid}`);
    }

    sortArrow(column: 'mid' | 'name'): Locator {
        return this.page.getByTestId(`sort-arrow-${column}`);
    }

    genreLink(genre: string): Locator {
        return this.page.getByTestId(`genre-link-${genre}`);
    }
}
