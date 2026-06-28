import { test, expect } from '@playwright/test';
import { DataFactory } from '../../utils/dataFactory';

test.describe('Data Factory', { tag: ['@unit'] }, () => {
    test('should create a valid user', () => {
        const user = DataFactory.createUser();

        expect(user.firstName).toBeTruthy();
        expect(user.lastName).toBeTruthy();
        expect(user.email).toContain('@');
        expect(user.password.length).toBeGreaterThanOrEqual(12);
        expect(user.address.country).toBe('US');
    });

    test('should create a user with overrides', () => {
        const user = DataFactory.createUser({
            firstName: 'Enes',
            email: 'enes@test.com',
        });

        expect(user.firstName).toBe('Enes');
        expect(user.email).toBe('enes@test.com');
        expect(user.lastName).toBeTruthy(); // still generated
    });

    test('should create multiple users', () => {
        const users = DataFactory.createUsers(5);

        expect(users).toHaveLength(5);
        users.forEach(user => {
            expect(user.email).toContain('@');
        });
    });

    test('should create a valid post', () => {
        const post = DataFactory.createPost();

        expect(post.title).toBeTruthy();
        expect(post.body).toBeTruthy();
        expect(post.userId).toBeGreaterThanOrEqual(1);
        expect(post.userId).toBeLessThanOrEqual(10);
    });

    test('should create a post with overrides', () => {
        const post = DataFactory.createPost({
            title: 'My Custom Title',
            userId: 1,
        });

        expect(post.title).toBe('My Custom Title');
        expect(post.userId).toBe(1);
        expect(post.body).toBeTruthy(); // still generated
    });

    test('should create a valid address', () => {
        const address = DataFactory.createAddress();

        expect(address.street).toBeTruthy();
        expect(address.city).toBeTruthy();
        expect(address.zipCode).toBeTruthy();
        expect(address.country).toBe('US');
    });

    test('should create a valid product', () => {
        const product = DataFactory.createProduct();

        expect(product.name).toBeTruthy();
        expect(product.price).toBeGreaterThan(0);
        expect(product.quantity).toBeGreaterThanOrEqual(1);
    });

    test('should create sauce user credentials', () => {
        const user = DataFactory.createSauceUser();

        expect(user.username).toBeTruthy();
        expect(user.password).toBeTruthy();
    });
});
