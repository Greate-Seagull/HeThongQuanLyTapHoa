import {
  Stocktaking,
  StocktakingDetail,
} from "../../../src/domain/entities/stocktaking";
import { ProductStatus } from "../../../src/generated/enums";

describe("Stocktaking Entity Unit Tests", () => {
  describe("StocktakingDetail", () => {
    describe("create", () => {
      it("should create stocktaking detail with GOOD status", () => {
        const detail = StocktakingDetail.create("GOOD", 50, 1, 10);

        expect(detail.status).toBe(ProductStatus.GOOD);
        expect(detail.quantity).toBe(50);
        expect(detail.productId).toBe(1);
        expect(detail.slotId).toBe(10);
      });

      it("should create stocktaking detail with EXPIRED status", () => {
        const detail = StocktakingDetail.create("EXPIRED", 10, 2, 15);

        expect(detail.status).toBe(ProductStatus.EXPIRED);
        expect(detail.quantity).toBe(10);
      });

      it("should accept zero quantity", () => {
        const detail = StocktakingDetail.create("GOOD", 0, 1, 10);

        expect(detail.quantity).toBe(0);
      });

      it("should throw error when quantity is negative", () => {
        expect(() => StocktakingDetail.create("GOOD", -5, 1, 10)).toThrow(
          "Invalid quantity"
        );
      });

      it("should throw error when status is invalid", () => {
        expect(() =>
          StocktakingDetail.create("INVALID_STATUS", 50, 1, 10)
        ).toThrow("Expect a status in");
      });

      it("should handle all valid product statuses", () => {
        const goodDetail = StocktakingDetail.create("GOOD", 10, 1, 1);
        const expiredDetail = StocktakingDetail.create("EXPIRED", 5, 2, 2);

        expect(goodDetail.status).toBe(ProductStatus.GOOD);
        expect(expiredDetail.status).toBe(ProductStatus.EXPIRED);
      });
    });

    describe("property getters", () => {
      it("should get all properties correctly", () => {
        const detail = StocktakingDetail.create("GOOD", 100, 5, 20);

        expect(detail.status).toBe(ProductStatus.GOOD);
        expect(detail.quantity).toBe(100);
        expect(detail.productId).toBe(5);
        expect(detail.slotId).toBe(20);
      });
    });
  });

  describe("Stocktaking", () => {
    describe("create", () => {
      it("should create stocktaking with single product", () => {
        const stocktaking = Stocktaking.create(1, [
          { status: "GOOD", quantity: 50, productId: 1, slotId: 10 },
        ]);

        expect(stocktaking.employeeId).toBe(1);
        expect(stocktaking.stocktakingDetails).toHaveLength(1);
        expect(stocktaking.createdAt).toBeInstanceOf(Date);
      });

      it("should create stocktaking with multiple products", () => {
        const stocktaking = Stocktaking.create(2, [
          { status: "GOOD", quantity: 100, productId: 1, slotId: 10 },
          { status: "EXPIRED", quantity: 5, productId: 2, slotId: 11 },
          { status: "GOOD", quantity: 75, productId: 3, slotId: 12 },
        ]);

        expect(stocktaking.employeeId).toBe(2);
        expect(stocktaking.stocktakingDetails).toHaveLength(3);
      });

      it("should throw error when details array is empty", () => {
        expect(() => Stocktaking.create(1, [])).toThrow(
          "Expect stocktaking to have at least one detail"
        );
      });

      it("should set createdAt to current time", () => {
        const before = new Date();
        const stocktaking = Stocktaking.create(1, [
          { status: "GOOD", quantity: 50, productId: 1, slotId: 10 },
        ]);
        const after = new Date();

        expect(stocktaking.createdAt.getTime()).toBeGreaterThanOrEqual(
          before.getTime()
        );
        expect(stocktaking.createdAt.getTime()).toBeLessThanOrEqual(
          after.getTime()
        );
      });

      it("should use details alias getter", () => {
        const stocktaking = Stocktaking.create(1, [
          { status: "GOOD", quantity: 50, productId: 1, slotId: 10 },
        ]);

        expect(stocktaking.details).toBe(stocktaking.stocktakingDetails);
        expect(stocktaking.details).toHaveLength(1);
      });
    });

    describe("updateDetails", () => {
      it("should update all details", () => {
        const stocktaking = Stocktaking.create(1, [
          { status: "GOOD", quantity: 50, productId: 1, slotId: 10 },
        ]);

        stocktaking.updateDetails([
          { status: "EXPIRED", quantity: 10, productId: 2, slotId: 11 },
          { status: "GOOD", quantity: 75, productId: 3, slotId: 12 },
        ]);

        expect(stocktaking.stocktakingDetails).toHaveLength(2);
        expect(stocktaking.stocktakingDetails[0].status).toBe(
          ProductStatus.EXPIRED
        );
      });

      it("should replace all previous details", () => {
        const stocktaking = Stocktaking.create(1, [
          { status: "GOOD", quantity: 50, productId: 1, slotId: 10 },
          { status: "GOOD", quantity: 30, productId: 2, slotId: 11 },
        ]);

        stocktaking.updateDetails([
          { status: "EXPIRED", quantity: 5, productId: 3, slotId: 12 },
        ]);

        expect(stocktaking.stocktakingDetails).toHaveLength(1);
        expect(stocktaking.stocktakingDetails[0].productId).toBe(3);
      });

      it("should update employeeId when updatedBy provided", () => {
        const stocktaking = Stocktaking.create(1, [
          { status: "GOOD", quantity: 50, productId: 1, slotId: 10 },
        ]);

        stocktaking.updateDetails(
          [{ status: "GOOD", quantity: 60, productId: 1, slotId: 10 }],
          5 // Updated by employee 5
        );

        expect(stocktaking.employeeId).toBe(5);
      });

      it("should not update employeeId when updatedBy not provided", () => {
        const stocktaking = Stocktaking.create(1, [
          { status: "GOOD", quantity: 50, productId: 1, slotId: 10 },
        ]);

        stocktaking.updateDetails([
          { status: "GOOD", quantity: 60, productId: 1, slotId: 10 },
        ]);

        expect(stocktaking.employeeId).toBe(1);
      });

      it("should throw error when updating with empty details", () => {
        const stocktaking = Stocktaking.create(1, [
          { status: "GOOD", quantity: 50, productId: 1, slotId: 10 },
        ]);

        expect(() => stocktaking.updateDetails([])).toThrow(
          "Expect stocktaking to have at least one detail"
        );
      });
    });

    describe("updateDetail", () => {
      it("should update specific detail quantity", () => {
        const stocktaking = Stocktaking.create(1, [
          { status: "GOOD", quantity: 50, productId: 1, slotId: 10 },
          { status: "GOOD", quantity: 30, productId: 2, slotId: 11 },
        ]);

        stocktaking.updateDetail(1, 10, 75);

        expect(stocktaking.stocktakingDetails[0].quantity).toBe(75);
        expect(stocktaking.stocktakingDetails[1].quantity).toBe(30); // Unchanged
      });

      it("should update specific detail status and quantity", () => {
        const stocktaking = Stocktaking.create(1, [
          { status: "GOOD", quantity: 50, productId: 1, slotId: 10 },
        ]);

        stocktaking.updateDetail(1, 10, 40, "EXPIRED");

        expect(stocktaking.stocktakingDetails[0].quantity).toBe(40);
        expect(stocktaking.stocktakingDetails[0].status).toBe(
          ProductStatus.EXPIRED
        );
      });

      it("should keep status unchanged when not provided", () => {
        const stocktaking = Stocktaking.create(1, [
          { status: "EXPIRED", quantity: 10, productId: 1, slotId: 10 },
        ]);

        stocktaking.updateDetail(1, 10, 15);

        expect(stocktaking.stocktakingDetails[0].quantity).toBe(15);
        expect(stocktaking.stocktakingDetails[0].status).toBe(
          ProductStatus.EXPIRED
        );
      });

      it("should throw error when detail not found", () => {
        const stocktaking = Stocktaking.create(1, [
          { status: "GOOD", quantity: 50, productId: 1, slotId: 10 },
        ]);

        expect(() => stocktaking.updateDetail(999, 999, 100)).toThrow(
          "Detail not found"
        );
      });

      it("should update detail in multi-product stocktaking", () => {
        const stocktaking = Stocktaking.create(1, [
          { status: "GOOD", quantity: 50, productId: 1, slotId: 10 },
          { status: "GOOD", quantity: 30, productId: 2, slotId: 11 },
          { status: "GOOD", quantity: 20, productId: 3, slotId: 12 },
        ]);

        stocktaking.updateDetail(2, 11, 40, "EXPIRED");

        expect(stocktaking.stocktakingDetails[1].quantity).toBe(40);
        expect(stocktaking.stocktakingDetails[1].status).toBe(
          ProductStatus.EXPIRED
        );
        // Others unchanged
        expect(stocktaking.stocktakingDetails[0].quantity).toBe(50);
        expect(stocktaking.stocktakingDetails[2].quantity).toBe(20);
      });
    });

    describe("business scenarios", () => {
      it("should handle routine inventory check (all GOOD)", () => {
        const stocktaking = Stocktaking.create(3, [
          { status: "GOOD", quantity: 100, productId: 1, slotId: 10 },
          { status: "GOOD", quantity: 75, productId: 2, slotId: 11 },
          { status: "GOOD", quantity: 50, productId: 3, slotId: 12 },
        ]);

        expect(stocktaking.stocktakingDetails).toHaveLength(3);
        expect(
          stocktaking.stocktakingDetails.every(
            (d) => d.status === ProductStatus.GOOD
          )
        ).toBe(true);
      });

      it("should handle expiry detection scenario", () => {
        const stocktaking = Stocktaking.create(3, [
          { status: "GOOD", quantity: 95, productId: 1, slotId: 10 },
          { status: "EXPIRED", quantity: 5, productId: 1, slotId: 10 }, // Found 5 expired
          { status: "GOOD", quantity: 50, productId: 2, slotId: 11 },
        ]);

        const expiredItems = stocktaking.stocktakingDetails.filter(
          (d) => d.status === ProductStatus.EXPIRED
        );
        expect(expiredItems).toHaveLength(1);
        expect(expiredItems[0].quantity).toBe(5);
      });

      it("should handle discrepancy found during check", () => {
        const stocktaking = Stocktaking.create(1, [
          { status: "GOOD", quantity: 47, productId: 1, slotId: 10 }, // System: 50, Found: 47
        ]);

        // Initially wrong, then corrected
        stocktaking.updateDetail(1, 10, 50); // Correction after recount

        expect(stocktaking.stocktakingDetails[0].quantity).toBe(50);
      });

      it("should handle zero quantity (out of stock found)", () => {
        const stocktaking = Stocktaking.create(2, [
          { status: "GOOD", quantity: 0, productId: 5, slotId: 20 }, // Empty slot
          { status: "GOOD", quantity: 100, productId: 1, slotId: 10 },
        ]);

        expect(stocktaking.stocktakingDetails[0].quantity).toBe(0);
      });

      it("should handle multi-slot stocktaking for same product", () => {
        const stocktaking = Stocktaking.create(1, [
          { status: "GOOD", quantity: 50, productId: 1, slotId: 10 }, // Shelf A
          { status: "GOOD", quantity: 30, productId: 1, slotId: 11 }, // Shelf B
          { status: "EXPIRED", quantity: 5, productId: 1, slotId: 12 }, // Shelf C (expired)
        ]);

        const product1Items = stocktaking.stocktakingDetails.filter(
          (d) => d.productId === 1
        );
        expect(product1Items).toHaveLength(3);
      });

      it("should handle large warehouse stocktaking", () => {
        const details = Array.from({ length: 50 }, (_, i) => ({
          status: i % 10 === 0 ? "EXPIRED" : "GOOD",
          quantity: (i + 1) * 10,
          productId: i + 1,
          slotId: i + 100,
        }));

        const stocktaking = Stocktaking.create(5, details);

        expect(stocktaking.stocktakingDetails).toHaveLength(50);
        const expiredCount = stocktaking.stocktakingDetails.filter(
          (d) => d.status === ProductStatus.EXPIRED
        ).length;
        expect(expiredCount).toBe(5); // 0, 10, 20, 30, 40
      });
    });

    describe("data integrity", () => {
      it("should maintain data consistency after creation", () => {
        const stocktaking = Stocktaking.create(5, [
          { status: "GOOD", quantity: 100, productId: 1, slotId: 10 },
          { status: "EXPIRED", quantity: 10, productId: 2, slotId: 11 },
        ]);

        expect(stocktaking.employeeId).toBe(5);
        expect(stocktaking.stocktakingDetails).toHaveLength(2);
        expect(stocktaking.stocktakingDetails[0].quantity).toBe(100);
        expect(stocktaking.stocktakingDetails[1].status).toBe(
          ProductStatus.EXPIRED
        );
      });

      it("should maintain createdAt after detail updates", () => {
        const stocktaking = Stocktaking.create(1, [
          { status: "GOOD", quantity: 50, productId: 1, slotId: 10 },
        ]);

        const originalCreatedAt = stocktaking.createdAt;

        stocktaking.updateDetail(1, 10, 60);

        expect(stocktaking.createdAt).toBe(originalCreatedAt);
      });
    });

    describe("edge cases", () => {
      it("should handle very large quantities", () => {
        const stocktaking = Stocktaking.create(1, [
          { status: "GOOD", quantity: 1000000, productId: 1, slotId: 10 },
        ]);

        expect(stocktaking.stocktakingDetails[0].quantity).toBe(1000000);
      });

      it("should handle updating to zero quantity", () => {
        const stocktaking = Stocktaking.create(1, [
          { status: "GOOD", quantity: 50, productId: 1, slotId: 10 },
        ]);

        stocktaking.updateDetail(1, 10, 0);

        expect(stocktaking.stocktakingDetails[0].quantity).toBe(0);
      });
    });
  });
});
