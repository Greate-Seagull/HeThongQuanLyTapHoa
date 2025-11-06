import request from "supertest";
import app from "../../src/app";
import { product, promotion1, promotion2 } from "./search-products.test-data";
import { prisma } from "../../src/composition-root";

describe("Search products integration test", () => {
	let path;
	let input;
	let output;

	beforeAll(async () => {
		await prisma.product.create({
			data: product as any,
		});
		// Use individual create so nested relation `promotionDetails` can be created
		await prisma.promotion.create({ data: promotion1 as any });
		await prisma.promotion.create({ data: promotion2 as any });
	});

	afterAll(async () => {
		await prisma.product.delete({ where: { id: product.id } });
		await prisma.promotion.deleteMany({
			where: {
				id: { in: [promotion1.id, promotion2.id] },
			},
		});
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
			expect(output.body.product.id).toBe(product.id);
		});

		it("Should return correct product name", () => {
			expect(output.body.product.name).toBe(product.name);
		});

		it("Should return correct product price", () => {
			expect(output.body.product.price).toBe(product.price);
		});

		it("Should return correct product unit", () => {
			expect(output.body.product.unit).toBe("UNKNOWN");
		});

		it("Should return correct promotion id", () => {
			expect(output.body.promotion.id).toBe(promotion2.id);
		});

		it("Should return correct promotion name", () => {
			expect(output.body.promotion.name).toBe(promotion2.name);
		});

		it("Should return correct promotion price", () => {
			expect(output.body.promotion.value).toBe(promotion2.value);
		});

		it("Should return correct promotion unit", () => {
			expect(output.body.promotion.type).toBe(promotion2.promotionType);
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
