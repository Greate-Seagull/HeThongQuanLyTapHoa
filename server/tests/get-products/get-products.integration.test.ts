import { getProductsUsecase, prisma } from "../../src/composition-root";
import { product1, product2 } from "./get-products.test-data";

jest.setTimeout(20000);

describe("Get products integration test", () => {
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
			output = await getProductsUsecase.execute(input);
		});

		it("Should return correct product 1", () => {
			const foundProduct = output.products.find(p => p.id === product1.id);
			expect(foundProduct).toMatchSnapshot(product1);
		});

		it("Should return correct product 2", () => {
			const foundProduct = output.products.find(p => p.id === product2.id);
			expect(foundProduct).toMatchSnapshot(product2);
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
	// 		expect(output.message).toBe(`Product not found. ${fakeId}`);
	// 	});
	// });
});
