import { product, promotion1, promotion2 } from "./search-products.test-data";
import { prisma, searchProductsUsecase } from "../../src/composition-root";

describe("Search products integration test", () => {
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
			input = { productId: product.id };
			output = await searchProductsUsecase.execute(input);
		});

		it("Should return correct product id", () => {
			expect(output.product.id).toBe(product.id);
		});

		it("Should return correct product name", () => {
			expect(output.product.name).toBe(product.name);
		});

		it("Should return correct product price", () => {
			expect(output.product.price).toBe(product.price);
		});

		it("Should return correct product unit", () => {
			expect(output.product.unit).toBe("UNKNOWN");
		});

		it("Should return correct promotion id", () => {
			expect(output.promotion.id).toBe(promotion2.id);
		});

		it("Should return correct promotion name", () => {
			expect(output.promotion.name).toBe(promotion2.name);
		});

		it("Should return correct promotion price", () => {
			expect(output.promotion.value).toBe(promotion2.value);
		});

		it("Should return correct promotion unit", () => {
			expect(output.promotion.type).toBe(promotion2.promotionType);
		});
	});

	describe("Abnormal case", () => {
		beforeAll(async () => {
			input = { productId: -1 };
			try {
				output = await searchProductsUsecase.execute(input);
			} catch (e) {
				output = e;
			}
		});

		it("Should return error message", () => {
			expect(output.message).toBe(`Product not found. ${-1}`);
		});
	});
});
