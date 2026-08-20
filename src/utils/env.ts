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
    apiUrl: required('API_URL'),
    username: required('MOVIE_CATALOG_USERNAME'),
    password: required('MOVIE_CATALOG_PASSWORD'),
    environment: process.env.ENVIRONMENT || 'dev',
    headless: process.env.HEADLESS === 'true',
    timeout: Number.parseInt(process.env.TIMEOUT || '30000'),
};
