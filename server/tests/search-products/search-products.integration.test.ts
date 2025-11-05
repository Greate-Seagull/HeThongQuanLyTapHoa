import request from "supertest";
import app from "../../src/app";
import { product } from "./search-products.test-data";
import { prisma } from "../../src/composition-root";

describe("Search products integration test", () => {
	let path;
	let input;
	let output;

	beforeAll(async () => {
		await prisma.product.create({
			data: product as any,
		});
	});

	afterAll(async () => {
		await prisma.product.delete({ where: { id: product.id } });
	});

	describe("Normal case", () => {
		beforeAll(async () => {
			path = `/products/${product.id}`;
			input = {};
			output = await request(app).get(path).send(input);
		});

		it("Should return 200", () => {
			expect(output.status).toBe(200);
		});

		it("Should return correct product id", () => {
			expect(output.body.id).toBe(product.id);
		});

		it("Should return correct product name", () => {
			expect(output.body.name).toBe(product.name);
		});

		it("Should return correct product price", () => {
			expect(output.body.price).toBe(product.price);
		});

		it("Should return correct product unit", () => {
			expect(output.body.unit).toBe("UNKNOWN");
		});
	});

	describe("Abnormal case", () => {
		let fakeId = -1;

		beforeAll(async () => {
			path = `/products/${fakeId}`;
			input = {};
			output = await request(app).get(path).send(input);
		});

		it("Should return error message", () => {
			expect(output.body.message).toBe(`Product not found. ${fakeId}`);
		});
	});
});
