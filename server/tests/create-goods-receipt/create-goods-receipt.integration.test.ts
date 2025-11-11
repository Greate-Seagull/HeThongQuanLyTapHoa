import { createGoodReceiptUsecase, prisma } from "../../src/composition-root";
import { employee, product1, send } from "./create-goods-receipt.test-data";

jest.setTimeout(50000);

describe("Create good receipt integration test", () => {
	let input;
	let output;
	beforeAll(async () => {
		await Promise.all([
			prisma.employee.create({ data: employee as any }),
			prisma.product.create({ data: product1 }),
		]);
	});

	afterAll(async () => {
		await prisma.goodReceipt.deleteMany({
			where: { employeeId: employee.id },
		});
		await Promise.all([
			prisma.employee.delete({ where: { id: employee.id } }),
			prisma.product.delete({ where: { id: product1.id } }),
		]);
	});

	describe("Normal case", () => {
		beforeAll(async () => {
			input = send;
			output = await createGoodReceiptUsecase.execute(input);
		});

		it("Should return good receipt id", () => {
			expect(output).toHaveProperty("goodReceiptId");
		});

		it("Should return correct employee name", () => {
			expect(output).toHaveProperty("employeeName", employee.name);
		});

		it("Should return correct products size", () => {
			expect(output.products).toHaveLength(send.items.length);
		});
	});

	describe("Abnormal case", () => {
		describe("Not found employee case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.employeeId = -1;
				try {
					output = await createGoodReceiptUsecase.execute(input);
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

		describe("Invalid product case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.items[0].productId = -1;
				try {
					output = await createGoodReceiptUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output.message).toBe(`Expect all products to be valid`);
			});
		});

		describe("Invalid import quantity case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.items[0].quantity = -1;
				try {
					output = await createGoodReceiptUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output.message).toBe(`The received quantity is under 0`);
			});
		});

		describe("Invalid import quantity case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.items[0].price = -1;
				try {
					output = await createGoodReceiptUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output.message).toBe(
					`Expect the import cost to be positive`
				);
			});
		});
	});
});
