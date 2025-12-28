import { CreateProductCategoryUsecase } from "../../../src/application/services/product-category/create-product-category.usecase";

describe("CreateProductCategoryUsecase Unit Tests", () => {
  let usecase: CreateProductCategoryUsecase;
  let mockCategoryRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCategoryRepo = {
      create: jest.fn(),
    };
    usecase = new CreateProductCategoryUsecase(mockCategoryRepo);
  });

  describe("Success Cases", () => {
    it("should create product category successfully", async () => {
      const input = { name: "Electronics" };
      const mockCategory = { id: 1, name: "Electronics" };
      mockCategoryRepo.create.mockResolvedValue(mockCategory);

      const result = await usecase.execute(input);

      expect(result.category).toEqual(mockCategory);
      expect(mockCategoryRepo.create).toHaveBeenCalledWith(input);
    });

    it("should create category with Vietnamese name", async () => {
      const input = { name: "Đồ điện tử" };
      const mockCategory = { id: 2, name: "Đồ điện tử" };
      mockCategoryRepo.create.mockResolvedValue(mockCategory);

      const result = await usecase.execute(input);

      expect(result.category.name).toBe("Đồ điện tử");
    });

    it("should create category with long name", async () => {
      const longName = "A".repeat(100);
      const input = { name: longName };
      const mockCategory = { id: 3, name: longName };
      mockCategoryRepo.create.mockResolvedValue(mockCategory);

      const result = await usecase.execute(input);

      expect(result.category.name).toBe(longName);
    });
  });

  describe("Edge Cases", () => {
    it("should handle special characters in name", async () => {
      const input = { name: "Food & Beverage" };
      const mockCategory = { id: 4, name: "Food & Beverage" };
      mockCategoryRepo.create.mockResolvedValue(mockCategory);

      const result = await usecase.execute(input);

      expect(result.category.name).toBe("Food & Beverage");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input = { name: "Electronics" };
      mockCategoryRepo.create.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });

    it("should handle duplicate name errors", async () => {
      const input = { name: "Electronics" };
      mockCategoryRepo.create.mockRejectedValue(new Error("Duplicate name"));

      await expect(usecase.execute(input)).rejects.toThrow("Duplicate name");
    });
  });
});
