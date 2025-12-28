import { SalesTransactionService } from "../../../src/domain/services/sales-transaction.service";
import { PromotionType } from "../../../src/domain/entities/promotion";
import { buildUser, buildProduct, buildPromotion } from "../../helpers/test-helpers";

describe("SalesTransactionService Unit Tests", () => {
	let service: SalesTransactionService;

	beforeEach(() => {
		service = new SalesTransactionService();
	});

	describe("Basic Sale Processing", () => {
		it("should process sale with single product (no promotion, no customer)", () => {
			// Arrange
			const product = buildProduct({ id: 1, price: 10000, amount: 10 });
			const input = {
				user: null,
				usedPoint: 0,
				products: [product],
				promotions: [],
				items: [{ productId: 1, quantity: 2, promotionId: null }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.total).toBe(20000);
			expect(result.items).toHaveLength(1);
			expect(result.items[0].productId).toBe(1);
			expect(result.items[0].quantity).toBe(2);
			expect(result.items[0].originalPrice).toBe(10000);
			expect(result.items[0].discountedPrice).toBe(10000);
			expect(result.items[0].subTotal).toBe(20000);
		});

		it("should process sale with multiple products", () => {
			// Arrange
			const product1 = buildProduct({ id: 1, price: 10000, amount: 10 });
			const product2 = buildProduct({ id: 2, price: 20000, amount: 10 });
			const input = {
				user: null,
				usedPoint: 0,
				products: [product1, product2],
				promotions: [],
				items: [
					{ productId: 1, quantity: 2, promotionId: null },
					{ productId: 2, quantity: 1, promotionId: null },
				],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.total).toBe(40000); // 10000*2 + 20000*1
			expect(result.items).toHaveLength(2);
		});

		it("should reduce product stock correctly", () => {
			// Arrange
			const product = buildProduct({ id: 1, price: 10000, amount: 10 });
			const input = {
				user: null,
				usedPoint: 0,
				products: [product],
				promotions: [],
				items: [{ productId: 1, quantity: 3, promotionId: null }],
			};

			// Act
			service.processSale(input);

			// Assert
			expect(product.amount).toBe(7); // 10 - 3
		});
	});

	describe("Promotion Application", () => {
		it("should apply FIXED promotion correctly", () => {
			// Arrange
			const product = buildProduct({ id: 1, price: 50000, amount: 10 });
			const promotion = buildPromotion({
				id: 1,
				promotionType: PromotionType.FIXED,
				value: 10000,
			});
			const input = {
				user: null,
				usedPoint: 0,
				products: [product],
				promotions: [promotion],
				items: [{ productId: 1, quantity: 1, promotionId: 1 }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.items[0].originalPrice).toBe(50000);
			expect(result.items[0].discountedPrice).toBe(40000); // 50000 - 10000
			expect(result.items[0].subTotal).toBe(40000);
			expect(result.total).toBe(40000);
		});

		it("should apply PERCENTAGE promotion correctly", () => {
			// Arrange
			const product = buildProduct({ id: 1, price: 100000, amount: 10 });
			const promotion = buildPromotion({
				id: 1,
				promotionType: PromotionType.PERCENTAGE,
				value: 20, // 20%
			});
			const input = {
				user: null,
				usedPoint: 0,
				products: [product],
				promotions: [promotion],
				items: [{ productId: 1, quantity: 1, promotionId: 1 }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.items[0].discountedPrice).toBe(80000); // 100000 - 20%
			expect(result.total).toBe(80000);
		});

		it("should apply promotion to multiple quantities", () => {
			// Arrange
			const product = buildProduct({ id: 1, price: 20000, amount: 10 });
			const promotion = buildPromotion({
				id: 1,
				promotionType: PromotionType.FIXED,
				value: 5000,
			});
			const input = {
				user: null,
				usedPoint: 0,
				products: [product],
				promotions: [promotion],
				items: [{ productId: 1, quantity: 3, promotionId: 1 }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.items[0].discountedPrice).toBe(15000); // 20000 - 5000
			expect(result.items[0].subTotal).toBe(45000); // 15000 * 3
			expect(result.total).toBe(45000);
		});

		it("should handle mixed products with and without promotions", () => {
			// Arrange
			const product1 = buildProduct({ id: 1, price: 50000, amount: 10 });
			const product2 = buildProduct({ id: 2, price: 30000, amount: 10 });
			const promotion = buildPromotion({
				id: 1,
				promotionType: PromotionType.FIXED,
				value: 10000,
			});
			const input = {
				user: null,
				usedPoint: 0,
				products: [product1, product2],
				promotions: [promotion],
				items: [
					{ productId: 1, quantity: 1, promotionId: 1 }, // With promotion
					{ productId: 2, quantity: 1, promotionId: null }, // No promotion
				],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.items[0].discountedPrice).toBe(40000); // 50000 - 10000
			expect(result.items[1].discountedPrice).toBe(30000); // No discount
			expect(result.total).toBe(70000); // 40000 + 30000
		});
	});

	describe("Customer Points Management", () => {
		it("should not earn points when user makes purchase without using points", () => {
			// Arrange
			const user = buildUser({ id: 1, point: 100 });
			const product = buildProduct({ id: 1, price: 10000, amount: 10 });
			const input = {
				user,
				usedPoint: 0,
				products: [product],
				promotions: [],
				items: [{ productId: 1, quantity: 5, promotionId: null }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.total).toBe(50000);
			expect(user.point).toBe(100); // Points unchanged when usedPoint is 0
		});

		it("should use customer points and calculate correctly", () => {
			// Arrange
			const user = buildUser({ id: 1, point: 100 });
			const product = buildProduct({ id: 1, price: 10000, amount: 10 });
			const input = {
				user,
				usedPoint: 50,
				products: [product],
				promotions: [],
				items: [{ productId: 1, quantity: 5, promotionId: null }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.total).toBe(49950); // 50000 - 50
			expect(user.point).toBe(549); // (100 - 50) + (49950/100) = 50 + 499
		});

		it("should use all customer points", () => {
			// Arrange
			const user = buildUser({ id: 1, point: 500 });
			const product = buildProduct({ id: 1, price: 10000, amount: 10 });
			const input = {
				user,
				usedPoint: 500,
				products: [product],
				promotions: [],
				items: [{ productId: 1, quantity: 10, promotionId: null }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.total).toBe(99500); // 100000 - 500
			expect(user.point).toBe(995); // 0 + (99500/100)
		});

		it("should not use points when user is null", () => {
			// Arrange
			const product = buildProduct({ id: 1, price: 10000, amount: 10 });
			const input = {
				user: null,
				usedPoint: 50,
				products: [product],
				promotions: [],
				items: [{ productId: 1, quantity: 2, promotionId: null }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.total).toBe(20000); // Points not applied
		});

		it("should not earn points when usedPoint is 0", () => {
			// Arrange
			const user = buildUser({ id: 1, point: 100 });
			const product = buildProduct({ id: 1, price: 10000, amount: 10 });
			const input = {
				user,
				usedPoint: 0,
				products: [product],
				promotions: [],
				items: [{ productId: 1, quantity: 2, promotionId: null }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.total).toBe(20000);
			expect(user.point).toBe(100); // Points unchanged when usedPoint is 0
		});
	});

	describe("Complex Scenarios", () => {
		it("should handle sale with promotion AND customer points", () => {
			// Arrange
			const user = buildUser({ id: 1, point: 200 });
			const product = buildProduct({ id: 1, price: 100000, amount: 10 });
			const promotion = buildPromotion({
				id: 1,
				promotionType: PromotionType.PERCENTAGE,
				value: 10, // 10% off
			});
			const input = {
				user,
				usedPoint: 100,
				products: [product],
				promotions: [promotion],
				items: [{ productId: 1, quantity: 1, promotionId: 1 }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.items[0].discountedPrice).toBe(90000); // 100000 - 10%
			expect(result.total).toBe(89900); // 90000 - 100 points
			expect(user.point).toBe(999); // (200 - 100) + (89900/100) = 100 + 899
		});

		it("should handle multiple products with multiple promotions and points", () => {
			// Arrange
			const user = buildUser({ id: 1, point: 500 });
			const product1 = buildProduct({ id: 1, price: 50000, amount: 10 });
			const product2 = buildProduct({ id: 2, price: 30000, amount: 10 });
			const promotion1 = buildPromotion({
				id: 1,
				promotionType: PromotionType.FIXED,
				value: 10000,
				productIds: [1], // Promotion 1 applies to product 1
			});
			const promotion2 = buildPromotion({
				id: 2,
				promotionType: PromotionType.PERCENTAGE,
				value: 20,
				productIds: [2], // Promotion 2 applies to product 2
			});
			const input = {
				user,
				usedPoint: 300,
				products: [product1, product2],
				promotions: [promotion1, promotion2],
				items: [
					{ productId: 1, quantity: 2, promotionId: 1 }, // 40000 * 2 = 80000
					{ productId: 2, quantity: 3, promotionId: 2 }, // 24000 * 3 = 72000
				],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.total).toBe(151700); // (80000 + 72000) - 300
			expect(user.point).toBe(1717); // (500 - 300) + (151700/100) = 200 + 1517
		});

		it("should reduce multiple product stocks correctly", () => {
			// Arrange
			const product1 = buildProduct({ id: 1, price: 10000, amount: 10 });
			const product2 = buildProduct({ id: 2, price: 20000, amount: 20 });
			const product3 = buildProduct({ id: 3, price: 30000, amount: 5 });
			const input = {
				user: null,
				usedPoint: 0,
				products: [product1, product2, product3],
				promotions: [],
				items: [
					{ productId: 1, quantity: 3, promotionId: null },
					{ productId: 2, quantity: 5, promotionId: null },
					{ productId: 3, quantity: 2, promotionId: null },
				],
			};

			// Act
			service.processSale(input);

			// Assert
			expect(product1.amount).toBe(7); // 10 - 3
			expect(product2.amount).toBe(15); // 20 - 5
			expect(product3.amount).toBe(3); // 5 - 2
		});
	});

	describe("Edge Cases", () => {
		it("should handle very low price product", () => {
			// Arrange
			const product = buildProduct({ id: 1, price: 1, amount: 10 });
			const input = {
				user: null,
				usedPoint: 0,
				products: [product],
				promotions: [],
				items: [{ productId: 1, quantity: 5, promotionId: null }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.total).toBe(5);
			expect(result.items[0].subTotal).toBe(5);
		});

		it("should handle very large quantities", () => {
			// Arrange
			const product = buildProduct({ id: 1, price: 1000, amount: 10000 });
			const input = {
				user: null,
				usedPoint: 0,
				products: [product],
				promotions: [],
				items: [{ productId: 1, quantity: 1000, promotionId: null }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.total).toBe(1000000);
			expect(product.amount).toBe(9000);
		});

		it("should handle very high prices", () => {
			// Arrange
			const product = buildProduct({ id: 1, price: 10000000, amount: 10 });
			const input = {
				user: null,
				usedPoint: 0,
				products: [product],
				promotions: [],
				items: [{ productId: 1, quantity: 1, promotionId: null }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.total).toBe(10000000);
		});

		it("should handle 100% promotion (free product)", () => {
			// Arrange
			const product = buildProduct({ id: 1, price: 50000, amount: 10 });
			const promotion = buildPromotion({
				id: 1,
				promotionType: PromotionType.PERCENTAGE,
				value: 100,
			});
			const input = {
				user: null,
				usedPoint: 0,
				products: [product],
				promotions: [promotion],
				items: [{ productId: 1, quantity: 1, promotionId: 1 }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.items[0].discountedPrice).toBe(0);
			expect(result.total).toBe(0);
		});

		it("should handle promotion value exceeding product price", () => {
			// Arrange
			const product = buildProduct({ id: 1, price: 10000, amount: 10 });
			const promotion = buildPromotion({
				id: 1,
				promotionType: PromotionType.FIXED,
				value: 50000, // Greater than product price
			});
			const input = {
				user: null,
				usedPoint: 0,
				products: [product],
				promotions: [promotion],
				items: [{ productId: 1, quantity: 1, promotionId: 1 }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.items[0].discountedPrice).toBe(0); // Capped at 0
			expect(result.total).toBe(0);
		});

		it("should handle customer with zero points but not earn new points without using", () => {
			// Arrange
			const user = buildUser({ id: 1, point: 0 });
			const product = buildProduct({ id: 1, price: 10000, amount: 10 });
			const input = {
				user,
				usedPoint: 0,
				products: [product],
				promotions: [],
				items: [{ productId: 1, quantity: 5, promotionId: null }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.total).toBe(50000);
			expect(user.point).toBe(0); // No change when usedPoint is 0
		});

		it("should handle customer with maximum points", () => {
			// Arrange
			const user = buildUser({ id: 1, point: 999999 });
			const product = buildProduct({ id: 1, price: 10000, amount: 10 });
			const input = {
				user,
				usedPoint: 50000,
				products: [product],
				promotions: [],
				items: [{ productId: 1, quantity: 10, promotionId: null }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.total).toBe(50000); // 100000 - 50000
			expect(user.point).toBe(950499); // (999999 - 50000) + (50000/100)
		});

		it("should handle single quantity purchase", () => {
			// Arrange
			const product = buildProduct({ id: 1, price: 25000, amount: 10 });
			const input = {
				user: null,
				usedPoint: 0,
				products: [product],
				promotions: [],
				items: [{ productId: 1, quantity: 1, promotionId: null }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.total).toBe(25000);
			expect(result.items).toHaveLength(1);
		});

		it("should include promotion name in item details", () => {
			// Arrange
			const product = buildProduct({ id: 1, price: 50000, amount: 10 });
			const promotion = buildPromotion({
				id: 1,
				name: "Tet Sale 2025",
				promotionType: PromotionType.FIXED,
				value: 10000,
			});
			const input = {
				user: null,
				usedPoint: 0,
				products: [product],
				promotions: [promotion],
				items: [{ productId: 1, quantity: 1, promotionId: 1 }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.items[0].promotionName).toBe("Tet Sale 2025");
			expect(result.items[0].promotionId).toBe(1);
		});

		it("should set promotionId to null when no promotion applied", () => {
			// Arrange
			const product = buildProduct({ id: 1, price: 10000, amount: 10 });
			const input = {
				user: null,
				usedPoint: 0,
				products: [product],
				promotions: [],
				items: [{ productId: 1, quantity: 1, promotionId: null }],
			};

			// Act
			const result = service.processSale(input);

			// Assert
			expect(result.items[0].promotionId).toBeNull();
			expect(result.items[0].promotionName).toBe("");
		});
	});
});
