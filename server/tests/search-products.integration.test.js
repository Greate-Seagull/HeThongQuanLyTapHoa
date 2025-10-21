import request from 'supertest';
import app from '../src/app.js';

describe("Search products integration test", () => {
    test("should return successful json", async () => {
        const res = await request(app).get('/products').send({ id: 0 });
    })
})