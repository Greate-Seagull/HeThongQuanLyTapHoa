import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/composition-root";
import { employee, product1, send } from "./create-goods-receipt.test-data";

jest.setTimeout(50000);

describe("Create good receipt integration test", () => {
	let path = `/good-receipts`;
	let input;
	let output;

	beforeAll(async () => {
		await Promise.all([
			prisma.employee.create({ data: employee }),
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
			output = await request(app).post(path).send(input);
		});

		it("Should return 200", () => {
			expect(output.status).toBe(200);
		});

		it("Should return good receipt id", () => {
			expect(output.body).toHaveProperty("goodReceiptId");
		});

		it("Should return correct employee name", () => {
			expect(output.body).toHaveProperty("employeeName", employee.name);
		});

		it("Should return correct products size", () => {
			expect(output.body.products).toHaveLength(send.items.length);
		});
	});

	describe("Abnormal case", () => {
		describe("Not found employee case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.employeeId = -1;
				output = await request(app).post(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body.message).toBe(
					`Employee not found, ${input.employeeId}`
				);
			});
		});

		describe("Invalid product case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.items[0].productId = -1;
				output = await request(app).post(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body.message).toBe(
					`Expect all products to be valid`
				);
			});
		});

		describe("Invalid import quantity case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.items[0].quantity = -1;
				output = await request(app).post(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body.message).toBe(
					`The received quantity is under 0`
				);
			});
		});

		describe("Invalid import quantity case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.items[0].price = -1;
				output = await request(app).post(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body.message).toBe(
					`Expect the import cost to be positive`
				);
			});
		});
	});
});
