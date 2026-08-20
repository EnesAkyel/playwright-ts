import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

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
    headless: process.env.HEADLESS === 'true',
    timeout: Number.parseInt(process.env.TIMEOUT || '30000'),
};
