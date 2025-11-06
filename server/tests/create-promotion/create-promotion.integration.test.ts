import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/composition-root";
import {
	product1,
	product2,
	promotionInput,
} from "./create-promotion.test-data";

describe("Create promotion integration test", () => {
	let path = `/promotions`;
	let input;
	let output;

	beforeAll(async () => {
		await prisma.product.createMany({
			data: [product1, product2],
		});
	});

	afterAll(async () => {
		await prisma.product.deleteMany({
			where: { id: { in: [product1.id, product2.id] } },
		});
	});

	describe("Normal case", () => {
		beforeAll(async () => {
			input = promotionInput;
			output = await request(app).post(path).send(input);
		});

		it("Should return 200", () => {
			expect(output.status).toBe(200);
		});

		it("Should return promotion id", () => {
			expect(output.body).toHaveProperty("promotionId");
		});
	});

	describe("Abnormal case", () => {
		describe("Late start date case", () => {
			beforeAll(async () => {
				let endedAt = new Date();
				endedAt.setDate(endedAt.getDate() - 14);
				input = structuredClone(promotionInput);
				input.endedAt = endedAt.toISOString();

				output = await request(app).post(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body.message).toBe(
					`Expect start date to be before end date; got start date: ${new Date(
						input.startedAt
					)}, end date: ${new Date(input.endedAt)}`
				);
			});
		});

		describe("Invalid value case", () => {
			beforeAll(async () => {
				input = structuredClone(promotionInput);
				input.value = -1;

				output = await request(app).post(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body.message).toBe(
					`Expect promotion value to be greater than zero, got ${input.value}`
				);
			});
		});

		describe("Invalid pronotion type case", () => {
			beforeAll(async () => {
				input = structuredClone(promotionInput);
				input.promotionType = "UNKNOWN";

				output = await request(app).post(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body).toHaveProperty("message");
			});
		});

		describe("Invalid pronotion type case", () => {
			beforeAll(async () => {
				input = structuredClone(promotionInput);
				input.productIds = [];

				output = await request(app).post(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body.message).toBe(
					`Expect promotion to have at least one product Id, got ${input.productIds}`
				);
			});
		});
	});
});
