import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class InventoryPage extends BasePage {
    private readonly pageTitle: Locator;
    private readonly inventoryItems: Locator;
    private readonly cartIcon: Locator;
    private readonly cartBadge: Locator;
    private readonly sortDropdown: Locator;

    constructor(page: Page) {
        super(page);
        this.pageTitle = page.locator('[data-test="title"]');
        this.inventoryItems = page.locator('[data-test="inventory-item"]');
        this.cartIcon = page.locator('[data-test="shopping-cart-link"]');
        this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
        this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    }

    async getTitle(): Promise<string> {
        return this.pageTitle.innerText();
    }

    async getItemCount(): Promise<number> {
        return this.inventoryItems.count();
    }

    async addItemToCartByName(productName: string) {
        const item = this.page
            .locator('[data-test="inventory-item"]')
            .filter({ hasText: productName });
        await item.locator('button').click();
    }

    async removeItemFromCartByName(productName: string) {
        await this.addItemToCartByName(productName);
    }

    async getCartBadgeCount(): Promise<number> {
        const text = await this.cartBadge.innerText();
        return Number.parseInt(text);
    }

    async isCartBadgeVisible(): Promise<boolean> {
        return this.cartBadge.isVisible();
    }

    async goToCart() {
        await this.cartIcon.click();
    }

    async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
        await this.sortDropdown.selectOption(option);
    }

    async getProductNames(): Promise<string[]> {
        return this.page.locator('[data-test="inventory-item-name"]').allTextContents();
    }

    async getProductPrices(): Promise<number[]> {
        const prices = await this.page
            .locator('[data-test="inventory-item-price"]')
            .allTextContents();
        return prices.map(p => Number.parseFloat(p.replace('$', '')));
    }
}
