import { getProductsUsecase, prisma } from "../../../src/composition-root";
import { product1, product2 } from "./get-products.test-data";

jest.setTimeout(20000);

describe("Get products integration test", () => {
	let input;
	let output;

	beforeAll(async () => {
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
			input = {};
			output = await getProductsUsecase.execute(input);
		});

		it("Should return an array of products", () => {
			expect(Array.isArray(output)).toBe(true);
			expect(output.length).toBeGreaterThan(0);
		});

		it("Should return correct product 1", () => {
			const foundProduct = output.find((p: any) => p.id === product1.id);
			expect(foundProduct).toBeDefined();
			expect(foundProduct).toMatchObject({
				id: product1.id,
				barcode: product1.barcode,
				name: product1.name,
				price: product1.price,
			});
		});

		it("Should return correct product 2", () => {
			const foundProduct = output.find((p: any) => p.id === product2.id);
			expect(foundProduct).toBeDefined();
			expect(foundProduct).toMatchObject({
				id: product2.id,
				barcode: product2.barcode,
				name: product2.name,
				price: product2.price,
			});
		});
	});
});
