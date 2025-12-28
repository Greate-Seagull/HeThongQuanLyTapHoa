import { DeleteProductCategoryUsecase } from "../../../src/application/services/product-category/delete-product-category.usecase";

describe("DeleteProductCategoryUsecase Unit Tests", () => {
  let usecase: DeleteProductCategoryUsecase;
  let mockCategoryRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCategoryRepo = {
      delete: jest.fn(),
    };
    usecase = new DeleteProductCategoryUsecase(mockCategoryRepo);
  });

  describe("Success Cases", () => {
    it("should delete product category successfully", async () => {
      const input = { id: 1 };
      mockCategoryRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute(input);

      expect(result.success).toBe(true);
      expect(mockCategoryRepo.delete).toHaveBeenCalledWith(1);
    });

    it("should delete category with large ID", async () => {
      const input = { id: 999999 };
      mockCategoryRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute(input);

      expect(result.success).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input = { id: 1 };
      mockCategoryRepo.delete.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });

    it("should handle category not found errors", async () => {
      const input = { id: 999 };
      mockCategoryRepo.delete.mockRejectedValue(new Error("Category not found"));

      await expect(usecase.execute(input)).rejects.toThrow("Category not found");
    });

    it("should handle foreign key constraint errors", async () => {
      const input = { id: 1 };
      mockCategoryRepo.delete.mockRejectedValue(new Error("Foreign key constraint"));

      await expect(usecase.execute(input)).rejects.toThrow("Foreign key constraint");
    });
  });
});
