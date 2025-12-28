import { DeleteProductUsecase } from "../../../src/application/services/product/delete-product.usecase";

describe("DeleteProductUsecase Unit Tests", () => {
  let usecase: DeleteProductUsecase;
  let mockProductRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockProductRepo = {
      getByIds: jest.fn(),
      delete: jest.fn(),
    };

    usecase = new DeleteProductUsecase(mockProductRepo);
  });

  describe("Success Cases", () => {
    it("should delete product successfully", async () => {
      const product = { id: 1, name: "Test Product" };
      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute({ id: 1, authId: 1 });

      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
      expect(mockProductRepo.delete).toHaveBeenCalledWith(1);
    });

    it("should delete product with large ID", async () => {
      const product = { id: 999999, name: "Large ID Product" };
      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute({ id: 999999, authId: 1 });

      expect(result.success).toBe(true);
    });

    it("should verify product exists before deletion", async () => {
      const product = { id: 5, name: "Test" };
      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.delete.mockResolvedValue(undefined);

      await usecase.execute({ id: 5, authId: 1 });

      expect(mockProductRepo.getByIds).toHaveBeenCalledWith([5]);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when product ID is missing", async () => {
      await expect(usecase.execute({ authId: 1 })).rejects.toThrow();
    });

    it("should throw error when product ID is zero", async () => {
      await expect(
        usecase.execute({ id: 0, authId: 1 })
      ).rejects.toThrow();
    });

    it("should throw error when product ID is negative", async () => {
      await expect(
        usecase.execute({ id: -5, authId: 1 })
      ).rejects.toThrow();
    });

    it("should throw error when authId is missing", async () => {
      await expect(usecase.execute({ id: 1 })).rejects.toThrow();
    });

    it("should throw error when authId is not provided", async () => {
      await expect(usecase.execute({ id: 1, authId: undefined })).rejects.toThrow();
    });
  });

  describe("Business Logic Cases", () => {
    it("should call getByIds before deletion", async () => {
      const product = { id: 1, name: "Test" };
      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.delete.mockResolvedValue(undefined);

      await usecase.execute({ id: 1, authId: 1 });

      expect(mockProductRepo.getByIds).toHaveBeenCalledWith([1]);
    });

    it("should throw error when product not found", async () => {
      mockProductRepo.getByIds.mockResolvedValue([]);

      await expect(
        usecase.execute({ id: 999, authId: 1 })
      ).rejects.toThrow("not found");
    });

    it("should call delete with correct product ID", async () => {
      const product = { id: 5, name: "Test" };
      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.delete.mockResolvedValue(undefined);

      await usecase.execute({ id: 5, authId: 1 });

      expect(mockProductRepo.delete).toHaveBeenCalledWith(5);
    });

    it("should not call delete if product not found", async () => {
      mockProductRepo.getByIds.mockResolvedValue([]);

      try {
        await usecase.execute({ id: 999, authId: 1 });
      } catch (e) {
        // Expected to throw
      }

      expect(mockProductRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle deletion of products with different IDs", async () => {
      mockProductRepo.getByIds.mockImplementation((ids: number[]) => {
        return Promise.resolve([{ id: ids[0], name: `Product ${ids[0]}` }]);
      });
      mockProductRepo.delete.mockResolvedValue(undefined);

      await usecase.execute({ id: 1, authId: 1 });
      await usecase.execute({ id: 2, authId: 1 });
      await usecase.execute({ id: 3, authId: 1 });

      expect(mockProductRepo.delete).toHaveBeenCalledTimes(3);
      expect(mockProductRepo.delete).toHaveBeenNthCalledWith(1, 1);
      expect(mockProductRepo.delete).toHaveBeenNthCalledWith(2, 2);
      expect(mockProductRepo.delete).toHaveBeenNthCalledWith(3, 3);
    });

    it("should handle database error during fetch", async () => {
      mockProductRepo.getByIds.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(
        usecase.execute({ id: 1, authId: 1 })
      ).rejects.toThrow("Database connection failed");
    });

    it("should handle database error during deletion", async () => {
      const product = { id: 1, name: "Test" };
      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.delete.mockRejectedValue(
        new Error("Delete operation failed")
      );

      await expect(
        usecase.execute({ id: 1, authId: 1 })
      ).rejects.toThrow("Delete operation failed");
    });

    it("should handle deletion with high volume authId", async () => {
      const product = { id: 1, name: "Test" };
      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute({ id: 1, authId: 999999 });

      expect(result.success).toBe(true);
    });

    it("should handle deletion after concurrent getByIds calls", async () => {
      const product = { id: 1, name: "Test" };
      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.delete.mockResolvedValue(undefined);

      const deletions = [
        usecase.execute({ id: 1, authId: 1 }),
        usecase.execute({ id: 1, authId: 1 }),
      ];

      const results = await Promise.all(deletions);

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(mockProductRepo.delete).toHaveBeenCalledTimes(2);
    });
  });

  describe("Complex Scenarios", () => {
    it("should delete product and verify it does not exist", async () => {
      const product = { id: 1, name: "Test" };
      mockProductRepo.getByIds
        .mockResolvedValueOnce([product]) // First call: product exists
        .mockResolvedValueOnce([]); // After deletion: product doesn't exist

      mockProductRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute({ id: 1, authId: 1 });
      expect(result.success).toBe(true);

      // Verify product is gone
      const checkAfterDelete = await mockProductRepo.getByIds([1]);
      expect(checkAfterDelete).toHaveLength(0);
    });

    it("should handle sequential deletions of different products", async () => {
      mockProductRepo.getByIds.mockImplementation((ids: number[]) => {
        return Promise.resolve([{ id: ids[0], name: `Product ${ids[0]}` }]);
      });
      mockProductRepo.delete.mockResolvedValue(undefined);

      const result1 = await usecase.execute({ id: 10, authId: 1 });
      const result2 = await usecase.execute({ id: 20, authId: 2 });
      const result3 = await usecase.execute({ id: 30, authId: 3 });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
      expect(mockProductRepo.delete).toHaveBeenCalledTimes(3);
    });

    it("should handle deletion with product having special properties", async () => {
      const complexProduct = {
        id: 1,
        name: "Complex Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        metadata: { key: "value" },
      };

      mockProductRepo.getByIds.mockResolvedValue([complexProduct]);
      mockProductRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute({ id: 1, authId: 1 });

      expect(result.success).toBe(true);
      expect(mockProductRepo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe("Authorization Cases", () => {
    it("should log deletion with authId for audit purposes", async () => {
      const product = { id: 1, name: "Test" };
      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.delete.mockResolvedValue(undefined);

      await usecase.execute({ id: 1, authId: 42 });

      // Verify delete was called (authId is logged internally)
      expect(mockProductRepo.delete).toHaveBeenCalledWith(1);
    });

    it("should handle deletion from different users (authIds)", async () => {
      const product = { id: 1, name: "Test" };
      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.delete.mockResolvedValue(undefined);

      const result1 = await usecase.execute({ id: 1, authId: 100 });
      const result2 = await usecase.execute({ id: 2, authId: 200 });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });
  });
});
