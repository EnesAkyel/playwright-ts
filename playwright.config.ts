import { defineConfig, devices } from '@playwright/test';
import { ENV } from './src/utils/env';

export default defineConfig({
    testDir: './src/tests',
    timeout: ENV.timeout,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 2 : undefined,
    reporter: [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['allure-playwright', { outputFolder: 'allure-results' }],
        ['./src/reporters/SummaryReporter.ts'],
    ],
    use: {
        headless: ENV.headless,
        baseURL: ENV.baseUrl,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'on-first-retry',
    },
    projects: [
        // ── Auth setup: logs in once and writes .auth/sauce.json ─────────────
        {
            name: 'auth-setup',
            testMatch: /.*auth\.setup\.ts/,
        },

        // ── Standard projects: login per-test, skip auth-persistence suite ───
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            testIgnore: /.*authPersistence\.test\.ts/,
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            testIgnore: /.*authPersistence\.test\.ts/,
        },

        // ── Authenticated project: reuses storageState, no per-test login ────
        {
            name: 'chromium-authenticated',
            use: {
                ...devices['Desktop Chrome'],
                storageState: '.auth/sauce.json',
            },
            dependencies: ['auth-setup'],
            testMatch: /.*authPersistence\.test\.ts/,
        },
    ],
});
