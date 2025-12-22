import { getProductsUsecase, prisma } from "../../../src/composition-root";
import { product1, product2 } from "./get-products.test-data";

jest.setTimeout(20000);

describe("Get products integration test", () => {
	let output: any;

	beforeAll(async () => {
		// Xóa trước để tránh trùng barcode
		await prisma.product.deleteMany({
			where: { 
				OR: [
					{ id: { in: [product1.id, product2.id] } },
					{ barcode: { in: [product1.barcode, product2.barcode] } }
				]
			},
		});
		await prisma.product.createMany({ data: [product1, product2] });
	});

	afterAll(async () => {
		await prisma.product.deleteMany({
			where: { barcode: { in: [product1.barcode, product2.barcode] } },
		});
	});

	describe("Normal case", () => {
		beforeAll(async () => {
			// ✅ execute() returns { data: Product[] }
			output = await getProductsUsecase.execute();
		});

		it("Should return products in correct format", () => {
			// ✅ Output format is { data: Product[] }
			expect(output).toHaveProperty('data');
			expect(Array.isArray(output.data)).toBe(true);
		});

		it("Should return correct product 1", () => {
			const foundProduct = output.data.find(
				(p: any) => p.id === product1.id
			);
			expect(foundProduct).toMatchObject({
				id: product1.id,
				name: product1.name,
				barcode: product1.barcode,
				price: product1.price,
				amount: product1.amount,  // ✅ Now exists in test data
			});
		});

		it("Should return correct product 2", () => {
			const foundProduct = output.data.find(
				(p: any) => p.id === product2.id
			);
			expect(foundProduct).toMatchObject({
				id: product2.id,
				name: product2.name,
				barcode: product2.barcode,
				price: product2.price,
				amount: product2.amount,  // ✅ Now exists in test data
			});
		});

		it("Should include slotDetails in response", () => {
			// ✅ Verify slotDetails are included (even if empty)
			const foundProduct = output.data.find(
				(p: any) => p.id === product1.id
			);
			expect(foundProduct).toHaveProperty('slotDetails');
			expect(Array.isArray(foundProduct.slotDetails)).toBe(true);
		});
	});
});
