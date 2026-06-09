import { Page } from '@playwright/test';

export class DebugHelper {

    /**
     * Prints all data-test attribute values found on the current page
     */
    static async printDataTestIds(page: Page): Promise<void> {
        const dataTestIds = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('[data-test]'))
                .map(el => ({
                    tag: el.tagName.toLowerCase(),
                    dataTest: el.getAttribute('data-test'),
                    text: el.textContent?.trim().slice(0, 50) || ''
                }));
        });

        console.log('\n─── data-test IDs on current page ───');
        dataTestIds.forEach(({ tag, dataTest, text }) => {
            console.log(`  [${tag}] data-test="${dataTest}" → "${text}"`);
        });
        console.log('─────────────────────────────────────\n');
    }

    /**
     * Prints all data-test attribute values matching a given prefix
     */
    static async printDataTestIdsByPrefix(page: Page, prefix: string): Promise<void> {
        const dataTestIds = await page.evaluate((prefix) => {
            return Array.from(document.querySelectorAll('[data-test]'))
                .filter(el => el.getAttribute('data-test')?.startsWith(prefix))
                .map(el => ({
                    tag: el.tagName.toLowerCase(),
                    dataTest: el.getAttribute('data-test'),
                    text: el.textContent?.trim().slice(0, 50) || ''
                }));
        }, prefix);

        console.log(`\n─── data-test IDs matching "${prefix}" ───`);
        dataTestIds.forEach(({ tag, dataTest, text }) => {
            console.log(`  [${tag}] data-test="${dataTest}" → "${text}"`);
        });
        console.log('─────────────────────────────────────\n');
    }

    /**
     * Prints the count of elements matching a given selector
     */
    static async printSelectorCount(page: Page, selector: string): Promise<void> {
        const count = await page.locator(selector).count();
        console.log(`\n─── Selector "${selector}" found ${count} element(s) ───\n`);
    }
}
