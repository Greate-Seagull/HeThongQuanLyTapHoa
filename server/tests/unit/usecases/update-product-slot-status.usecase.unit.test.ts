import { UpdateProductStatusUsecase } from "../../../src/application/services/product/update-product-slot-status.usecase";
import { ProductStatus } from "../../../src/generated/client";

describe("UpdateProductStatusUsecase Unit Tests", () => {
  let usecase: UpdateProductStatusUsecase;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      product: {
        update: jest.fn(),
      },
    };

    usecase = new UpdateProductStatusUsecase(mockPrisma);
  });

  describe("Success Cases", () => {
    it("should update product status to GOOD", async () => {
      mockPrisma.product.update.mockResolvedValue({ id: 1 });

      const result = await usecase.execute({
        productId: 1,
        status: ProductStatus.GOOD,
      });

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: ProductStatus.GOOD },
      });
      expect(result.success).toBe(true);
    });

    it("should update product status to EXPIRED", async () => {
      mockPrisma.product.update.mockResolvedValue({ id: 2 });

      await usecase.execute({
        productId: 2,
        status: ProductStatus.EXPIRED,
      });

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { status: ProductStatus.EXPIRED },
      });
    });

    it("should accept string productId and convert to number", async () => {
      mockPrisma.product.update.mockResolvedValue({ id: 5 });

      await usecase.execute({
        productId: "5",
        status: ProductStatus.GOOD,
      });

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { status: ProductStatus.GOOD },
      });
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error for invalid status", async () => {
      await expect(
        usecase.execute({
          productId: 1,
          status: "INVALID_STATUS",
        })
      ).rejects.toThrow();
    });

    it("should throw error for missing productId", async () => {
      await expect(
        usecase.execute({
          status: ProductStatus.GOOD,
        })
      ).rejects.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      mockPrisma.product.update.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        usecase.execute({
          productId: 1,
          status: ProductStatus.GOOD,
        })
      ).rejects.toThrow("Database error");
    });

    it("should handle product not found", async () => {
      mockPrisma.product.update.mockRejectedValue(
        new Error("Record not found")
      );

      await expect(
        usecase.execute({
          productId: 999,
          status: ProductStatus.GOOD,
        })
      ).rejects.toThrow("Record not found");
    });
  });
});
