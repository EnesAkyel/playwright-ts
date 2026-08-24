import { FullConfig } from '@playwright/test';
import { ENV } from './env';

async function checkConnectivity(url: string, name: string): Promise<void> {
    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (response.status >= 500) {
        throw new Error(`${name} returned HTTP ${response.status}`);
    }
}

export default async function globalSetup(_config: FullConfig): Promise<void> {
    const missing = ['BASE_URL', 'API_URL'].filter(k => !process.env[k]);
    if (missing.length) {
        throw new Error(
            `[global setup] Missing required environment variables: ${missing.join(', ')}\n` +
                `Create a .env.local file or export them before running tests.`,
        );
    }

    await Promise.all([
        checkConnectivity(ENV.baseUrl, 'movie-catalog-ui').catch(e => {
            throw new Error(
                `[global setup] movie-catalog-ui unreachable at ${ENV.baseUrl}: ${e.message}`,
            );
        }),
        checkConnectivity(ENV.apiUrl, 'movie-catalog-api').catch(e => {
            throw new Error(
                `[global setup] movie-catalog-api unreachable at ${ENV.apiUrl}: ${e.message}`,
            );
        }),
    ]);

    console.log('[global setup] ✓ environment variables validated');
    console.log(`[global setup] ✓ movie-catalog-ui reachable   (${ENV.baseUrl})`);
    console.log(`[global setup] ✓ movie-catalog-api reachable  (${ENV.apiUrl})`);
}
