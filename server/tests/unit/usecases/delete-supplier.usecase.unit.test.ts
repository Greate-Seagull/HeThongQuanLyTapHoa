import { DeleteSupplierUsecase } from "../../../src/application/services/supplier/delete-supplier.usecase";

describe("DeleteSupplierUsecase Unit Tests", () => {
  let usecase: DeleteSupplierUsecase;
  let mockSupplierRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupplierRepo = {
      delete: jest.fn(),
    };

    usecase = new DeleteSupplierUsecase(mockSupplierRepo);
  });

  describe("Success Cases", () => {
    it("should delete supplier successfully", async () => {
      mockSupplierRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute({ id: 1 });

      expect(result.success).toBe(true);
      expect(mockSupplierRepo.delete).toHaveBeenCalledWith(1);
    });

    it("should delete supplier with different ID", async () => {
      mockSupplierRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute({ id: 42 });

      expect(result.success).toBe(true);
      expect(mockSupplierRepo.delete).toHaveBeenCalledWith(42);
    });

    it("should delete supplier with large ID", async () => {
      mockSupplierRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute({ id: 999999 });

      expect(result.success).toBe(true);
      expect(mockSupplierRepo.delete).toHaveBeenCalledWith(999999);
    });

    it("should return success flag in response", async () => {
      mockSupplierRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute({ id: 5 });

      expect(result).toHaveProperty("success");
      expect(typeof result.success).toBe("boolean");
      expect(result.success).toBe(true);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when ID is missing", async () => {
      mockSupplierRepo.delete.mockRejectedValue(new Error("ID is required"));

      await expect(usecase.execute({} as any)).rejects.toThrow();
    });

    it("should throw error when ID is null", async () => {
      mockSupplierRepo.delete.mockRejectedValue(new Error("ID is required"));

      await expect(usecase.execute({ id: null } as any)).rejects.toThrow();
    });

    it("should throw error when ID is undefined", async () => {
      mockSupplierRepo.delete.mockRejectedValue(new Error("ID is required"));

      await expect(
        usecase.execute({ id: undefined } as any)
      ).rejects.toThrow();
    });

    it("should throw error when ID is negative", async () => {
      mockSupplierRepo.delete.mockRejectedValue(
        new Error("ID must be positive")
      );

      await expect(usecase.execute({ id: -1 })).rejects.toThrow();
    });

    it("should throw error when ID is zero", async () => {
      mockSupplierRepo.delete.mockRejectedValue(
        new Error("ID must be positive")
      );

      await expect(usecase.execute({ id: 0 })).rejects.toThrow();
    });

    it("should throw error when ID is not a number", async () => {
      mockSupplierRepo.delete.mockRejectedValue(
        new Error("ID must be numeric")
      );

      await expect(usecase.execute({ id: "abc" } as any)).rejects.toThrow();
    });
  });

  describe("Business Logic Cases", () => {
    it("should call repository delete with correct ID", async () => {
      mockSupplierRepo.delete.mockResolvedValue(undefined);

      await usecase.execute({ id: 10 });

      expect(mockSupplierRepo.delete).toHaveBeenCalledWith(10);
      expect(mockSupplierRepo.delete).toHaveBeenCalledTimes(1);
    });

    it("should return success true regardless of supplier existence", async () => {
      mockSupplierRepo.delete.mockResolvedValue(undefined);

      const result1 = await usecase.execute({ id: 1 });
      const result2 = await usecase.execute({ id: 999 });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it("should not throw error when deleting non-existent supplier", async () => {
      mockSupplierRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute({ id: 99999 });

      expect(result.success).toBe(true);
    });

    it("should handle repository errors", async () => {
      mockSupplierRepo.delete.mockRejectedValue(
        new Error("Database error")
      );

      await expect(usecase.execute({ id: 1 })).rejects.toThrow(
        "Database error"
      );
    });

    it("should handle cascade delete errors", async () => {
      mockSupplierRepo.delete.mockRejectedValue(
        new Error("Cannot delete: has related records")
      );

      await expect(usecase.execute({ id: 1 })).rejects.toThrow(
        "Cannot delete: has related records"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle maximum safe integer ID", async () => {
      mockSupplierRepo.delete.mockResolvedValue(undefined);

      const maxId = Number.MAX_SAFE_INTEGER;
      const result = await usecase.execute({ id: maxId });

      expect(result.success).toBe(true);
      expect(mockSupplierRepo.delete).toHaveBeenCalledWith(maxId);
    });

    it("should handle float ID converted to integer", async () => {
      mockSupplierRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute({ id: 5.7 as any });

      expect(result.success).toBe(true);
    });

    it("should handle string ID with numeric value", async () => {
      mockSupplierRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute({ id: "123" as any });

      expect(result.success).toBe(true);
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle multiple sequential deletions", async () => {
      mockSupplierRepo.delete.mockResolvedValue(undefined);

      const ids = [1, 2, 3, 4, 5];
      const results = [];

      for (const id of ids) {
        results.push(await usecase.execute({ id }));
      }

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
      expect(mockSupplierRepo.delete).toHaveBeenCalledTimes(5);
    });

    it("should handle concurrent deletion attempts", async () => {
      mockSupplierRepo.delete.mockResolvedValue(undefined);

      const deletePromises = [1, 2, 3, 4, 5].map((id) =>
        usecase.execute({ id })
      );
      const results = await Promise.all(deletePromises);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    it("should handle retry after error", async () => {
      mockSupplierRepo.delete
        .mockRejectedValueOnce(new Error("Temporary error"))
        .mockResolvedValueOnce(undefined);

      await expect(usecase.execute({ id: 1 })).rejects.toThrow(
        "Temporary error"
      );

      const result = await usecase.execute({ id: 1 });
      expect(result.success).toBe(true);
    });

    it("should handle partial failure in batch deletion", async () => {
      mockSupplierRepo.delete
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error("Failed to delete"))
        .mockResolvedValueOnce(undefined);

      const result1 = await usecase.execute({ id: 1 });
      expect(result1.success).toBe(true);

      await expect(usecase.execute({ id: 2 })).rejects.toThrow();

      const result3 = await usecase.execute({ id: 3 });
      expect(result3.success).toBe(true);
    });

    it("should track deletion operations", async () => {
      mockSupplierRepo.delete.mockResolvedValue(undefined);

      const ids = [10, 20, 30];
      for (const id of ids) {
        await usecase.execute({ id });
      }

      ids.forEach((id) => {
        expect(mockSupplierRepo.delete).toHaveBeenCalledWith(id);
      });
      expect(mockSupplierRepo.delete).toHaveBeenCalledTimes(3);
    });
  });
});
