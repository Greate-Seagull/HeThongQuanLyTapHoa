import { product, promotion1, promotion2 } from "./search-products.test-data";
import { prisma, searchProductsUsecase } from "../../../src/composition-root";
import z from "zod";

jest.setTimeout(20000);

describe("Search products integration test", () => {
	let input;
	let output;
	let createdProduct: any;

	beforeAll(async () => {
		// Dọn sạch dữ liệu cũ theo ID cụ thể để tránh conflict
		await prisma.promotionDetail.deleteMany({
			where: { promotionId: { in: [promotion1.id, promotion2.id] } }
		});
		await prisma.promotion.deleteMany({
			where: { id: { in: [promotion1.id, promotion2.id] } },
		});
		await prisma.product.deleteMany({ 
			where: { barcode: product.barcode } 
		});
		
		createdProduct = await prisma.product.create({ data: product as any });
		
		const promo1Data = {
			...promotion1,
			promotionDetails: { create: [{ productId: createdProduct.id }] }
		};
		const promo2Data = {
			...promotion2,
			promotionDetails: { create: [{ productId: createdProduct.id }] }
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
			expect(output.product).toBeDefined();
			expect(output.product.id).toBe(createdProduct.id);
			
			// Kiểm tra promotion không null trước khi truy cập id
			expect(output.promotion).not.toBeNull(); 
			if (output.promotion) {
				expect(output.promotion.id).toBe(promotion2.id);
				expect(output.promotion.value).toBe(promotion2.value);
			}
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
