import { test, expect } from '../utils/fixtures';

test.describe('JSONPlaceholder Homepage', { tag: ['@smoke'] }, () => {

    test('should load the homepage', async ({ homePage }) => {
        const title = await homePage.getTitle();
        expect(title).toMatch(/JSONPlaceholder/);
    });

    test('should display main heading', async ({ homePage }) => {
        expect(await homePage.isMainHeadingVisible()).toBeTruthy();
    });

    test('should display sub heading', async ({ homePage }) => {
        expect(await homePage.isSubHeadingVisible()).toBeTruthy();
    });

    test('should have correct main heading text', async ({ homePage }) => {
        const text = await homePage.getMainHeadingText();
        expect(text).toBe('JSONPlaceholder');
    });

});
