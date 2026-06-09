import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { User } from '../../utils/dataFactory';

export class CheckoutPage extends BasePage {
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly zipCodeInput: Locator;
    private readonly continueButton: Locator;
    private readonly finishButton: Locator;
    private readonly confirmationHeader: Locator;
    private readonly confirmationText: Locator;
    private readonly errorMessage: Locator;
    private readonly summaryTotal: Locator;

    constructor(page: Page) {
        super(page);
        this.firstNameInput = page.locator('[data-test="firstName"]');
        this.lastNameInput = page.locator('[data-test="lastName"]');
        this.zipCodeInput = page.locator('[data-test="postalCode"]');
        this.continueButton = page.locator('[data-test="continue"]');
        this.finishButton = page.locator('[data-test="finish"]');
        this.confirmationHeader = page.locator('[data-test="complete-header"]');
        this.confirmationText = page.locator('[data-test="complete-text"]');
        this.errorMessage = page.locator('[data-test="error"]');
        this.summaryTotal = page.locator('[data-test="total-label"]');
    }

    async fillShippingInfo(user: User) {
        await this.firstNameInput.fill(user.firstName);
        await this.lastNameInput.fill(user.lastName);
        await this.zipCodeInput.fill(user.address.zipCode);
    }

    async continue() {
        await this.continueButton.click();
    }

    async finish() {
        await this.finishButton.click();
    }

    async getConfirmationHeader(): Promise<string> {
        return this.confirmationHeader.innerText();
    }

    async getConfirmationText(): Promise<string> {
        return this.confirmationText.innerText();
    }

    async getOrderTotal(): Promise<string> {
        return this.summaryTotal.innerText();
    }

    async isErrorVisible(): Promise<boolean> {
        return this.errorMessage.isVisible();
    }

    async getErrorMessage(): Promise<string> {
        return this.errorMessage.innerText();
    }
}
