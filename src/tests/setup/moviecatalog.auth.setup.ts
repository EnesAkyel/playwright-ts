import { test as setup, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { ENV } from '../../utils/env';

const AUTH_FILE = '.auth/moviecatalog.json';

setup('authenticate and persist storageState', async ({ page }) => {
    await page.goto(`${ENV.baseUrl}/login`);

    await page.getByTestId('username-input').fill(ENV.username);
    await page.getByTestId('password-input').fill(ENV.password);
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL(/\/list$/);
    await expect(page.getByTestId('logout-button')).toBeVisible();

    fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
    await page.context().storageState({ path: AUTH_FILE });
});
