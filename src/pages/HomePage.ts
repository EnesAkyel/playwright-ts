import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ENV } from '../utils/env';

export class HomePage extends BasePage {
    private readonly url = ENV.baseUrl;

    private readonly mainHeading: Locator;
    private readonly subHeading: Locator;

    constructor(page: Page) {
        super(page);
        this.mainHeading = page.getByRole('heading', { name: 'JSONPlaceholder' });
        this.subHeading = page.getByRole('heading', { name: /Free fake and reliable API/i });
    }

    async open() {
        await this.navigate(this.url);
        await this.waitForPageLoad();
    }

    async getMainHeadingText(): Promise<string> {
        return this.mainHeading.innerText();
    }

    async getSubHeadingText(): Promise<string> {
        return this.subHeading.innerText();
    }

    async isMainHeadingVisible(): Promise<boolean> {
        return this.mainHeading.isVisible();
    }

    async isSubHeadingVisible(): Promise<boolean> {
        return this.subHeading.isVisible();
    }
}
