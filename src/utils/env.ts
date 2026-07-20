import dotenv from 'dotenv';
import path from 'node:path';

const environment = process.env.ENV || 'dev';

dotenv.config({ path: path.resolve(process.cwd(), `.env.${environment}`) });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

function required(key: string): string {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required environment variable: ${key}`);
    return value;
}

export const ENV = {
    baseUrl: required('BASE_URL'),
    sauceUrl: required('SAUCE_URL'),
    sauceUsername: required('SAUCE_USERNAME'),
    saucePassword: required('SAUCE_PASSWORD'),
    environment: process.env.ENVIRONMENT || 'dev',
    headless: process.env.HEADLESS === 'true',
    timeout: Number.parseInt(process.env.TIMEOUT || '30000'),
};
