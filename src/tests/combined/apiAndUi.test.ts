import { test, expect } from '../../utils/fixtures';
import { DataFactory } from '../../utils/dataFactory';

test.describe('API + UI Combined Tests', { tag: ['@api', '@regression'] }, () => {
    test('API returns 100 posts and UI loads successfully', async ({ apiClient, homePage }) => {
        const posts = await apiClient.getPosts();
        expect(posts).toHaveLength(100);

        expect(await homePage.isMainHeadingVisible()).toBeTruthy();
    });

    test('API creates a post and verifies the response structure', async ({ apiClient }) => {
        const newPost = DataFactory.createPost();
        const created = await apiClient.createPost(newPost);

        expect(created.id).toBeDefined();
        expect(created.title).toBe(newPost.title);
        expect(created.body).toBe(newPost.body);
        expect(created.userId).toBe(newPost.userId);
    });

    test('API fetches a user and their posts are retrievable', async ({ apiClient }) => {
        const user = await apiClient.getUser(1);
        expect(user.id).toBe(1);
        expect(user.email).toContain('@');

        const posts = await apiClient.getPostsByUser(user.id!);
        expect(posts.length).toBeGreaterThan(0);
        posts.forEach(post => {
            expect(post.userId).toBe(user.id);
        });
    });

    test('API verifies post data then UI navigates to the site', async ({
        apiClient,
        homePage,
    }) => {
        const post = await apiClient.getPost(1);
        expect(post.id).toBe(1);
        expect(post.title).toBeTruthy();
        expect(post.body).toBeTruthy();

        expect(await homePage.getTitle()).toContain('JSONPlaceholder');
        expect(await homePage.isMainHeadingVisible()).toBeTruthy();
    });

    test('API validates all endpoints return 200', async ({ apiClient }) => {
        const endpoints = ['/posts', '/users', '/comments', '/albums', '/todos'];

        for (const endpoint of endpoints) {
            const status = await apiClient.getStatus(endpoint);
            expect(status, `Expected ${endpoint} to return 200`).toBe(200);
        }
    });

    test('API creates multiple posts with unique data', async ({ apiClient }) => {
        const posts = DataFactory.createPosts(3);

        const createdPosts = await Promise.all(posts.map(post => apiClient.createPost(post)));

        // JSONPlaceholder always returns id 101 for created posts
        // so we verify content integrity instead of unique IDs
        expect(createdPosts).toHaveLength(3);

        createdPosts.forEach((created, index) => {
            expect(created.id).toBeDefined();
            expect(created.title).toBe(posts[index]!.title);
            expect(created.body).toBe(posts[index]!.body);
            expect(created.userId).toBe(posts[index]!.userId);
        });
    });

    test('API fetches post comments and validates structure', async ({ apiClient }) => {
        const comments = await apiClient.getCommentsByPost(1);

        expect(comments.length).toBeGreaterThan(0);
        comments.forEach(comment => {
            expect(comment.postId).toBe(1);
            expect(comment.email).toContain('@');
            expect(comment.body).toBeTruthy();
            expect(comment.name).toBeTruthy();
        });
    });

    test('API update post and verify response reflects changes', async ({ apiClient }) => {
        const updatedData = {
            title: 'Updated Title',
            body: 'Updated body content',
        };

        const updated = await apiClient.updatePost(1, updatedData);

        expect(updated.title).toBe(updatedData.title);
        expect(updated.body).toBe(updatedData.body);
        expect(updated.id).toBe(1);
    });
});
