import { AdjustProductInventoryUsecase } from "../../../src/application/services/product/adjust-product-inventory.usecase";

describe("AdjustProductInventoryUsecase Unit Tests", () => {
  let usecase: AdjustProductInventoryUsecase;
  let mockProductRepo: any;

  beforeEach(() => {
    mockProductRepo = {
      getByIds: jest.fn(),
      update: jest.fn(),
    };

    usecase = new AdjustProductInventoryUsecase(mockProductRepo);
  });

  describe("Success Cases", () => {
    it("should adjust product inventory successfully", async () => {
      const mockProduct = {
        id: 1,
        amount: 50,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([mockProduct]);
      mockProductRepo.update.mockResolvedValue({
        ...mockProduct,
        amount: 100,
      });

      const result = await usecase.execute({
        productId: 1,
        authId: 1,
        newAmount: 100,
        reason: "Kiểm kê kho",
      });

      expect(mockProductRepo.getByIds).toHaveBeenCalledWith([1]);
      expect(mockProduct.update).toHaveBeenCalledWith({ amount: 100 });
      expect(mockProductRepo.update).toHaveBeenCalledWith(mockProduct);
      expect(result.productId).toBe(1);
      expect(result.oldAmount).toBe(50);
      expect(result.newAmount).toBe(100);
    });

    it("should adjust inventory to zero", async () => {
      const mockProduct = {
        id: 2,
        amount: 30,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([mockProduct]);
      mockProductRepo.update.mockResolvedValue({
        ...mockProduct,
        amount: 0,
      });

      const result = await usecase.execute({
        productId: 2,
        authId: 1,
        newAmount: 0,
      });

      expect(result.newAmount).toBe(0);
      expect(result.oldAmount).toBe(30);
    });

    it("should accept string productId and convert to number", async () => {
      const mockProduct = {
        id: 5,
        amount: 10,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([mockProduct]);
      mockProductRepo.update.mockResolvedValue(mockProduct);

      await usecase.execute({
        productId: "5",
        authId: 1,
        newAmount: 15,
      });

      expect(mockProductRepo.getByIds).toHaveBeenCalledWith([5]);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when product not found", async () => {
      mockProductRepo.getByIds.mockResolvedValue([]);

      await expect(
        usecase.execute({
          productId: 999,
          authId: 1,
          newAmount: 50,
        })
      ).rejects.toThrow("Product with id 999 not found");
    });

    it("should throw error for negative amount", async () => {
      await expect(
        usecase.execute({
          productId: 1,
          authId: 1,
          newAmount: -10,
        })
      ).rejects.toThrow();
    });

    it("should throw error for non-integer amount", async () => {
      await expect(
        usecase.execute({
          productId: 1,
          authId: 1,
          newAmount: 10.5,
        })
      ).rejects.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle large inventory adjustments", async () => {
      const mockProduct = {
        id: 1,
        amount: 100,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([mockProduct]);
      mockProductRepo.update.mockResolvedValue({
        ...mockProduct,
        amount: 999999,
      });

      const result = await usecase.execute({
        productId: 1,
        authId: 1,
        newAmount: 999999,
      });

      expect(result.newAmount).toBe(999999);
    });

    it("should handle adjustment with Vietnamese reason", async () => {
      const mockProduct = {
        id: 1,
        amount: 50,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([mockProduct]);
      mockProductRepo.update.mockResolvedValue(mockProduct);

      await usecase.execute({
        productId: 1,
        authId: 1,
        newAmount: 60,
        reason: "Điều chỉnh sau kiểm kê định kỳ",
      });

      expect(mockProduct.update).toHaveBeenCalled();
    });

    it("should handle adjustment without reason", async () => {
      const mockProduct = {
        id: 1,
        amount: 50,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([mockProduct]);
      mockProductRepo.update.mockResolvedValue(mockProduct);

      await usecase.execute({
        productId: 1,
        authId: 1,
        newAmount: 60,
      });

      expect(mockProductRepo.update).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors during product retrieval", async () => {
      mockProductRepo.getByIds.mockRejectedValue(
        new Error("Database connection error")
      );

      await expect(
        usecase.execute({
          productId: 1,
          authId: 1,
          newAmount: 50,
        })
      ).rejects.toThrow("Database connection error");
    });

    it("should handle errors during update", async () => {
      const mockProduct = {
        id: 1,
        amount: 50,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([mockProduct]);
      mockProductRepo.update.mockRejectedValue(new Error("Update failed"));

      await expect(
        usecase.execute({
          productId: 1,
          authId: 1,
          newAmount: 100,
        })
      ).rejects.toThrow("Update failed");
    });
  });
});
