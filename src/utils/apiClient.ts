import { APIRequestContext } from '@playwright/test';
import { ENV } from './env';

export interface ApiPost {
    id?: number;
    userId: number;
    title: string;
    body: string;
}

export interface ApiUser {
    id?: number;
    name: string;
    username: string;
    email: string;
    phone?: string;
    website?: string;
}

export interface ApiComment {
    id?: number;
    postId: number;
    name: string;
    email: string;
    body: string;
}

export class ApiClient {
    private readonly baseUrl: string;
    private readonly request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
        this.baseUrl = ENV.baseUrl;
    }

    private async assertOk(
        response: Awaited<ReturnType<APIRequestContext['get']>>,
        context: string,
    ): Promise<void> {
        if (!response.ok()) {
            const body = await response.text().catch(() => '');
            throw new Error(
                `${context} failed: HTTP ${response.status()} ${response.statusText()} — ${body}`,
            );
        }
    }

    async getPosts(): Promise<ApiPost[]> {
        const response = await this.request.get(`${this.baseUrl}/posts`);
        await this.assertOk(response, 'GET /posts');
        return response.json();
    }

    async getPost(id: number): Promise<ApiPost> {
        const response = await this.request.get(`${this.baseUrl}/posts/${id}`);
        await this.assertOk(response, `GET /posts/${id}`);
        return response.json();
    }

    async createPost(post: ApiPost): Promise<ApiPost> {
        const response = await this.request.post(`${this.baseUrl}/posts`, {
            data: post,
        });
        await this.assertOk(response, 'POST /posts');
        return response.json();
    }

    async updatePost(id: number, post: Partial<ApiPost>): Promise<ApiPost> {
        const response = await this.request.put(`${this.baseUrl}/posts/${id}`, {
            data: post,
        });
        await this.assertOk(response, `PUT /posts/${id}`);
        return response.json();
    }

    async deletePost(id: number): Promise<void> {
        const response = await this.request.delete(`${this.baseUrl}/posts/${id}`);
        await this.assertOk(response, `DELETE /posts/${id}`);
    }

    async getPostsByUser(userId: number): Promise<ApiPost[]> {
        const response = await this.request.get(`${this.baseUrl}/posts?userId=${userId}`);
        await this.assertOk(response, `GET /posts?userId=${userId}`);
        return response.json();
    }

    async getUsers(): Promise<ApiUser[]> {
        const response = await this.request.get(`${this.baseUrl}/users`);
        await this.assertOk(response, 'GET /users');
        return response.json();
    }

    async getUser(id: number): Promise<ApiUser> {
        const response = await this.request.get(`${this.baseUrl}/users/${id}`);
        await this.assertOk(response, `GET /users/${id}`);
        return response.json();
    }

    async getCommentsByPost(postId: number): Promise<ApiComment[]> {
        const response = await this.request.get(`${this.baseUrl}/comments?postId=${postId}`);
        await this.assertOk(response, `GET /comments?postId=${postId}`);
        return response.json();
    }

    async getPostStatus(id: number): Promise<number> {
        const response = await this.request.get(`${this.baseUrl}/posts/${id}`);
        return response.status();
    }

    async getStatus(endpoint: string): Promise<number> {
        const response = await this.request.get(`${this.baseUrl}${endpoint}`);
        return response.status();
    }
}
