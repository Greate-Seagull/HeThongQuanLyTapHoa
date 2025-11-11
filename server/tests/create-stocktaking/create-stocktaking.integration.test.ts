import { createStocktakingUsecase, prisma } from "../../src/composition-root";
import {
	employee,
	product1,
	product2,
	send,
	shelf,
} from "./create-stocktaking.test-data";

jest.setTimeout(50000);

describe("Create stocktaking integration test", () => {
	let input;
	let output;

	beforeAll(async () => {
		await Promise.all([
			prisma.shelf.create({ data: shelf }),
			prisma.product.createMany({ data: [product1, product2] }),
			prisma.employee.create({ data: employee as any }),
		]);
	});

	afterAll(async () => {
		await prisma.stocktaking.deleteMany({
			where: { employeeId: employee.id },
		});
		await Promise.all([
			prisma.shelf.delete({ where: { id: shelf.id } }),
			prisma.product.deleteMany({
				where: {
					id: {
						in: [product1.id, product2.id],
					},
				},
			}),
			prisma.employee.delete({ where: { id: employee.id } }),
		]);
	});

	describe("Normal case", () => {
		beforeAll(async () => {
			input = send;
			output = await createStocktakingUsecase.execute(input);
		});

		it("Should return success message", () => {
			expect(output.message).toBe(`Success`);
		});
	});

	describe("Abnormal case", () => {
		describe("Invalid barcode case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.products[0].barcode = -1;
				try {
					output = await createStocktakingUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output.message).toBe(`Expect all products to be valid`);
			});
		});

		describe("Invalid employee id case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.employeeId = -1;
				try {
					output = await createStocktakingUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output.message).toBe(
					`Employee not found, ${input.employeeId}`
				);
			});
		});

		describe("Invalid status case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.products[0].status = "UNKNOWN";
				try {
					output = await createStocktakingUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output).toHaveProperty("message");
			});
		});

		describe("Empty line items case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.products = [];
				try {
					output = await createStocktakingUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output.message).toBe(
					`Expect stocktaking to have at least one item, got ${input.products}`
				);
			});
		});

		describe("Invalid quantity case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.products[0].quantity = -1;
				try {
					output = await createStocktakingUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output.message).toBe(
					`Expect the quantity to be positive`
				);
			});
		});

		describe("Invalid slot id case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.products[0].slotId = -1;
				try {
					output = await createStocktakingUsecase.execute(input);
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
