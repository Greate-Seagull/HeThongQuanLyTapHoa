import z from "zod";
import { createPromotionUsecase, prisma } from "../../src/composition-root";
import { product1, product2, send } from "./create-promotion.test-data";

const outputSchema = z.object({
	promotionId: z.number(),
});

describe("Create promotion integration test", () => {
	let input;
	let output;

	beforeAll(async () => {
		await prisma.product.createMany({
			data: [product1, product2],
		});
	});

	afterAll(async () => {
		await prisma.promotion.deleteMany({
			where: { name: send.name },
		});
		await prisma.product.deleteMany({
			where: { id: { in: [product1.id, product2.id] } },
		});
	});

	describe("Normal case", () => {
		beforeAll(async () => {
			input = send;
			output = await createPromotionUsecase.execute(input);
			console.log(output);
		});

		it("Should return promotion id", () => {
			expect(() => outputSchema.parse(output)).not.toThrow();
		});
	});

	describe("Abnormal case", () => {
		describe("Late start date case", () => {
			beforeAll(async () => {
				let endedAt = new Date();
				endedAt.setDate(endedAt.getDate() - 14);
				input = structuredClone(send);
				input.endedAt = endedAt.toISOString();

				try {
					output = await createPromotionUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output.message).toBe(
					`Expect start date to be before end date; got start date: ${new Date(
						input.startedAt
					)}, end date: ${new Date(input.endedAt)}`
				);
			});
		});

		describe("Invalid value case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.value = -1;

				try {
					output = await createPromotionUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output.message).toBe(`Invalid value, ${input.value}`);
			});
		});

		describe("Invalid pronotion type case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.promotionType = "UNKNOWN";

				try {
					output = await createPromotionUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output).toHaveProperty("message");
			});
		});

		describe("Invalid pronotion type case", () => {
			beforeAll(async () => {
				input = structuredClone(send);
				input.promotionDetails = [];

				try {
					output = await createPromotionUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output.message).toBe(
					`Expect promotion to have at least one product Id`
				);
			});
		});
	});
});
