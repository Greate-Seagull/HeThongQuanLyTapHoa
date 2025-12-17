import { getProductsUsecase, prisma } from "../../../src/composition-root";
import { product1, product2 } from "./get-products.test-data";

jest.setTimeout(20000);

describe("Get products integration test", () => {
	let input;
	let output;

	beforeAll(async () => {
		// Clean up data before creating to avoid Unique Constraint errors
		      await prisma.product.deleteMany({
			      where: { barcode: { in: [product1.barcode, product2.barcode] } },
		      });
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
			output = await getProductsUsecase.execute(input);
		});

		it("Should return correct product 1", () => {
			const foundProduct = output.products.find(
				(p) => p.id === product1.id
			);
			expect(foundProduct).toMatchObject({
				id: product1.id,
				name: product1.name,
				price: product1.price,
				unit: "PIECE",
				barcode: product1.barcode,
			});
		});

		it("Should return correct product 2", () => {
			const foundProduct = output.products.find(
				(p) => p.id === product2.id
			);
			expect(foundProduct).toMatchObject({
				id: product2.id,
				name: product2.name,
				price: product2.price,
				unit: "PIECE",
				barcode: product2.barcode,
			});
		});
	});
});
