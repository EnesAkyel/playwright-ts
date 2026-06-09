import { faker } from '@faker-js/faker';

export interface User {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    password: string;
    phone: string;
    address: Address;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface Product {
    name: string;
    price: number;
    quantity: number;
}

export interface Post {
    title: string;
    body: string;
    userId: number;
}

export class DataFactory {

    // ── User ────────────────────────────────────────────────────────
    static createUser(overrides?: Partial<User>): User {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        return {
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            email: faker.internet.email({ firstName, lastName }).toLowerCase(),
            password: faker.internet.password({ length: 12, memorable: false }),
            phone: faker.phone.number(),
            address: DataFactory.createAddress(),
            ...overrides,
        };
    }

    static createSauceUser() {
        return {
            username: process.env.SAUCE_USERNAME || 'standard_user',
            password: process.env.SAUCE_PASSWORD || 'secret_sauce',
        };
    }

    // ── Address ─────────────────────────────────────────────────────
    static createAddress(overrides?: Partial<Address>): Address {
        return {
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipCode: faker.location.zipCode(),
            country: 'US',
            ...overrides,
        };
    }

    // ── Product ─────────────────────────────────────────────────────
    static createProduct(overrides?: Partial<Product>): Product {
        return {
            name: faker.commerce.productName(),
            price: parseFloat(faker.commerce.price({ min: 1, max: 500 })),
            quantity: faker.number.int({ min: 1, max: 10 }),
            ...overrides,
        };
    }

    // ── API Post ─────────────────────────────────────────────────────
    static createPost(overrides?: Partial<Post>): Post {
        return {
            title: faker.lorem.sentence(),
            body: faker.lorem.paragraphs(2),
            userId: faker.number.int({ min: 1, max: 10 }),
            ...overrides,
        };
    }

    // ── Bulk generators ──────────────────────────────────────────────
    static createUsers(count: number): User[] {
        return Array.from({ length: count }, () => DataFactory.createUser());
    }

    static createProducts(count: number): Product[] {
        return Array.from({ length: count }, () => DataFactory.createProduct());
    }

    static createPosts(count: number): Post[] {
        return Array.from({ length: count }, () => DataFactory.createPost());
    }
}
