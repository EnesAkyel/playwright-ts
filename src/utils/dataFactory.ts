import { faker } from '@faker-js/faker';

export const GENRES = [
    'Action',
    'Adventure',
    'Comedy',
    'Drama',
    'Fantasy',
    'Horror',
    'Mystery',
    'Romance',
    'Sci-Fi',
    'Thriller',
] as const;

export const RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17'] as const;

export interface Movie {
    mid: number;
    name: string;
    genre: string;
    price: number;
    rating: string;
    studio: number;
}

export interface Credentials {
    username: string;
    password: string;
}

export class DataFactory {
    // Backend/frontend both enforce a 4-digit MID (1000-9999); start well above
    // 1000-1010, the range known fixture movies (e.g. 1001) live in.
    static createMovie(overrides?: Partial<Movie>): Movie {
        return {
            mid: faker.number.int({ min: 2000, max: 9989 }),
            name: faker.music.songName(),
            genre: faker.helpers.arrayElement(GENRES),
            price: Number.parseFloat(faker.commerce.price({ min: 1, max: 50 })),
            rating: faker.helpers.arrayElement(RATINGS),
            studio: faker.number.int({ min: 1, max: 100 }),
            ...overrides,
        };
    }

    static createMovies(count: number): Movie[] {
        return Array.from({ length: count }, () => DataFactory.createMovie());
    }

    static createCredentials(): Credentials {
        return {
            username: process.env.MOVIE_CATALOG_USERNAME ?? '',
            password: process.env.MOVIE_CATALOG_PASSWORD ?? '',
        };
    }
}
