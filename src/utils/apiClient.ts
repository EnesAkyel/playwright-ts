import { APIRequestContext } from '@playwright/test';
import { ENV } from './env';
import { Movie } from './dataFactory';

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface Studio {
    sid: number;
    name: string;
}

export interface MovieQuery {
    genre?: string;
    rating?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    size?: number;
}

export class ApiClient {
    private readonly baseUrl: string;
    private readonly request: APIRequestContext;
    private token: string | null = null;

    constructor(request: APIRequestContext) {
        this.request = request;
        this.baseUrl = ENV.apiUrl;
    }

    private async assertOk(
        response: Awaited<ReturnType<APIRequestContext['get']>>,
        context: string,
    ): Promise<void> {
        if (!response.ok()) {
            const body = await response.text().catch(() => '');
            throw new Error(
                `${context} failed: HTTP ${response.status()} ${response.statusText()} - ${body}`,
            );
        }
    }

    private authHeaders(): Record<string, string> {
        return this.token ? { Authorization: `Bearer ${this.token}` } : {};
    }

    async login(username: string, password: string): Promise<string> {
        const response = await this.request.post(`${this.baseUrl}/auth/login`, {
            data: { username, password },
        });
        await this.assertOk(response, 'POST /auth/login');
        const body = (await response.json()) as { token: string };
        this.token = body.token;
        return this.token;
    }

    async getMovies(query: MovieQuery = {}): Promise<PageResponse<Movie>> {
        const response = await this.request.get(`${this.baseUrl}/movies`, {
            params: query as Record<string, string | number>,
            headers: this.authHeaders(),
        });
        await this.assertOk(response, 'GET /movies');
        return response.json();
    }

    async getMovie(mid: number | string): Promise<Movie> {
        const response = await this.request.get(`${this.baseUrl}/movie/${mid}`, {
            headers: this.authHeaders(),
        });
        await this.assertOk(response, `GET /movie/${mid}`);
        return response.json();
    }

    async createMovie(movie: Movie): Promise<Movie> {
        const response = await this.request.post(`${this.baseUrl}/movie`, {
            data: movie,
            headers: this.authHeaders(),
        });
        await this.assertOk(response, 'POST /movie');
        return response.json();
    }

    async updateMovie(mid: number | string, movie: Partial<Movie>): Promise<Movie> {
        const response = await this.request.put(`${this.baseUrl}/movie/${mid}`, {
            data: movie,
            headers: this.authHeaders(),
        });
        await this.assertOk(response, `PUT /movie/${mid}`);
        return response.json();
    }

    async deleteMovie(mid: number | string): Promise<void> {
        const response = await this.request.delete(`${this.baseUrl}/movie/${mid}`, {
            headers: this.authHeaders(),
        });
        await this.assertOk(response, `DELETE /movie/${mid}`);
    }

    async getStudios(): Promise<PageResponse<Studio>> {
        const response = await this.request.get(`${this.baseUrl}/studios`, {
            params: { size: 100 },
            headers: this.authHeaders(),
        });
        await this.assertOk(response, 'GET /studios');
        return response.json();
    }

    async getStatus(endpoint: string): Promise<number> {
        const response = await this.request.get(`${this.baseUrl}${endpoint}`, {
            headers: this.authHeaders(),
        });
        return response.status();
    }
}
