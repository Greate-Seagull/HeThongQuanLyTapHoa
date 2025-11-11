import { createPromotionUsecase, prisma } from "../../src/composition-root";
import {
	product1,
	product2,
	promotionInput,
} from "./create-promotion.test-data";

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
			where: { name: promotionInput.name },
		});
		await prisma.product.deleteMany({
			where: { id: { in: [product1.id, product2.id] } },
		});
	});

	describe("Normal case", () => {
		beforeAll(async () => {
			input = promotionInput;
			output = await createPromotionUsecase.execute(input);
		});

		it("Should return promotion id", () => {
			expect(output).toHaveProperty("promotionId");
		});
	});

	describe("Abnormal case", () => {
		describe("Late start date case", () => {
			beforeAll(async () => {
				let endedAt = new Date();
				endedAt.setDate(endedAt.getDate() - 14);
				input = structuredClone(promotionInput);
				input.endedAt = endedAt.toISOString();

				try {
					output = await createPromotionUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output.message).toBe(
					`Expect start date to be before end date; got start date: ${input.startedAt}, end date: ${input.endedAt}`
				);
			});
		});

		describe("Invalid value case", () => {
			beforeAll(async () => {
				input = structuredClone(promotionInput);
				input.value = -1;

				try {
					output = await createPromotionUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output.message).toBe(
					`Expect promotion value to be greater than zero, got ${input.value}`
				);
			});
		});

		describe("Invalid pronotion type case", () => {
			beforeAll(async () => {
				input = structuredClone(promotionInput);
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
				input = structuredClone(promotionInput);
				input.productIds = [];

				try {
					output = await createPromotionUsecase.execute(input);
				} catch (e) {
					output = e;
				}
			});

			it("Should return error message", () => {
				expect(output.message).toBe(
					`Expect promotion to have at least one product Id, got ${input.productIds}`
				);
			});
		});
	});
});
