import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { ENV } from '../../utils/env';

export class LoginPage extends BasePage {
    private readonly url = ENV.sauceUrl;

    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;
    private readonly errorMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.usernameInput = page.locator('[data-test="username"]');
        this.passwordInput = page.locator('[data-test="password"]');
        this.loginButton = page.locator('[data-test="login-button"]');
        this.errorMessage = page.locator('[data-test="error"]');
    }

    async open() {
        await this.navigate(this.url);
        await this.waitForPageLoad();
    }

    async login(username: string, password: string) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    async getErrorMessage(): Promise<string> {
        return this.errorMessage.innerText();
    }

    async isErrorVisible(): Promise<boolean> {
        return this.errorMessage.isVisible();
    }
}
