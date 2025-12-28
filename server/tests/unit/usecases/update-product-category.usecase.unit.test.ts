import { UpdateProductCategoryUsecase } from "../../../src/application/services/product-category/update-product-category.usecase";

describe("UpdateProductCategoryUsecase Unit Tests", () => {
  let usecase: UpdateProductCategoryUsecase;
  let mockCategoryRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCategoryRepo = {
      update: jest.fn(),
    };
    usecase = new UpdateProductCategoryUsecase(mockCategoryRepo);
  });

  describe("Success Cases", () => {
    it("should update product category successfully", async () => {
      const input = { id: 1, name: "Updated Electronics" };
      const mockCategory = { id: 1, name: "Updated Electronics" };
      mockCategoryRepo.update.mockResolvedValue(mockCategory);

      const result = await usecase.execute(input);

      expect(result.category).toEqual(mockCategory);
      expect(mockCategoryRepo.update).toHaveBeenCalledWith(input);
    });

    it("should update category with Vietnamese name", async () => {
      const input = { id: 1, name: "Đồ gia dụng" };
      const mockCategory = { id: 1, name: "Đồ gia dụng" };
      mockCategoryRepo.update.mockResolvedValue(mockCategory);

      const result = await usecase.execute(input);

      expect(result.category.name).toBe("Đồ gia dụng");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input = { id: 1, name: "Updated" };
      mockCategoryRepo.update.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });

    it("should handle category not found errors", async () => {
      const input = { id: 999, name: "Updated" };
      mockCategoryRepo.update.mockRejectedValue(new Error("Category not found"));

      await expect(usecase.execute(input)).rejects.toThrow("Category not found");
    });
  });
});
