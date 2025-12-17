import z from "zod";
import { prisma, updateProductsUsecase } from "../../../src/composition-root";
import {
	product1Input,
	product2,
	product2Input,
	send,
} from "./update-products.test-data";

jest.setTimeout(50000);

const outputSchema = z.object();

describe("Update products integration test", () => {
	let input;
	let output;

	beforeAll(async () => {
		await prisma.product.deleteMany({
			where: {
				name: {
					in: [product1Input.name, product2Input.name, product2.name],
				},
			},
		});
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

			// Đã xóa afterAll ở đây để giữ lại product1 cho test case Duplicate barcode phía dưới

			it("Should not throw any error", () => {
				expect(() => outputSchema.parse(output)).not.toThrow();
			});
		});

		describe("No insert case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.products = [product2Input];
				output = await updateProductsUsecase.execute(input);
			});

			it("Should not throw any error", () => {
				expect(() => outputSchema.parse(output)).not.toThrow();
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
				expect(output.message).toBe(
					`Invalid price, ${input.products[0].price}`
				);
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
				expect(output.message).toBe(
					`Invalid unit, ${input.products[0].unit}`
				);
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
					`Invalid barcode, ${input.products[0].barcode}`
				);
			});
		});

		describe("Duplicate barcode case", () => {
			beforeAll(async () => {
				// Ensure clean state and existence of products for conflict
				await prisma.product.deleteMany({
					where: {
						name: { in: [product1Input.name, product2.name] },
					},
				});
				// Create product1 (to conflict with)
				await prisma.product.create({ data: product1Input as any });
				// Create product2 (to be updated)
				await prisma.product.create({ data: product2 as any });

				input = structuredClone(send);
				input.products[1].barcode = product1Input.barcode;
				try {
					output = await updateProductsUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				// Expect Prisma Unique constraint error
				expect(output.message).toMatch(/Unique constraint/);
			});
		});
	});
});
