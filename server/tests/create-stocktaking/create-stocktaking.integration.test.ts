import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/composition-root";
import {
	employee,
	product1,
	product2,
	send,
	shelf,
} from "./create-stocktaking.test-data";

jest.setTimeout(50000);

describe("Create stocktaking integration test", () => {
	let path = `/stocktakings`;
	let input;
	let output;

	beforeAll(async () => {
		await Promise.all([
			prisma.shelf.create({ data: shelf }),
			prisma.product.createMany({ data: [product1, product2] }),
			prisma.employee.create({ data: employee }),
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
			output = await request(app).post(path).send(input);
		});

		it("Should return 200", () => {
			expect(output.status).toBe(200);
		});

		it("Should return success message", () => {
			expect(output.body.message).toBe(`Success`);
		});
	});

	describe("Abnormal case", () => {
		describe("Invalid barcode case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.products[0].barcode = -1;
				output = await request(app).post(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body.message).toBe(
					`Expect all products to be valid`
				);
			});
		});

		describe("Invalid employee id case", () => {
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

		describe("Invalid status case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.products[0].status = "UNKNOWN";
				output = await request(app).post(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body).toHaveProperty("message");
			});
		});

		describe("Empty line items case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.products = [];
				output = await request(app).post(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body.message).toBe(
					`Expect stocktaking to have at least one item, got ${input.products}`
				);
			});
		});

		describe("Invalid quantity case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.products[0].quantity = -1;
				output = await request(app).post(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body.message).toBe(
					`Expect the quantity to be positive`
				);
			});
		});

		describe("Invalid slot id case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.products[0].slotId = -1;
				output = await request(app).post(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body).toHaveProperty("message");
			});
		});
	});
});
