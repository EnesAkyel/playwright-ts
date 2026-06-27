import { Page, expect } from '@playwright/test';

export interface VisualOptions {
    maxDiffPixels?: number;
    maxDiffPixelRatio?: number;
    threshold?: number;
    fullPage?: boolean;
}

export class VisualHelper {
    static async compareFullPage(
        page: Page,
        snapshotName: string,
        options: VisualOptions = {}
    ): Promise<void> {
        await expect(page).toHaveScreenshot(`${snapshotName}.png`, {
            fullPage: options.fullPage ?? true,
            maxDiffPixels: options.maxDiffPixels ?? 500,
            threshold: options.threshold ?? 0.2,
        });
    }

    static async compareElement(
        page: Page,
        selector: string,
        snapshotName: string,
        options: VisualOptions = {}
    ): Promise<void> {
        const element = page.locator(selector);
        await expect(element).toHaveScreenshot(`${snapshotName}.png`, {
            maxDiffPixels: options.maxDiffPixels ?? 100,
            threshold: options.threshold ?? 0.2,
        });
    }

    static getUpdateCommand(testFile: string): string {
        return `npx playwright test ${testFile} --update-snapshots`;
    }
}
