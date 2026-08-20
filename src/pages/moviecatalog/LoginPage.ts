import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { ENV } from '../../utils/env';

export class LoginPage extends BasePage {
    private readonly url = `${ENV.baseUrl}/login`;

    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginSubmit: Locator;
    private readonly errorMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.usernameInput = page.getByTestId('username-input');
        this.passwordInput = page.getByTestId('password-input');
        this.loginSubmit = page.getByTestId('login-submit');
        this.errorMessage = page.getByTestId('login-error-message');
    }

    async open() {
        await this.navigate(this.url);
    }

    async login(username: string, password: string) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginSubmit.click();
    }

    async getErrorMessage(): Promise<string> {
        return this.errorMessage.innerText();
    }

    // The error message renders after an async HTTP round trip, so a plain
    // isVisible() check can race ahead of it - wait for it explicitly.
    async isErrorVisible(): Promise<boolean> {
        try {
            await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async isSubmitDisabled(): Promise<boolean> {
        return this.loginSubmit.isDisabled();
    }
}
