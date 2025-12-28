import { GetProductCategoriesUsecase } from "../../../src/application/services/product-category/get-product-categories.usecase";

describe("GetProductCategoriesUsecase Unit Tests", () => {
  let usecase: GetProductCategoriesUsecase;
  let mockCategoryReadAccess: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCategoryReadAccess = {
      getCategories: jest.fn(),
    };
    usecase = new GetProductCategoriesUsecase(mockCategoryReadAccess);
  });

  describe("Success Cases", () => {
    it("should get all product categories successfully", async () => {
      const mockCategories = [
        { id: 1, name: "Electronics" },
        { id: 2, name: "Food" },
      ];
      mockCategoryReadAccess.getCategories.mockResolvedValue(mockCategories);

      const result = await usecase.execute();

      expect(result.categories).toEqual(mockCategories);
      expect(mockCategoryReadAccess.getCategories).toHaveBeenCalled();
    });

    it("should return empty array when no categories", async () => {
      mockCategoryReadAccess.getCategories.mockResolvedValue([]);

      const result = await usecase.execute();

      expect(result.categories).toEqual([]);
    });

    it("should handle Vietnamese category names", async () => {
      const mockCategories = [{ id: 1, name: "Thực phẩm" }];
      mockCategoryReadAccess.getCategories.mockResolvedValue(mockCategories);

      const result = await usecase.execute();

      expect(result.categories[0].name).toBe("Thực phẩm");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      mockCategoryReadAccess.getCategories.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute()).rejects.toThrow("DB Error");
    });
  });
});
