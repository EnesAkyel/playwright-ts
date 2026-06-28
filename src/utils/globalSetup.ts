import { FullConfig } from '@playwright/test';
import { ENV } from './env';

async function checkConnectivity(url: string, name: string): Promise<void> {
    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (response.status >= 500) {
        throw new Error(`${name} returned HTTP ${response.status}`);
    }
}

export default async function globalSetup(_config: FullConfig): Promise<void> {
    const missing = ['SAUCE_URL', 'BASE_URL'].filter(k => !process.env[k]);
    if (missing.length) {
        throw new Error(
            `[global setup] Missing required environment variables: ${missing.join(', ')}\n` +
                `Create a .env.local file or export them before running tests.`,
        );
    }

    await Promise.all([
        checkConnectivity(ENV.sauceUrl, 'SauceDemo').catch(e => {
            throw new Error(
                `[global setup] SauceDemo unreachable at ${ENV.sauceUrl}: ${e.message}`,
            );
        }),
        checkConnectivity(ENV.baseUrl, 'JSONPlaceholder').catch(e => {
            throw new Error(
                `[global setup] JSONPlaceholder unreachable at ${ENV.baseUrl}: ${e.message}`,
            );
        }),
    ]);

    console.log('[global setup] ✓ environment variables validated');
    console.log(`[global setup] ✓ SauceDemo reachable       (${ENV.sauceUrl})`);
    console.log(`[global setup] ✓ JSONPlaceholder reachable  (${ENV.baseUrl})`);
}
