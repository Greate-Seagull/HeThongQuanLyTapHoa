import { product, promotion1, promotion2 } from "./search-products.test-data";
import { prisma, searchProductsUsecase } from "../../src/composition-root";
import z from "zod";

jest.setTimeout(20000);

const outputSchema = z.object({
	product: z.object({
		id: z.literal(product.id),
		name: z.literal(product.name),
		price: z.literal(product.price),
		unit: z.literal("UNKNOWN"),
	}),
	promotion: z.object({
		id: z.literal(promotion2.id),
		name: z.literal(promotion2.name),
		value: z.literal(promotion2.value),
		type: z.literal(promotion2.promotionType),
	}),
});

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

		it("Should return correct product & promotion data", () => {
			expect(() => outputSchema.parse(output)).not.toThrow();
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
			expect(output.message).toBe(
				`Invalid product id, ${input.productId}`
			);
		});
	});
});
