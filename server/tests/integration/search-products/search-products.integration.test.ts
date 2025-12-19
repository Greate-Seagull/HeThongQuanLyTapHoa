import { product, promotion1, promotion2 } from "./search-products.test-data";
import { prisma, searchProductsUsecase } from "../../../src/composition-root";
import z from "zod";

jest.setTimeout(20000);

describe("Search products integration test", () => {
	let input;
	let output;
	let createdProduct: any;

	beforeAll(async () => {
		// Clean up first
		await prisma.promotionDetail.deleteMany({
			where: { 
				OR: [
					{ productId: { gte: 99990 } },
					{ promotionId: { in: [promotion1.id, promotion2.id] } }
				]
			}
		});
		await prisma.promotion.deleteMany({
			where: { id: { in: [promotion1.id, promotion2.id] } },
		});
		await prisma.product.deleteMany({ 
			where: { 
				OR: [
					{ barcode: product.barcode },
					{ id: { gte: 99990 } }
				]
			} 
		});
		
		// Create test product
		createdProduct = await prisma.product.create({ data: product as any });
		console.log('Created test product:', createdProduct);
		
		// Create promotions with correct product ID
		const promo1Data = {
			...promotion1,
			promotionDetails: {
				create: [{ productId: createdProduct.id }]
			}
		};
		const promo2Data = {
			...promotion2,
			promotionDetails: {
				create: [{ productId: createdProduct.id }]
			}
		};
		
		await prisma.promotion.create({ data: promo1Data as any });
		await prisma.promotion.create({ data: promo2Data as any });
	});

	afterAll(async () => {
		await prisma.promotionDetail.deleteMany({
			where: { productId: createdProduct.id }
		});
		await prisma.promotion.deleteMany({
			where: { id: { in: [promotion1.id, promotion2.id] } },
		});
		await prisma.product.deleteMany({ 
			where: { id: createdProduct.id }
		}).catch(() => {});
	});

	describe("Normal case", () => {
		beforeAll(async () => {
			input = { productId: createdProduct.id };
			output = await searchProductsUsecase.execute(input);
		});

		it("Should return correct product & promotion data", () => {
			expect(output).toHaveProperty('product');
			expect(output.product.id).toBe(createdProduct.id);
			expect(output.product.name).toBe(product.name);
			expect(output.product.price).toBe(product.price);
			expect(output.product.unit).toBeDefined();
			
			expect(output).toHaveProperty('promotion');
			expect(output.promotion.id).toBe(promotion2.id);
			expect(output.promotion.name).toBe(promotion2.name);
			expect(output.promotion.value).toBe(promotion2.value);
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
