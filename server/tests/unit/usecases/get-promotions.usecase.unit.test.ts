import { GetPromotionsUsecase } from "../../../src/application/services/promotion/get-promotions.usecase";
import { PromotionReadAccessor } from "../../../src/infrastructure/read-accessors/prisma/promotion.read-accessor";

describe("GetPromotionsUsecase Unit Tests", () => {
	let usecase: GetPromotionsUsecase;
	let mockPromotionRead: jest.Mocked<PromotionReadAccessor>;

	beforeEach(() => {
		mockPromotionRead = {
			getAll: jest.fn(),
		} as any;

		usecase = new GetPromotionsUsecase(mockPromotionRead);
	});

	describe("Success Cases", () => {
		it("should get all promotions successfully", async () => {
			// Arrange
			const promotions = [
				{
					id: 1,
					name: "Summer Sale",
					value: 20,
					promotionType: "PERCENTAGE",
				},
				{
					id: 2,
					name: "Winter Discount",
					value: 50000,
					promotionType: "FIXED",
				},
				{
					id: 3,
					name: "Flash Sale",
					value: 30,
					promotionType: "PERCENTAGE",
				},
			];
			mockPromotionRead.getAll.mockResolvedValue(promotions as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result).toBeDefined();
			expect(result.length).toBe(3);
			expect(result[0].name).toBe("Summer Sale");
		});

		it("should return empty array when no promotions exist", async () => {
			// Arrange
			mockPromotionRead.getAll.mockResolvedValue([]);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result.length).toBe(0);
		});

		it("should return single promotion", async () => {
			// Arrange
			const promotions = [
				{
					id: 1,
					name: "Only Promotion",
					value: 15,
					promotionType: "PERCENTAGE",
				},
			];
			mockPromotionRead.getAll.mockResolvedValue(promotions as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result.length).toBe(1);
			expect(result[0].id).toBe(1);
		});

		it("should preserve promotion details", async () => {
			// Arrange
			const promotions = [
				{
					id: 5,
					name: "Special Offer",
					value: 25,
					promotionType: "PERCENTAGE",
					description: "Good deal",
				},
			];
			mockPromotionRead.getAll.mockResolvedValue(promotions as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result[0].name).toBe("Special Offer");
			expect(result[0].value).toBe(25);
		});

		it("should return percentage promotions", async () => {
			// Arrange
			const promotions = [
				{
					id: 1,
					name: "20% Off",
					value: 20,
					promotionType: "PERCENTAGE",
				},
			];
			mockPromotionRead.getAll.mockResolvedValue(promotions as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result[0].value).toBe(20);
			expect(result[0].promotionType).toBe("PERCENTAGE");
		});

		it("should return fixed amount promotions", async () => {
			// Arrange
			const promotions = [
				{
					id: 2,
					name: "100k Off",
					value: 100000,
					promotionType: "FIXED",
				},
			];
			mockPromotionRead.getAll.mockResolvedValue(promotions as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result[0].value).toBe(100000);
			expect(result[0].promotionType).toBe("FIXED");
		});

		it("should return many promotions", async () => {
			// Arrange
			const promotions = Array.from({ length: 100 }, (_, i) => ({
				id: i + 1,
				name: `Promotion ${i + 1}`,
				value: (i + 1) * 10,
				promotionType: i % 2 === 0 ? "PERCENTAGE" : "FIXED",
			}));
			mockPromotionRead.getAll.mockResolvedValue(promotions as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result.length).toBe(100);
		});
	});

	describe("Business Logic Cases", () => {
		it("should call repository getAll method", async () => {
			// Arrange
			mockPromotionRead.getAll.mockResolvedValue([]);

			// Act
			await usecase.execute();

			// Assert
			expect(mockPromotionRead.getAll).toHaveBeenCalled();
			expect(mockPromotionRead.getAll).toHaveBeenCalledTimes(1);
		});

		it("should return data exactly as repository provides", async () => {
			// Arrange
			const promotions = [
				{
					id: 10,
					name: "Test",
					value: 10,
					promotionType: "PERCENTAGE",
				},
				{
					id: 20,
					name: "Demo",
					value: 50000,
					promotionType: "FIXED",
				},
			];
			mockPromotionRead.getAll.mockResolvedValue(promotions as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result).toEqual(promotions);
		});
	});

	describe("Edge Cases", () => {
		it("should handle promotions with special characters in name", async () => {
			// Arrange
			const promotions = [
				{
					id: 1,
					name: "Promotion @#$% & 特殊",
					value: 15,
					promotionType: "PERCENTAGE",
				},
			];
			mockPromotionRead.getAll.mockResolvedValue(promotions as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result[0].name).toBe("Promotion @#$% & 特殊");
		});

		it("should handle very long promotion name", async () => {
			// Arrange
			const longName = "A".repeat(500);
			const promotions = [
				{
					id: 1,
					name: longName,
					value: 10,
					promotionType: "PERCENTAGE",
				},
			];
			mockPromotionRead.getAll.mockResolvedValue(promotions as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result[0].name.length).toBe(500);
		});

		it("should handle large promotion IDs", async () => {
			// Arrange
			const promotions = [
				{
					id: 999999,
					name: "Large ID",
					value: 10,
					promotionType: "PERCENTAGE",
				},
				{
					id: 888888,
					name: "Another Large",
					value: 20,
					promotionType: "PERCENTAGE",
				},
			];
			mockPromotionRead.getAll.mockResolvedValue(promotions as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result[0].id).toBe(999999);
		});

		it("should handle large discount values", async () => {
			// Arrange
			const promotions = [
				{
					id: 1,
					name: "Big Discount",
					value: 999999999,
					promotionType: "FIXED",
				},
			];
			mockPromotionRead.getAll.mockResolvedValue(promotions as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result[0].value).toBe(999999999);
		});

		it("should handle minimum discount values", async () => {
			// Arrange
			const promotions = [
				{
					id: 1,
					name: "Tiny Discount",
					value: 1,
					promotionType: "PERCENTAGE",
				},
			];
			mockPromotionRead.getAll.mockResolvedValue(promotions as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result[0].value).toBe(1);
		});

		it("should handle zero discount values", async () => {
			// Arrange
			const promotions = [
				{
					id: 1,
					name: "No Discount",
					value: 0,
					promotionType: "PERCENTAGE",
				},
			];
			mockPromotionRead.getAll.mockResolvedValue(promotions as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result[0].value).toBe(0);
		});

		it("should handle promotions with null optional fields", async () => {
			// Arrange
			const promotions = [
				{
					id: 1,
					name: "Promotion",
					value: 10,
					promotionType: "PERCENTAGE",
					description: null,
				},
			];
			mockPromotionRead.getAll.mockResolvedValue(promotions as any);

			// Act
			const result = await usecase.execute();

			// Assert
			expect(result[0]).toBeDefined();
		});
	});
});
