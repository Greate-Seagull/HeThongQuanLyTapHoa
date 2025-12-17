import z from "zod";
import {
	createGoodReceiptUsecase,
	prisma,
} from "../../../src/composition-root";
import { employee, product1, send } from "./create-goods-receipt.test-data";

jest.setTimeout(50000);

const outputSchema = z.object({
	goodReceiptId: z.number(),
	employeeName: z.literal(employee.name),
	createdAt: z.date(),
	products: z.tuple([
		z.object({
			productId: z.literal(product1.id),
			name: z.literal(product1.name),
			amount: z.literal(send.items[0].quantity),
		}),
	]),
});

describe("Create good receipt integration test", () => {
	let input;
	let output;
	beforeAll(async () => {
		await prisma.goodReceipt.deleteMany({
			where: { employeeId: employee.id },
		});
		await Promise.all([
			prisma.employee.deleteMany({ where: { id: employee.id } }),
			prisma.product.deleteMany({ where: { id: product1.id } }),
		]);

		// Sanitize data
		const cleanEmployee = JSON.parse(JSON.stringify(employee));
		const cleanProduct1 = JSON.parse(JSON.stringify(product1));

		await Promise.all([
			prisma.employee.create({ data: cleanEmployee }),
			prisma.product.create({ data: cleanProduct1 }),
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

		it("Should return correct result", () => {
			expect(() => outputSchema.parse(output)).not.toThrow();
		});
	});

	describe("Abnormal case", () => {
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
				expect(output.message).toBe("Expect all products to be valid");
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
				expect(output.message).toBe(
					`Invalid received quantity, ${input.items[0].quantity}`
				);
			});
		});

		describe("Invalid price case", () => {
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
					`Invalid price, ${input.items[0].price}`
				);
			});
		});
	});
});
