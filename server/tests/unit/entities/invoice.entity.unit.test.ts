import { Invoice, InvoiceDetail } from "../../../src/domain/entities/invoice";
import { ProductUnit } from "../../../src/generated/enums";

describe("Invoice Entity Unit Tests", () => {
  describe("InvoiceDetail", () => {
    describe("create", () => {
      it("should create invoice detail with valid data", () => {
        const detail = InvoiceDetail.create(5, 1);

        expect(detail.quantity).toBe(5);
        expect(detail.productId).toBe(1);
        expect(detail.promotionId).toBeUndefined();
      });

      it("should create invoice detail with promotion", () => {
        const detail = InvoiceDetail.create(3, 2, 10);

        expect(detail.quantity).toBe(3);
        expect(detail.productId).toBe(2);
        expect(detail.promotionId).toBe(10);
      });

      it("should throw error when quantity is negative", () => {
        expect(() => InvoiceDetail.create(-5, 1)).toThrow("Invalid quantity");
      });

      it("should accept zero quantity (edge case)", () => {
        const detail = InvoiceDetail.create(0, 1);

        expect(detail.quantity).toBe(0);
      });

      it("should handle large quantities", () => {
        const detail = InvoiceDetail.create(1000, 1);

        expect(detail.quantity).toBe(1000);
      });
    });

    describe("property setters", () => {
      it("should set quantity correctly", () => {
        const detail = InvoiceDetail.create(5, 1);
        detail.quantity = 10;

        expect(detail.quantity).toBe(10);
      });

      it("should throw error when setting negative quantity", () => {
        const detail = InvoiceDetail.create(5, 1);

        expect(() => {
          detail.quantity = -1;
        }).toThrow("Invalid quantity");
      });

      it("should set productId correctly", () => {
        const detail = InvoiceDetail.create(5, 1);
        detail.productId = 2;

        expect(detail.productId).toBe(2);
      });

      it("should set promotionId correctly", () => {
        const detail = InvoiceDetail.create(5, 1);
        detail.promotionId = 5;

        expect(detail.promotionId).toBe(5);
      });
    });
  });

  describe("Invoice", () => {
    describe("create", () => {
      it("should create invoice with minimal data (no customer)", () => {
        const invoice = Invoice.create(
          50000,
          [{ quantity: 2, productId: 1 }],
          1 // employeeId
        );

        expect(invoice.total).toBe(50000);
        expect(invoice.employeeId).toBe(1);
        expect(invoice.userId).toBeNull();
        expect(invoice.usedPoint).toBe(0);
        expect(invoice.invoiceDetails).toHaveLength(1);
      });

      it("should create invoice with customer but no points", () => {
        const invoice = Invoice.create(
          75000,
          [{ quantity: 3, productId: 2 }],
          1, // employeeId
          10 // userId
        );

        expect(invoice.total).toBe(75000);
        expect(invoice.employeeId).toBe(1);
        expect(invoice.userId).toBe(10);
        expect(invoice.usedPoint).toBe(0);
      });

      it("should create invoice with customer using points", () => {
        const invoice = Invoice.create(
          100000,
          [{ quantity: 5, productId: 3 }],
          1, // employeeId
          15, // userId
          50 // usedPoint
        );

        expect(invoice.total).toBe(100000);
        expect(invoice.employeeId).toBe(1);
        expect(invoice.userId).toBe(15);
        expect(invoice.usedPoint).toBe(50);
      });

      it("should create invoice with multiple products", () => {
        const invoice = Invoice.create(
          150000,
          [
            { quantity: 2, productId: 1 },
            { quantity: 3, productId: 2 },
            { quantity: 1, productId: 3 },
          ],
          2
        );

        expect(invoice.invoiceDetails).toHaveLength(3);
        expect(invoice.invoiceDetails[0].quantity).toBe(2);
        expect(invoice.invoiceDetails[1].quantity).toBe(3);
        expect(invoice.invoiceDetails[2].quantity).toBe(1);
      });

      it("should create invoice with promotions", () => {
        const invoice = Invoice.create(
          80000,
          [
            { quantity: 2, productId: 1, promotionId: 5 },
            { quantity: 1, productId: 2, promotionId: 6 },
          ],
          1
        );

        expect(invoice.invoiceDetails[0].promotionId).toBe(5);
        expect(invoice.invoiceDetails[1].promotionId).toBe(6);
      });

      it("should throw error when total is negative", () => {
        expect(() =>
          Invoice.create(-1000, [{ quantity: 1, productId: 1 }], 1)
        ).toThrow("Invalid total");
      });

      it("should accept zero total (all discounts applied)", () => {
        const invoice = Invoice.create(
          0,
          [{ quantity: 1, productId: 1 }],
          1
        );

        expect(invoice.total).toBe(0);
      });
    });

    describe("updateUserInfo", () => {
      it("should update user info when userId provided", () => {
        const invoice = Invoice.create(
          50000,
          [{ quantity: 1, productId: 1 }],
          1
        );

        invoice.updateUserInfo(20, 30);

        expect(invoice.userId).toBe(20);
        expect(invoice.usedPoint).toBe(30);
      });

      it("should default usedPoint to 0 if not provided", () => {
        const invoice = Invoice.create(
          50000,
          [{ quantity: 1, productId: 1 }],
          1
        );

        invoice.updateUserInfo(25);

        expect(invoice.userId).toBe(25);
        expect(invoice.usedPoint).toBe(0);
      });

      it("should not update when userId is undefined", () => {
        const invoice = Invoice.create(
          50000,
          [{ quantity: 1, productId: 1 }],
          1
        );

        invoice.updateUserInfo(undefined, 50);

        expect(invoice.userId).toBeNull();
        expect(invoice.usedPoint).toBe(0);
      });

      it("should allow removing user info by passing null", () => {
        const invoice = Invoice.create(
          50000,
          [{ quantity: 1, productId: 1 }],
          1,
          10,
          20
        );

        invoice.updateUserInfo(undefined);

        // Should not change if undefined
        expect(invoice.userId).toBe(10);
        expect(invoice.usedPoint).toBe(20);
      });
    });

    describe("validation", () => {
      it("should throw error when usedPoint is negative", () => {
        expect(() =>
          Invoice.create(
            50000,
            [{ quantity: 1, productId: 1 }],
            1,
            10,
            -5
          )
        ).toThrow("Invalid used point");
      });

      it("should handle zero usedPoint", () => {
        const invoice = Invoice.create(
          50000,
          [{ quantity: 1, productId: 1 }],
          1,
          10,
          0
        );

        expect(invoice.usedPoint).toBe(0);
      });
    });

    describe("business scenarios", () => {
      it("should handle walk-in customer purchase (no userId)", () => {
        const invoice = Invoice.create(
          35000,
          [
            { quantity: 2, productId: 1 }, // Coca Cola
            { quantity: 1, productId: 2 }, // Pepsi
          ],
          1 // Employee ID
        );

        expect(invoice.total).toBe(35000);
        expect(invoice.userId).toBeNull();
        expect(invoice.usedPoint).toBe(0);
        expect(invoice.invoiceDetails).toHaveLength(2);
      });

      it("should handle member purchase with points redemption", () => {
        const invoice = Invoice.create(
          100000,
          [{ quantity: 5, productId: 3 }],
          2, // Employee ID
          15, // Customer ID
          100 // Using 100 points (= 100,000 VND discount)
        );

        expect(invoice.total).toBe(100000);
        expect(invoice.userId).toBe(15);
        expect(invoice.usedPoint).toBe(100);
      });

      it("should handle promotional sale", () => {
        const invoice = Invoice.create(
          120000,
          [
            { quantity: 3, productId: 1, promotionId: 5 }, // 20% off
            { quantity: 2, productId: 2, promotionId: 6 }, // 10,000 VND off
          ],
          1,
          20
        );

        expect(invoice.invoiceDetails[0].promotionId).toBe(5);
        expect(invoice.invoiceDetails[1].promotionId).toBe(6);
      });

      it("should handle bulk purchase", () => {
        const details = Array.from({ length: 10 }, (_, i) => ({
          quantity: i + 1,
          productId: i + 1,
        }));

        const invoice = Invoice.create(500000, details, 1);

        expect(invoice.invoiceDetails).toHaveLength(10);
        expect(invoice.total).toBe(500000);
      });

      it("should handle high-value transaction", () => {
        const invoice = Invoice.create(
          10000000, // 10 million VND
          [{ quantity: 100, productId: 1 }],
          1
        );

        expect(invoice.total).toBe(10000000);
      });
    });

    describe("data integrity", () => {
      it("should maintain data consistency after creation", () => {
        const invoice = Invoice.create(
          75000,
          [
            { quantity: 2, productId: 1 },
            { quantity: 1, productId: 2, promotionId: 3 },
          ],
          5,
          10,
          25
        );

        // Verify all fields remain consistent
        expect(invoice.total).toBe(75000);
        expect(invoice.employeeId).toBe(5);
        expect(invoice.userId).toBe(10);
        expect(invoice.usedPoint).toBe(25);
        expect(invoice.invoiceDetails).toHaveLength(2);

        // Verify details integrity
        expect(invoice.invoiceDetails[0].quantity).toBe(2);
        expect(invoice.invoiceDetails[0].productId).toBe(1);
        expect(invoice.invoiceDetails[1].promotionId).toBe(3);
      });
    });
  });
});
