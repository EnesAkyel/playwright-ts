import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class CartPage extends BasePage {
    private readonly pageTitle: Locator;
    private readonly cartItems: Locator;
    private readonly checkoutButton: Locator;
    private readonly continueShoppingButton: Locator;

    constructor(page: Page) {
        super(page);
        this.pageTitle = page.locator('[data-test="title"]');
        this.cartItems = page.locator('[data-test="inventory-item-desc"]');
        this.checkoutButton = page.locator('[data-test="checkout"]');
        this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    }

    async getTitle(): Promise<string> {
        return this.pageTitle.innerText();
    }

    async getCartItemCount(): Promise<number> {
        return this.cartItems.count();
    }

    async getCartItemNames(): Promise<string[]> {
        return this.page.locator('[data-test="inventory-item-name"]').allTextContents();
    }

    async proceedToCheckout() {
        await this.checkoutButton.click();
    }

    async continueShopping() {
        await this.continueShoppingButton.click();
    }
}
