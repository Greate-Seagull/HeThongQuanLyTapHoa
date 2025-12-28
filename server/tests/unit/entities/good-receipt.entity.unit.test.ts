import {
  GoodReceipt,
  GoodReceiptDetail,
} from "../../../src/domain/entities/good-receipt";

describe("GoodReceipt Entity Unit Tests", () => {
  describe("GoodReceiptDetail", () => {
    describe("create", () => {
      it("should create good receipt detail with valid data", () => {
        const detail = GoodReceiptDetail.create(50, 15000, 1);

        expect(detail.quantity).toBe(50);
        expect(detail.price).toBe(15000);
        expect(detail.productId).toBe(1);
      });

      it("should create detail with large quantity", () => {
        const detail = GoodReceiptDetail.create(1000, 10000, 2);

        expect(detail.quantity).toBe(1000);
        expect(detail.price).toBe(10000);
      });

      it("should throw error when quantity is zero", () => {
        expect(() => GoodReceiptDetail.create(0, 15000, 1)).toThrow(
          "Invalid quantity"
        );
      });

      it("should throw error when quantity is negative", () => {
        expect(() => GoodReceiptDetail.create(-10, 15000, 1)).toThrow(
          "Invalid quantity"
        );
      });

      it("should throw error when price is zero", () => {
        expect(() => GoodReceiptDetail.create(50, 0, 1)).toThrow(
          "Invalid price"
        );
      });

      it("should throw error when price is negative", () => {
        expect(() => GoodReceiptDetail.create(50, -5000, 1)).toThrow(
          "Invalid price"
        );
      });

      it("should throw error when productId is zero", () => {
        expect(() => GoodReceiptDetail.create(50, 15000, 0)).toThrow(
          "Invalid product id"
        );
      });

      it("should throw error when productId is negative", () => {
        expect(() => GoodReceiptDetail.create(50, 15000, -1)).toThrow(
          "Invalid product id"
        );
      });
    });

    describe("property getters", () => {
      it("should get quantity correctly", () => {
        const detail = GoodReceiptDetail.create(50, 15000, 1);

        expect(detail.quantity).toBe(50);
      });

      it("should get price correctly", () => {
        const detail = GoodReceiptDetail.create(50, 15000, 1);

        expect(detail.price).toBe(15000);
      });

      it("should get productId correctly", () => {
        const detail = GoodReceiptDetail.create(50, 15000, 1);

        expect(detail.productId).toBe(1);
      });
    });
  });

  describe("GoodReceipt", () => {
    describe("create", () => {
      it("should create good receipt with single product", () => {
        const receipt = GoodReceipt.create(1, [
          { quantity: 50, price: 15000, productId: 1 },
        ]);

        expect(receipt.employeeId).toBe(1);
        expect(receipt.goodReceiptDetails).toHaveLength(1);
        expect(receipt.createdAt).toBeInstanceOf(Date);
      });

      it("should create good receipt with multiple products", () => {
        const receipt = GoodReceipt.create(2, [
          { quantity: 100, price: 12000, productId: 1 },
          { quantity: 50, price: 15000, productId: 2 },
          { quantity: 200, price: 8000, productId: 3 },
        ]);

        expect(receipt.employeeId).toBe(2);
        expect(receipt.goodReceiptDetails).toHaveLength(3);
      });

      it("should throw error when employeeId is negative", () => {
        expect(() =>
          GoodReceipt.create(-1, [
            { quantity: 50, price: 15000, productId: 1 },
          ])
        ).toThrow("Invalid employee id");
      });

      it("should create with empty details array", () => {
        const receipt = GoodReceipt.create(1, []);

        expect(receipt.goodReceiptDetails).toHaveLength(0);
      });

      it("should set createdAt to current time", () => {
        const before = new Date();
        const receipt = GoodReceipt.create(1, [
          { quantity: 50, price: 15000, productId: 1 },
        ]);
        const after = new Date();

        expect(receipt.createdAt.getTime()).toBeGreaterThanOrEqual(
          before.getTime()
        );
        expect(receipt.createdAt.getTime()).toBeLessThanOrEqual(
          after.getTime()
        );
      });
    });

    describe("updateItems", () => {
      it("should update receipt items", () => {
        const receipt = GoodReceipt.create(1, [
          { quantity: 50, price: 15000, productId: 1 },
        ]);

        receipt.updateItems([
          { quantity: 100, price: 12000, productId: 2 },
          { quantity: 75, price: 18000, productId: 3 },
        ]);

        expect(receipt.goodReceiptDetails).toHaveLength(2);
        expect(receipt.goodReceiptDetails[0].quantity).toBe(100);
        expect(receipt.goodReceiptDetails[0].productId).toBe(2);
      });

      it("should replace all previous items", () => {
        const receipt = GoodReceipt.create(1, [
          { quantity: 50, price: 15000, productId: 1 },
          { quantity: 30, price: 20000, productId: 2 },
        ]);

        receipt.updateItems([{ quantity: 100, price: 10000, productId: 3 }]);

        expect(receipt.goodReceiptDetails).toHaveLength(1);
        expect(receipt.goodReceiptDetails[0].productId).toBe(3);
      });

      it("should clear items when given empty array", () => {
        const receipt = GoodReceipt.create(1, [
          { quantity: 50, price: 15000, productId: 1 },
        ]);

        receipt.updateItems([]);

        expect(receipt.goodReceiptDetails).toHaveLength(0);
      });
    });

    describe("business scenarios", () => {
      it("should handle small restocking order", () => {
        const receipt = GoodReceipt.create(1, [
          { quantity: 10, price: 15000, productId: 1 }, // 10 Coca bottles
          { quantity: 5, price: 18000, productId: 2 }, // 5 Pepsi bottles
        ]);

        expect(receipt.goodReceiptDetails).toHaveLength(2);
        expect(receipt.employeeId).toBe(1);
      });

      it("should handle bulk order from supplier", () => {
        const receipt = GoodReceipt.create(2, [
          { quantity: 500, price: 10000, productId: 1 },
          { quantity: 300, price: 12000, productId: 2 },
          { quantity: 1000, price: 5000, productId: 3 },
        ]);

        expect(receipt.goodReceiptDetails).toHaveLength(3);
        // Total value: 500*10000 + 300*12000 + 1000*5000 = 13,600,000 VND
      });

      it("should handle same product different prices (batch pricing)", () => {
        const receipt = GoodReceipt.create(1, [
          { quantity: 100, price: 10000, productId: 1 }, // First batch
          { quantity: 50, price: 9500, productId: 1 }, // Second batch (discount)
        ]);

        expect(receipt.goodReceiptDetails).toHaveLength(2);
        expect(receipt.goodReceiptDetails[0].productId).toBe(1);
        expect(receipt.goodReceiptDetails[1].productId).toBe(1);
        expect(receipt.goodReceiptDetails[0].price).toBe(10000);
        expect(receipt.goodReceiptDetails[1].price).toBe(9500);
      });

      it("should handle high-value import", () => {
        const receipt = GoodReceipt.create(3, [
          { quantity: 100, price: 100000, productId: 5 }, // Premium product
        ]);

        expect(receipt.goodReceiptDetails[0].price).toBe(100000);
        // Total: 10,000,000 VND
      });

      it("should handle mixed product types", () => {
        const receipt = GoodReceipt.create(1, [
          { quantity: 50, price: 15000, productId: 1 }, // Beverages
          { quantity: 30, price: 25000, productId: 10 }, // Snacks
          { quantity: 100, price: 5000, productId: 20 }, // Candies
        ]);

        expect(receipt.goodReceiptDetails).toHaveLength(3);
      });
    });

    describe("data integrity", () => {
      it("should maintain data consistency after creation", () => {
        const receipt = GoodReceipt.create(5, [
          { quantity: 100, price: 12000, productId: 1 },
          { quantity: 50, price: 15000, productId: 2 },
        ]);

        expect(receipt.employeeId).toBe(5);
        expect(receipt.goodReceiptDetails).toHaveLength(2);
        expect(receipt.goodReceiptDetails[0].quantity).toBe(100);
        expect(receipt.goodReceiptDetails[0].price).toBe(12000);
        expect(receipt.goodReceiptDetails[1].quantity).toBe(50);
      });

      it("should maintain data after item update", () => {
        const receipt = GoodReceipt.create(1, [
          { quantity: 50, price: 15000, productId: 1 },
        ]);

        const originalEmployeeId = receipt.employeeId;
        const originalCreatedAt = receipt.createdAt;

        receipt.updateItems([
          { quantity: 100, price: 10000, productId: 2 },
        ]);

        // EmployeeId and createdAt should not change
        expect(receipt.employeeId).toBe(originalEmployeeId);
        expect(receipt.createdAt).toBe(originalCreatedAt);
      });
    });

    describe("edge cases", () => {
      it("should handle very large quantities", () => {
        const receipt = GoodReceipt.create(1, [
          { quantity: 1000000, price: 1, productId: 1 },
        ]);

        expect(receipt.goodReceiptDetails[0].quantity).toBe(1000000);
      });

      it("should handle very high prices", () => {
        const receipt = GoodReceipt.create(1, [
          { quantity: 1, price: 10000000, productId: 1 },
        ]);

        expect(receipt.goodReceiptDetails[0].price).toBe(10000000);
      });

      it("should handle many products in one receipt", () => {
        const details = Array.from({ length: 100 }, (_, i) => ({
          quantity: i + 1,
          price: (i + 1) * 1000,
          productId: i + 1,
        }));

        const receipt = GoodReceipt.create(1, details);

        expect(receipt.goodReceiptDetails).toHaveLength(100);
      });
    });
  });
});
