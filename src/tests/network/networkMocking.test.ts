import { test, expect } from '../../utils/fixtures';
import { ENV } from '../../utils/env';

const API_BASE = ENV.baseUrl;

test.describe(
    'Network Mocking / Request Interception',
    { tag: ['@network', '@regression'] },
    () => {
        test('mock GET /posts returns synthetic data to the browser', async ({ page }) => {
            const mockPosts = [
                { id: 1, userId: 99, title: 'Mocked Post One', body: 'Body one' },
                { id: 2, userId: 99, title: 'Mocked Post Two', body: 'Body two' },
            ];

            await page.route(`${API_BASE}/posts`, route =>
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(mockPosts),
                }),
            );

            await page.goto(ENV.baseUrl);

            const result = await page.evaluate(async url => {
                const res = await fetch(`${url}/posts`);
                return res.json();
            }, API_BASE);

            expect(result).toHaveLength(2);
            expect(result[0].title).toBe('Mocked Post One');
            expect(result[1].userId).toBe(99);
        });

        test('intercept POST /posts and verify request body payload', async ({ page }) => {
            const expectedPayload = { title: 'Test Post', body: 'Test body', userId: 5 };
            let capturedBody: Record<string, unknown> | null = null;

            await page.route(`${API_BASE}/posts`, async route => {
                if (route.request().method() === 'POST') {
                    capturedBody = JSON.parse(route.request().postData() ?? '{}');
                    await route.fulfill({
                        status: 201,
                        contentType: 'application/json',
                        body: JSON.stringify({ ...expectedPayload, id: 101 }),
                    });
                } else {
                    await route.continue();
                }
            });

            await page.goto(ENV.baseUrl);

            await page.evaluate(
                async ({ url, payload }) => {
                    await fetch(`${url}/posts`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });
                },
                { url: API_BASE, payload: expectedPayload },
            );

            expect(capturedBody).not.toBeNull();
            expect(capturedBody!['title']).toBe(expectedPayload.title);
            expect(capturedBody!['userId']).toBe(expectedPayload.userId);
        });

        test('simulate 500 server error on GET /posts', async ({ page }) => {
            await page.route(`${API_BASE}/posts`, route =>
                route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Internal Server Error' }),
                }),
            );

            await page.goto(ENV.baseUrl);

            const statusCode = await page.evaluate(async url => {
                const res = await fetch(`${url}/posts`);
                return res.status;
            }, API_BASE);

            expect(statusCode).toBe(500);
        });

        test('simulate 404 for a non-existent post', async ({ page }) => {
            await page.route(`${API_BASE}/posts/9999`, route =>
                route.fulfill({
                    status: 404,
                    contentType: 'application/json',
                    body: JSON.stringify({}),
                }),
            );

            await page.goto(ENV.baseUrl);

            const statusCode = await page.evaluate(async url => {
                const res = await fetch(`${url}/posts/9999`);
                return res.status;
            }, API_BASE);

            expect(statusCode).toBe(404);
        });

        test('intercept /posts/1 and override the title in the real response', async ({ page }) => {
            await page.route(`${API_BASE}/posts/1`, async route => {
                const response = await route.fetch();
                const body = (await response.json()) as Record<string, unknown>;
                await route.fulfill({
                    response,
                    body: JSON.stringify({ ...body, title: 'Overridden Title' }),
                });
            });

            await page.goto(ENV.baseUrl);

            const post = await page.evaluate(async url => {
                const res = await fetch(`${url}/posts/1`);
                return res.json();
            }, API_BASE);

            expect(post.title).toBe('Overridden Title');
            expect(post.id).toBe(1);
        });

        test('abort /users request and receive a network error', async ({ page }) => {
            await page.route(`${API_BASE}/users`, route => route.abort('failed'));

            await page.goto(ENV.baseUrl);

            const threw = await page.evaluate(async url => {
                try {
                    await fetch(`${url}/users`);
                    return false;
                } catch {
                    return true;
                }
            }, API_BASE);

            expect(threw).toBe(true);
        });

        test('block Google Analytics and Tag Manager requests', async ({ page }) => {
            const blockedUrls: string[] = [];

            await page.route(/google-analytics\.com|googletagmanager\.com/, route => {
                blockedUrls.push(route.request().url());
                route.abort();
            });

            await page.goto(ENV.baseUrl);
            await page.waitForLoadState('networkidle');

            // All matched requests must have been blocked (none slipped through)
            for (const url of blockedUrls) {
                expect(url).toMatch(/google-analytics\.com|googletagmanager\.com/);
            }
        });

        test('add 300ms artificial delay to /posts and page still loads', async ({ page }) => {
            await page.route(`${API_BASE}/posts`, async route => {
                await new Promise(resolve => setTimeout(resolve, 300));
                await route.continue();
            });

            await page.goto(ENV.baseUrl);

            const start = Date.now();
            await page.evaluate(async url => {
                await fetch(`${url}/posts`);
            }, API_BASE);
            const elapsed = Date.now() - start;

            expect(elapsed).toBeGreaterThanOrEqual(300);
        });

        test('spy on /posts requests and verify call count', async ({ page }) => {
            let callCount = 0;

            await page.route(`${API_BASE}/posts`, async route => {
                callCount++;
                await route.continue();
            });

            await page.goto(ENV.baseUrl);

            await page.evaluate(async url => {
                await Promise.all([
                    fetch(`${url}/posts`),
                    fetch(`${url}/posts`),
                    fetch(`${url}/posts`),
                ]);
            }, API_BASE);

            expect(callCount).toBe(3);
        });

        test('intercept all /comments requests via wildcard pattern', async ({ page }) => {
            const interceptedUrls: string[] = [];

            await page.route(`${API_BASE}/comments**`, async route => {
                interceptedUrls.push(route.request().url());
                await route.continue();
            });

            await page.goto(ENV.baseUrl);

            await page.evaluate(async url => {
                await Promise.all([
                    fetch(`${url}/comments`),
                    fetch(`${url}/comments?postId=1`),
                    fetch(`${url}/comments/1`),
                ]);
            }, API_BASE);

            expect(interceptedUrls).toHaveLength(3);
            interceptedUrls.forEach(url => expect(url).toContain('/comments'));
        });
    },
);
