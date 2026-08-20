import { Page, Locator } from '@playwright/test';

// Component object for the global ErrorPopupComponent mounted once in app.html
// not a route, so it doesn't extend BasePage.
export class ErrorPopup {
    readonly root: Locator;
    readonly message: Locator;
    readonly refreshButton: Locator;
    readonly dismissButton: Locator;

    constructor(page: Page) {
        this.root = page.getByTestId('error-popup');
        this.message = page.getByTestId('error-popup-message');
        this.refreshButton = page.getByTestId('error-popup-refresh');
        this.dismissButton = page.getByTestId('error-popup-dismiss');
    }
}
