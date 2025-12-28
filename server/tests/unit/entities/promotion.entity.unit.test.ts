import {
  Promotion,
  PromotionDetail,
  PromotionType,
} from "../../../src/domain/entities/promotion";
import { Product } from "../../../src/domain/entities/product";
import { ProductUnit } from "../../../src/generated/enums";

describe("Promotion Entity Unit Tests", () => {
  describe("PromotionDetail", () => {
    describe("create", () => {
      it("should create promotion detail with productId", () => {
        const detail = PromotionDetail.create(1);

        expect(detail.productId).toBe(1);
      });

      it("should create multiple details for different products", () => {
        const detail1 = PromotionDetail.create(1);
        const detail2 = PromotionDetail.create(2);
        const detail3 = PromotionDetail.create(3);

        expect(detail1.productId).toBe(1);
        expect(detail2.productId).toBe(2);
        expect(detail3.productId).toBe(3);
      });
    });
  });

  describe("Promotion", () => {
    describe("create", () => {
      it("should create FIXED promotion", () => {
        const startDate = new Date("2025-01-01");
        const endDate = new Date("2025-01-31");

        const promotion = Promotion.create(
          "Giảm 10,000 VND",
          startDate,
          endDate,
          10000,
          "FIXED",
          [1, 2, 3]
        );

        expect(promotion.name).toBe("Giảm 10,000 VND");
        expect(promotion.value).toBe(10000);
        expect(promotion.promotionType).toBe(PromotionType.FIXED);
        expect(promotion.promotionDetails).toHaveLength(3);
      });

      it("should create PERCENTAGE promotion", () => {
        const startDate = new Date("2025-02-01");
        const endDate = new Date("2025-02-28");

        const promotion = Promotion.create(
          "Giảm 20%",
          startDate,
          endDate,
          20,
          "PERCENTAGE",
          [1, 2]
        );

        expect(promotion.name).toBe("Giảm 20%");
        expect(promotion.value).toBe(20);
        expect(promotion.promotionType).toBe(PromotionType.PERCENTAGE);
      });

      it("should create promotion with description", () => {
        const startDate = new Date("2025-03-01");
        const endDate = new Date("2025-03-31");

        const promotion = Promotion.create(
          "Flash Sale",
          startDate,
          endDate,
          50,
          "PERCENTAGE",
          [1],
          "Giảm giá sốc cuối tuần"
        );

        expect(promotion.description).toBe("Giảm giá sốc cuối tuần");
      });

      it("should throw error when start date >= end date", () => {
        const startDate = new Date("2025-01-31");
        const endDate = new Date("2025-01-01");

        expect(() =>
          Promotion.create(
            "Invalid Promotion",
            startDate,
            endDate,
            10000,
            "FIXED",
            [1]
          )
        ).toThrow("Expect start date to be before end date");
      });

      it("should throw error when start date equals end date", () => {
        const date = new Date("2025-01-01");

        expect(() =>
          Promotion.create(
            "Invalid Promotion",
            date,
            date,
            10000,
            "FIXED",
            [1]
          )
        ).toThrow("Expect start date to be before end date");
      });

      it("should throw error when value is negative", () => {
        const startDate = new Date("2025-01-01");
        const endDate = new Date("2025-01-31");

        expect(() =>
          Promotion.create(
            "Invalid Promotion",
            startDate,
            endDate,
            -100,
            "FIXED",
            [1]
          )
        ).toThrow("Invalid value");
      });

      it("should accept zero value", () => {
        const startDate = new Date("2025-01-01");
        const endDate = new Date("2025-01-31");

        const promotion = Promotion.create(
          "Free Promotion",
          startDate,
          endDate,
          0,
          "FIXED",
          [1]
        );

        expect(promotion.value).toBe(0);
      });

      it("should create promotion for multiple products", () => {
        const startDate = new Date("2025-01-01");
        const endDate = new Date("2025-01-31");
        const productIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        const promotion = Promotion.create(
          "Bulk Discount",
          startDate,
          endDate,
          15,
          "PERCENTAGE",
          productIds
        );

        expect(promotion.promotionDetails).toHaveLength(10);
      });
    });

    describe("isActive", () => {
      it("should return true when date is within range", () => {
        const startDate = new Date("2025-01-01");
        const endDate = new Date("2025-01-31");

        const promotion = Promotion.create(
          "Test Promotion",
          startDate,
          endDate,
          10000,
          "FIXED",
          [1]
        );

        const checkDate = new Date("2025-01-15");
        expect(promotion.isActive(checkDate)).toBe(true);
      });

      it("should return true on start date", () => {
        const startDate = new Date("2025-01-01");
        const endDate = new Date("2025-01-31");

        const promotion = Promotion.create(
          "Test Promotion",
          startDate,
          endDate,
          10000,
          "FIXED",
          [1]
        );

        expect(promotion.isActive(startDate)).toBe(true);
      });

      it("should return true on end date", () => {
        const startDate = new Date("2025-01-01");
        const endDate = new Date("2025-01-31");

        const promotion = Promotion.create(
          "Test Promotion",
          startDate,
          endDate,
          10000,
          "FIXED",
          [1]
        );

        expect(promotion.isActive(endDate)).toBe(true);
      });

      it("should return false before start date", () => {
        const startDate = new Date("2025-01-10");
        const endDate = new Date("2025-01-31");

        const promotion = Promotion.create(
          "Test Promotion",
          startDate,
          endDate,
          10000,
          "FIXED",
          [1]
        );

        const checkDate = new Date("2025-01-05");
        expect(promotion.isActive(checkDate)).toBe(false);
      });

      it("should return false after end date", () => {
        const startDate = new Date("2025-01-01");
        const endDate = new Date("2025-01-31");

        const promotion = Promotion.create(
          "Test Promotion",
          startDate,
          endDate,
          10000,
          "FIXED",
          [1]
        );

        const checkDate = new Date("2025-02-05");
        expect(promotion.isActive(checkDate)).toBe(false);
      });
    });

    describe("calculateDiscount", () => {
      it("should calculate FIXED discount correctly", () => {
        const promotion = Promotion.create(
          "Giảm 10K",
          new Date("2025-01-01"),
          new Date("2025-01-31"),
          10000,
          "FIXED",
          [1]
        );

        const discount = promotion.calculateDiscount(50000);
        expect(discount).toBe(10000);
      });

      it("should calculate PERCENTAGE discount correctly", () => {
        const promotion = Promotion.create(
          "Giảm 20%",
          new Date("2025-01-01"),
          new Date("2025-01-31"),
          20,
          "PERCENTAGE",
          [1]
        );

        const discount = promotion.calculateDiscount(100000);
        expect(discount).toBe(20000); // 20% of 100,000
      });

      it("should calculate 50% discount correctly", () => {
        const promotion = Promotion.create(
          "Giảm 50%",
          new Date("2025-01-01"),
          new Date("2025-01-31"),
          50,
          "PERCENTAGE",
          [1]
        );

        const discount = promotion.calculateDiscount(80000);
        expect(discount).toBe(40000);
      });

      it("should not exceed base price for FIXED discount", () => {
        const promotion = Promotion.create(
          "Giảm 50K",
          new Date("2025-01-01"),
          new Date("2025-01-31"),
          50000,
          "FIXED",
          [1]
        );

        const discount = promotion.calculateDiscount(30000);
        expect(discount).toBe(30000); // Cap at basePrice
      });

      it("should not exceed base price for PERCENTAGE discount", () => {
        const promotion = Promotion.create(
          "Giảm 100%",
          new Date("2025-01-01"),
          new Date("2025-01-31"),
          100,
          "PERCENTAGE",
          [1]
        );

        const discount = promotion.calculateDiscount(50000);
        expect(discount).toBe(50000); // Cap at basePrice
      });

      it("should handle small percentage correctly", () => {
        const promotion = Promotion.create(
          "Giảm 5%",
          new Date("2025-01-01"),
          new Date("2025-01-31"),
          5,
          "PERCENTAGE",
          [1]
        );

        const discount = promotion.calculateDiscount(10000);
        expect(discount).toBe(500);
      });
    });

    describe("update", () => {
      it("should update name", () => {
        const promotion = Promotion.create(
          "Old Name",
          new Date("2025-01-01"),
          new Date("2025-01-31"),
          10000,
          "FIXED",
          [1]
        );

        promotion.update({ name: "New Name" });

        expect(promotion.name).toBe("New Name");
      });

      it("should update description", () => {
        const promotion = Promotion.create(
          "Test",
          new Date("2025-01-01"),
          new Date("2025-01-31"),
          10000,
          "FIXED",
          [1],
          "Old Description"
        );

        promotion.update({ description: "New Description" });

        expect(promotion.description).toBe("New Description");
      });

      it("should update value", () => {
        const promotion = Promotion.create(
          "Test",
          new Date("2025-01-01"),
          new Date("2025-01-31"),
          10000,
          "FIXED",
          [1]
        );

        promotion.update({ value: 15000 });

        expect(promotion.value).toBe(15000);
      });

      it("should update promotionType", () => {
        const promotion = Promotion.create(
          "Test",
          new Date("2025-01-01"),
          new Date("2025-01-31"),
          10000,
          "FIXED",
          [1]
        );

        promotion.update({ promotionType: "PERCENTAGE" });

        expect(promotion.promotionType).toBe(PromotionType.PERCENTAGE);
      });

      it("should update dates", () => {
        const promotion = Promotion.create(
          "Test",
          new Date("2025-01-01"),
          new Date("2025-01-31"),
          10000,
          "FIXED",
          [1]
        );

        const newStart = new Date("2025-02-01");
        const newEnd = new Date("2025-02-28");

        promotion.update({ startedAt: newStart, endedAt: newEnd });

        expect(promotion.startedAt).toEqual(newStart);
        expect(promotion.endedAt).toEqual(newEnd);
      });

      it("should update promotionDetails", () => {
        const promotion = Promotion.create(
          "Test",
          new Date("2025-01-01"),
          new Date("2025-01-31"),
          10000,
          "FIXED",
          [1, 2]
        );

        promotion.update({
          promotionDetails: [{ productId: 3 }, { productId: 4 }],
        });

        expect(promotion.promotionDetails).toHaveLength(2);
        expect(promotion.promotionDetails[0].productId).toBe(3);
        expect(promotion.promotionDetails[1].productId).toBe(4);
      });

      it("should update multiple fields at once", () => {
        const promotion = Promotion.create(
          "Old Name",
          new Date("2025-01-01"),
          new Date("2025-01-31"),
          10000,
          "FIXED",
          [1]
        );

        promotion.update({
          name: "New Name",
          value: 20000,
          promotionType: "PERCENTAGE",
        });

        expect(promotion.name).toBe("New Name");
        expect(promotion.value).toBe(20000);
        expect(promotion.promotionType).toBe(PromotionType.PERCENTAGE);
      });
    });

    describe("business scenarios", () => {
      it("should handle Tet sale promotion", () => {
        const promotion = Promotion.create(
          "Khuyến mãi Tết 2025",
          new Date("2025-01-25"),
          new Date("2025-02-05"),
          30,
          "PERCENTAGE",
          [1, 2, 3, 4, 5],
          "Giảm giá đặc biệt dịp Tết Nguyên Đán"
        );

        expect(promotion.name).toContain("Tết");
        expect(promotion.value).toBe(30);
        expect(promotion.promotionDetails).toHaveLength(5);

        // Check active during Tet
        const tetDate = new Date("2025-02-01");
        expect(promotion.isActive(tetDate)).toBe(true);
      });

      it("should handle flash sale (short duration)", () => {
        const promotion = Promotion.create(
          "Flash Sale 1 giờ",
          new Date("2025-01-15T10:00:00"),
          new Date("2025-01-15T11:00:00"),
          50,
          "PERCENTAGE",
          [1, 2]
        );

        const during = new Date("2025-01-15T10:30:00");
        const after = new Date("2025-01-15T11:30:00");

        expect(promotion.isActive(during)).toBe(true);
        expect(promotion.isActive(after)).toBe(false);
      });

      it("should handle seasonal promotion", () => {
        const promotion = Promotion.create(
          "Khuyến mãi Hè 2025",
          new Date("2025-06-01"),
          new Date("2025-08-31"),
          15,
          "PERCENTAGE",
          [10, 11, 12, 13, 14, 15]
        );

        const summerDate = new Date("2025-07-15");
        expect(promotion.isActive(summerDate)).toBe(true);
      });

      it("should handle member exclusive promotion", () => {
        const promotion = Promotion.create(
          "Ưu đãi thành viên",
          new Date("2025-01-01"),
          new Date("2025-12-31"),
          10,
          "PERCENTAGE",
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        );

        expect(promotion.promotionDetails).toHaveLength(10);
      });
    });

    describe("data integrity", () => {
      it("should maintain data consistency after creation", () => {
        const startDate = new Date("2025-01-01");
        const endDate = new Date("2025-01-31");

        const promotion = Promotion.create(
          "Test Promotion",
          startDate,
          endDate,
          10000,
          "FIXED",
          [1, 2, 3]
        );

        expect(promotion.name).toBe("Test Promotion");
        expect(promotion.startedAt).toEqual(startDate);
        expect(promotion.endedAt).toEqual(endDate);
        expect(promotion.value).toBe(10000);
        expect(promotion.promotionType).toBe(PromotionType.FIXED);
        expect(promotion.promotionDetails).toHaveLength(3);
      });

      it("should return shallow copy of promotionDetails", () => {
        const promotion = Promotion.create(
          "Test",
          new Date("2025-01-01"),
          new Date("2025-01-31"),
          10000,
          "FIXED",
          [1, 2]
        );

        const details1 = promotion.promotionDetails;
        const details2 = promotion.promotionDetails;

        expect(details1).not.toBe(details2); // Different arrays
        expect(details1).toEqual(details2); // Same content
      });
    });

    describe("edge cases", () => {
      it("should handle 0% discount", () => {
        const promotion = Promotion.create(
          "No Discount",
          new Date("2025-01-01"),
          new Date("2025-01-31"),
          0,
          "PERCENTAGE",
          [1]
        );

        const discount = promotion.calculateDiscount(50000);
        expect(discount).toBe(0);
      });

      it("should handle very high percentage", () => {
        const promotion = Promotion.create(
          "200% off", // Invalid in real world, but test boundary
          new Date("2025-01-01"),
          new Date("2025-01-31"),
          200,
          "PERCENTAGE",
          [1]
        );

        const discount = promotion.calculateDiscount(50000);
        expect(discount).toBe(50000); // Capped at base price
      });

      it("should handle very large fixed discount", () => {
        const promotion = Promotion.create(
          "Huge Discount",
          new Date("2025-01-01"),
          new Date("2025-01-31"),
          1000000,
          "FIXED",
          [1]
        );

        const discount = promotion.calculateDiscount(50000);
        expect(discount).toBe(50000); // Capped at base price
      });

      it("should handle promotion for single product", () => {
        const promotion = Promotion.create(
          "Single Product",
          new Date("2025-01-01"),
          new Date("2025-01-31"),
          5000,
          "FIXED",
          [1]
        );

        expect(promotion.promotionDetails).toHaveLength(1);
      });

      it("should handle long-term promotion (1 year)", () => {
        const promotion = Promotion.create(
          "Year-long Discount",
          new Date("2025-01-01"),
          new Date("2025-12-31"),
          10,
          "PERCENTAGE",
          [1, 2, 3]
        );

        const midYear = new Date("2025-06-15");
        expect(promotion.isActive(midYear)).toBe(true);
      });
    });
  });
});
