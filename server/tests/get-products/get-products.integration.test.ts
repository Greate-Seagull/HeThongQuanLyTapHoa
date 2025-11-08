import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/composition-root";
import { product1, product2 } from "./get-products.test-data";

describe("Get products integration test", () => {
	let path = "/products";
	let input;
	let output;

	beforeAll(async () => {
		await prisma.product.createMany({ data: [product1, product2] });
	});

	afterAll(async () => {
		await prisma.product.deleteMany({
			where: { id: { in: [product1.id, product2.id] } },
		});
	});

	describe("Normal case", () => {
		beforeAll(async () => {
			input = {};
			output = await request(app).get(path).send(input);
		});

		it("Should return 200", () => {
			expect(output.status).toBe(200);
		});

		it("Should return correct product 1", () => {
			expect(output.body.products[0]).toMatchSnapshot(product1);
		});

		it("Should return correct product 2", () => {
			expect(output.body.products[1]).toMatchSnapshot(product2);
		});
	});

	// describe("Abnormal case", () => {
	// 	let fakeId = -1;

	// 	beforeAll(async () => {
	// 		path = `/products/${fakeId}`;
	// 		input = {};
	// 		output = await request(app).get(path).send(input);
	// 	});

	// 	it("Should return error message", () => {
	// 		expect(output.body.message).toBe(`Product not found. ${fakeId}`);
	// 	});
	// });
});
