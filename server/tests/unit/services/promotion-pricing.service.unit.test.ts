import { PromotionPricingService } from "../../../src/domain/services/promotion-pricing.service";
import { Promotion, PromotionType } from "../../../src/domain/entities/promotion";

describe("PromotionPricingService Unit Tests", () => {
  let service: PromotionPricingService;

  beforeEach(() => {
    service = new PromotionPricingService();
  });

  describe("getBestPromotion", () => {
    const basePrice = 100000; // 100,000 VND

    describe("Single Promotion Cases", () => {
      it("should return the only active promotion", () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const promotion = Promotion.create(
          "10% Off",
          yesterday,
          tomorrow,
          10,
          PromotionType.PERCENTAGE,
          [1],
          "Test promotion"
        );

        const result = service.getBestPromotion([promotion], basePrice);

        expect(result).toBe(promotion);
      });

      it("should return null when promotion is not active yet", () => {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const promotion = Promotion.create(
          "Future Promotion",
          tomorrow,
          nextWeek,
          10000,
          PromotionType.FIXED,
          [1]
        );

        const result = service.getBestPromotion([promotion], basePrice);

        expect(result).toBeNull();
      });

      it("should return null when promotion has expired", () => {
        const now = new Date();
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const promotion = Promotion.create(
          "Expired Promotion",
          lastWeek,
          yesterday,
          10000,
          PromotionType.FIXED,
          [1]
        );

        const result = service.getBestPromotion([promotion], basePrice);

        expect(result).toBeNull();
      });
    });

    describe("Multiple Promotions - Fixed Amount", () => {
      it("should return promotion with highest discount amount", () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const promo1 = Promotion.create(
          "5k Off",
          yesterday,
          tomorrow,
          5000,
          PromotionType.FIXED,
          [1]
        );

        const promo2 = Promotion.create(
          "10k Off",
          yesterday,
          tomorrow,
          10000,
          PromotionType.FIXED,
          [1]
        );

        const promo3 = Promotion.create(
          "15k Off",
          yesterday,
          tomorrow,
          15000,
          PromotionType.FIXED,
          [1]
        );

        const result = service.getBestPromotion(
          [promo1, promo2, promo3],
          basePrice
        );

        expect(result).toBe(promo3);
        expect(result?.value).toBe(15000);
      });
    });

    describe("Multiple Promotions - Percentage", () => {
      it("should return promotion with highest percentage discount", () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const promo1 = Promotion.create(
          "10% Off",
          yesterday,
          tomorrow,
          10,
          PromotionType.PERCENTAGE,
          [1]
        );

        const promo2 = Promotion.create(
          "20% Off",
          yesterday,
          tomorrow,
          20,
          PromotionType.PERCENTAGE,
          [1]
        );

        const promo3 = Promotion.create(
          "15% Off",
          yesterday,
          tomorrow,
          15,
          PromotionType.PERCENTAGE,
          [1]
        );

        const result = service.getBestPromotion(
          [promo1, promo2, promo3],
          basePrice
        );

        expect(result).toBe(promo2);
        expect(result?.value).toBe(20);
      });

      it("should calculate percentage discount correctly on different prices", () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const promo = Promotion.create(
          "20% Off",
          yesterday,
          tomorrow,
          20,
          PromotionType.PERCENTAGE,
          [1]
        );

        // Test với giá 100,000 VND
        const result1 = service.getBestPromotion([promo], 100000);
        expect(result1?.calculateDiscount(100000)).toBe(20000); // 20% of 100k = 20k

        // Test với giá 50,000 VND
        const result2 = service.getBestPromotion([promo], 50000);
        expect(result2?.calculateDiscount(50000)).toBe(10000); // 20% of 50k = 10k
      });
    });

    describe("Mixed Promotion Types", () => {
      it("should compare fixed and percentage promotions correctly", () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Fixed: 15,000 VND off
        const fixedPromo = Promotion.create(
          "15k Off",
          yesterday,
          tomorrow,
          15000,
          PromotionType.FIXED,
          [1]
        );

        // Percentage: 10% off (= 10,000 VND off for 100k price)
        const percentagePromo = Promotion.create(
          "10% Off",
          yesterday,
          tomorrow,
          10,
          PromotionType.PERCENTAGE,
          [1]
        );

        const result = service.getBestPromotion(
          [fixedPromo, percentagePromo],
          100000
        );

        expect(result).toBe(fixedPromo);
        expect(result?.calculateDiscount(100000)).toBe(15000);
      });

      it("should prefer percentage when it gives better discount", () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Fixed: 10,000 VND off
        const fixedPromo = Promotion.create(
          "10k Off",
          yesterday,
          tomorrow,
          10000,
          PromotionType.FIXED,
          [1]
        );

        // Percentage: 25% off (= 25,000 VND off for 100k price)
        const percentagePromo = Promotion.create(
          "25% Off",
          yesterday,
          tomorrow,
          25,
          PromotionType.PERCENTAGE,
          [1]
        );

        const result = service.getBestPromotion(
          [fixedPromo, percentagePromo],
          100000
        );

        expect(result).toBe(percentagePromo);
        expect(result?.calculateDiscount(100000)).toBe(25000);
      });
    });

    describe("Edge Cases", () => {
      it("should return null when promotions array is empty", () => {
        const result = service.getBestPromotion([], basePrice);
        expect(result).toBeNull();
      });

      it("should return null when all promotions are inactive", () => {
        const now = new Date();
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const promo1 = Promotion.create(
          "Expired 1",
          lastMonth,
          lastWeek,
          10000,
          PromotionType.FIXED,
          [1]
        );

        const promo2 = Promotion.create(
          "Expired 2",
          lastMonth,
          lastWeek,
          15000,
          PromotionType.FIXED,
          [1]
        );

        const result = service.getBestPromotion([promo1, promo2], basePrice);
        expect(result).toBeNull();
      });

      it("should handle very small base price", () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const promo = Promotion.create(
          "50% Off",
          yesterday,
          tomorrow,
          50,
          PromotionType.PERCENTAGE,
          [1]
        );

        const smallPrice = 100; // 100 VND
        const result = service.getBestPromotion([promo], smallPrice);

        expect(result).toBe(promo);
        expect(result?.calculateDiscount(smallPrice)).toBe(50); // 50% of 100 = 50
      });

      it("should handle zero base price", () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const promo = Promotion.create(
          "Any Discount",
          yesterday,
          tomorrow,
          10,
          PromotionType.PERCENTAGE,
          [1]
        );

        const result = service.getBestPromotion([promo], 0);

        expect(result).toBe(promo);
        expect(result?.calculateDiscount(0)).toBe(0);
      });

      it("should handle promotions with equal discounts", () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const promo1 = Promotion.create(
          "10k Off",
          yesterday,
          tomorrow,
          10000,
          PromotionType.FIXED,
          [1]
        );

        const promo2 = Promotion.create(
          "10% Off",
          yesterday,
          tomorrow,
          10,
          PromotionType.PERCENTAGE,
          [1]
        );

        // Both give 10,000 VND discount on 100,000 VND
        const result = service.getBestPromotion([promo1, promo2], 100000);

        // Should return the latter one based on reduce logic
        expect(result).toBe(promo2);
      });
    });

    describe("Custom Date Testing", () => {
      it("should use provided date instead of current date", () => {
        const jan1 = new Date("2024-01-01");
        const dec31 = new Date("2023-12-31");
        const jan2 = new Date("2024-01-02");

        const promotion = Promotion.create(
          "New Year Promotion",
          dec31,
          jan2,
          20000,
          PromotionType.FIXED,
          [1]
        );

        // Check on Jan 1st (active)
        const result1 = service.getBestPromotion([promotion], basePrice, jan1);
        expect(result1).toBe(promotion);

        // Check before start date (inactive)
        const dec30 = new Date("2023-12-30");
        const result2 = service.getBestPromotion([promotion], basePrice, dec30);
        expect(result2).toBeNull();

        // Check after end date (inactive)
        const jan3 = new Date("2024-01-03");
        const result3 = service.getBestPromotion([promotion], basePrice, jan3);
        expect(result3).toBeNull();
      });
    });

    describe("Real-world Scenarios", () => {
      it("should handle Vietnamese Tet sale scenario", () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const flashSale = Promotion.create(
          "Flash Sale 30%",
          yesterday,
          tomorrow,
          30,
          PromotionType.PERCENTAGE,
          [1]
        );

        const memberDiscount = Promotion.create(
          "Member Discount 20k",
          yesterday,
          tomorrow,
          20000,
          PromotionType.FIXED,
          [1]
        );

        const bulkBuy = Promotion.create(
          "Bulk Buy 25%",
          yesterday,
          tomorrow,
          25,
          PromotionType.PERCENTAGE,
          [1]
        );

        // Product price: 150,000 VND
        // Flash Sale: 30% = 45,000 VND
        // Member: 20,000 VND
        // Bulk: 25% = 37,500 VND
        const result = service.getBestPromotion(
          [flashSale, memberDiscount, bulkBuy],
          150000
        );

        expect(result).toBe(flashSale);
        expect(result?.calculateDiscount(150000)).toBe(45000);
      });

      it("should handle low-price product promotions", () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // For a 3,000 VND product (e.g., instant noodle)
        const smallFixed = Promotion.create(
          "500đ Off",
          yesterday,
          tomorrow,
          500,
          PromotionType.FIXED,
          [1]
        );

        const highPercentage = Promotion.create(
          "20% Off",
          yesterday,
          tomorrow,
          20,
          PromotionType.PERCENTAGE,
          [1]
        );

        // 500 VND vs 20% of 3000 = 600 VND
        const result = service.getBestPromotion(
          [smallFixed, highPercentage],
          3000
        );

        expect(result).toBe(highPercentage);
        expect(result?.calculateDiscount(3000)).toBe(600);
      });

      it("should handle high-value product promotions", () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // For a 2,000,000 VND product (e.g., premium item)
        const bigFixed = Promotion.create(
          "500k Off",
          yesterday,
          tomorrow,
          500000,
          PromotionType.FIXED,
          [1]
        );

        const bigPercentage = Promotion.create(
          "20% Off",
          yesterday,
          tomorrow,
          20,
          PromotionType.PERCENTAGE,
          [1]
        );

        // 500,000 VND vs 20% of 2M = 400,000 VND
        const result = service.getBestPromotion(
          [bigFixed, bigPercentage],
          2000000
        );

        expect(result).toBe(bigFixed);
        expect(result?.calculateDiscount(2000000)).toBe(500000);
      });
    });

    describe("Performance", () => {
      it("should handle many promotions efficiently", () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const promotions: Promotion[] = [];
        for (let i = 1; i <= 100; i++) {
          promotions.push(
            Promotion.create(
              `Promo ${i}`,
              yesterday,
              tomorrow,
              i * 100,
              PromotionType.FIXED,
              [1]
            )
          );
        }

        const startTime = Date.now();
        const result = service.getBestPromotion(promotions, basePrice);
        const endTime = Date.now();

        expect(result).toBeDefined();
        expect(result?.value).toBe(10000); // Highest value
        expect(endTime - startTime).toBeLessThan(100); // Should be very fast
      });
    });
  });
});
