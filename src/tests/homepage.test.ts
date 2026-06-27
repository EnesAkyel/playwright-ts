import { test, expect } from '../utils/fixtures';
import { epic, feature, story, severity, Severity } from 'allure-js-commons';

test.describe('JSONPlaceholder Homepage', { tag: ['@smoke'] }, () => {

    test('should load the homepage', async ({ homePage }) => {
        await epic('Homepage');
        await feature('Page Load');
        await severity(Severity.BLOCKER);

        const title = await homePage.getTitle();
        expect(title).toMatch(/JSONPlaceholder/);
    });

    test('should display main heading', async ({ homePage }) => {
        await epic('Homepage');
        await feature('Page Content');
        await severity(Severity.NORMAL);

        expect(await homePage.isMainHeadingVisible()).toBeTruthy();
    });

    test('should display sub heading', async ({ homePage }) => {
        await epic('Homepage');
        await feature('Page Content');
        await severity(Severity.NORMAL);

        expect(await homePage.isSubHeadingVisible()).toBeTruthy();
    });

    test('should have correct main heading text', async ({ homePage }) => {
        await epic('Homepage');
        await feature('Page Content');
        await severity(Severity.NORMAL);

        const text = await homePage.getMainHeadingText();
        expect(text).toBe('JSONPlaceholder');
    });

    test('smoke: all key page elements visible in a single pass', async ({ homePage }) => {
        await epic('Homepage');
        await feature('Page Layout');
        await story('Soft-assert all major UI landmarks');
        await severity(Severity.CRITICAL);

        expect.soft(await homePage.getTitle()).toMatch(/JSONPlaceholder/);
        expect.soft(await homePage.isMainHeadingVisible()).toBeTruthy();
        expect.soft(await homePage.isSubHeadingVisible()).toBeTruthy();
        await expect.soft(homePage.page.locator('nav')).toBeVisible();
        await expect.soft(homePage.page.locator('footer')).toBeVisible();
        await expect.soft(homePage.page.locator('a[href*="posts"]').first()).toBeVisible();
        await expect.soft(homePage.page.locator('a[href*="todos"]').first()).toBeVisible();
    });

});
