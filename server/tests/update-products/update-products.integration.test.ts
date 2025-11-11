import { prisma, updateProductsUsecase } from "../../src/composition-root";
import {
	product1Input,
	product2,
	product2Input,
	send,
} from "./update-products.test-data";

jest.setTimeout(50000);

describe("Update products integration test", () => {
	let input;
	let output;

	beforeAll(async () => {
		await prisma.product.create({ data: product2 });
	});

	afterAll(async () => {
		await prisma.product.deleteMany({
			where: {
				name: {
					in: [product1Input.name, product2Input.name],
				},
			},
		});
	});

	describe("Normal case", () => {
		describe("One insert and one update case", () => {
			beforeAll(async () => {
				input = send;
				output = await updateProductsUsecase.execute(input);
			});

			afterAll(async () => {
				await prisma.product.deleteMany({
					where: {
						name: {
							in: [product1Input.name],
						},
					},
				});
			});

			it("Should return success message", () => {
				expect(output.message).toBe(`Success`);
			});
		});

		describe("No insert case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.products = [product2Input];
				output = await updateProductsUsecase.execute(input);
			});

			it("Should return success message", () => {
				expect(output.message).toBe(`Success`);
			});
		});
	});

	describe("Abnormal case", () => {
		describe("Invalid price case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.products[0].price = -1;
				try {
					output = await updateProductsUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output.message).toBe(`Expect the price to be positive`);
			});
		});

		describe("Invalid unit case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.products[0].unit = "ABCD";
				try {
					output = await updateProductsUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output).toHaveProperty("message");
			});
		});

		describe("Invalid barcode case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.products[0].barcode = -1;
				try {
					output = await updateProductsUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output.message).toBe(
					`Expect the barcode to be positive`
				);
			});
		});

		describe("Duplicate barcode case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.products[1].barcode = product1Input.barcode;
				try {
					output = await updateProductsUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output).toHaveProperty("message");
			});
		});
	});
});
