import { test as setup } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { ENV } from '../../utils/env';

const AUTH_FILE = '.auth/sauce.json';

setup('authenticate as standard_user and persist storageState', async ({ page }) => {
    await page.goto(ENV.sauceUrl);

    await page.locator('[data-test="username"]').fill(ENV.sauceUsername || 'standard_user');
    await page.locator('[data-test="password"]').fill(ENV.saucePassword || 'secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    await page.waitForURL(/inventory\.html/);
    await page.locator('[data-test="title"]').waitFor();

    fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
    await page.context().storageState({ path: AUTH_FILE });
});