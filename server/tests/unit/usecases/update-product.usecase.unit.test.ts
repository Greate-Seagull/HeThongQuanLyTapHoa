import { UpdateProductUsecase } from "../../../src/application/services/product/update-product.usecase";

describe("UpdateProductUsecase Unit Tests", () => {
  let usecase: UpdateProductUsecase;
  let mockProductRepo: any;
  let mockCategoryRead: any;
  let mockSupplierRead: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockProductRepo = {
      getByIds: jest.fn(),
      update: jest.fn(),
    };

    mockCategoryRead = {
      getById: jest.fn(),
    };

    mockSupplierRead = {
      getById: jest.fn(),
    };

    usecase = new UpdateProductUsecase(
      mockProductRepo,
      mockCategoryRead,
      mockSupplierRead
    );
  });

  describe("Success Cases", () => {
    it("should update product name successfully", async () => {
      const product = {
        id: 1,
        name: "Old Name",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockResolvedValue({
        id: 1,
        name: "New Name",
      });

      const result = await usecase.execute({
        id: 1,
        authId: 1,
        name: "New Name",
      });

      expect(result).toHaveProperty("productId");
      expect(result.productId).toBe(1);
      expect(product.update).toHaveBeenCalled();
    });

    it("should update product price successfully", async () => {
      const product = {
        id: 2,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockResolvedValue({ id: 2, price: 75000 });

      const result = await usecase.execute({
        id: 2,
        authId: 1,
        price: 75000,
      });

      expect(result.productId).toBe(2);
      expect(product.update).toHaveBeenCalled();
    });

    it("should update product unit successfully", async () => {
      const product = {
        id: 3,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockResolvedValue({ id: 3, unit: "bottle" });

      const result = await usecase.execute({
        id: 3,
        authId: 1,
        unit: "bottle",
      });

      expect(result.productId).toBe(3);
    });

    it("should update product amount successfully", async () => {
      const product = {
        id: 4,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockResolvedValue({ id: 4, amount: 200 });

      const result = await usecase.execute({
        id: 4,
        authId: 1,
        amount: 200,
      });

      expect(result.productId).toBe(4);
    });

    it("should update product barcode successfully", async () => {
      const product = {
        id: 5,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockResolvedValue({ id: 5, barcode: 99999 });

      const result = await usecase.execute({
        id: 5,
        authId: 1,
        barcode: 99999,
      });

      expect(result.productId).toBe(5);
    });

    it("should update product category successfully", async () => {
      const product = {
        id: 6,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockCategoryRead.getById.mockResolvedValue({ id: 2, name: "New Category" });
      mockProductRepo.update.mockResolvedValue({ id: 6, categoryId: 2 });

      const result = await usecase.execute({
        id: 6,
        authId: 1,
        categoryId: 2,
      });

      expect(result.productId).toBe(6);
    });

    it("should update product supplier successfully", async () => {
      const product = {
        id: 7,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockSupplierRead.getById.mockResolvedValue({ id: 2, name: "New Supplier" });
      mockProductRepo.update.mockResolvedValue({ id: 7, supplierId: 2 });

      const result = await usecase.execute({
        id: 7,
        authId: 1,
        supplierId: 2,
      });

      expect(result.productId).toBe(7);
    });

    it("should update multiple fields at once", async () => {
      const product = {
        id: 8,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockCategoryRead.getById.mockResolvedValue({ id: 2, name: "New Category" });
      mockSupplierRead.getById.mockResolvedValue({ id: 2, name: "New Supplier" });
      mockProductRepo.update.mockResolvedValue({
        id: 8,
        name: "Updated",
        price: 75000,
        amount: 150,
      });

      const result = await usecase.execute({
        id: 8,
        authId: 1,
        name: "Updated",
        price: 75000,
        amount: 150,
        categoryId: 2,
        supplierId: 2,
      });

      expect(result.productId).toBe(8);
      expect(product.update).toHaveBeenCalled();
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when product ID is missing", async () => {
      await expect(usecase.execute({ authId: 1, name: "New" })).rejects.toThrow();
    });

    it("should throw error when product ID is zero", async () => {
      await expect(
        usecase.execute({ id: 0, authId: 1, name: "New" })
      ).rejects.toThrow();
    });

    it("should throw error when product ID is negative", async () => {
      await expect(
        usecase.execute({ id: -5, authId: 1, name: "New" })
      ).rejects.toThrow();
    });

    it("should throw error when authId is missing", async () => {
      await expect(usecase.execute({ id: 1, name: "New" })).rejects.toThrow();
    });

    it("should throw error when authId is not a number", async () => {
      await expect(
        usecase.execute({ id: 1, authId: "invalid", name: "New" })
      ).rejects.toThrow();
    });

    it("should throw error when price is negative", async () => {
      await expect(
        usecase.execute({ id: 1, authId: 1, price: -100 })
      ).rejects.toThrow();
    });

    it("should throw error when amount is negative", async () => {
      await expect(
        usecase.execute({ id: 1, authId: 1, amount: -50 })
      ).rejects.toThrow();
    });

    it("should throw error when amount is not an integer", async () => {
      await expect(
        usecase.execute({ id: 1, authId: 1, amount: 5.5 })
      ).rejects.toThrow();
    });
  });

  describe("Business Logic Cases", () => {
    it("should fetch product before updating", async () => {
      const product = {
        id: 1,
        name: "Old",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockResolvedValue({ id: 1 });

      await usecase.execute({ id: 1, authId: 1, name: "New" });

      expect(mockProductRepo.getByIds).toHaveBeenCalledWith([1]);
    });

    it("should throw error when product not found", async () => {
      mockProductRepo.getByIds.mockResolvedValue([]);

      await expect(
        usecase.execute({ id: 999, authId: 1, name: "New" })
      ).rejects.toThrow("not found");
    });

    it("should verify category exists before updating", async () => {
      const product = {
        id: 1,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockCategoryRead.getById.mockResolvedValue(null);

      await expect(
        usecase.execute({ id: 1, authId: 1, categoryId: 999 })
      ).rejects.toThrow("not found");
    });

    it("should verify supplier exists before updating", async () => {
      const product = {
        id: 1,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockSupplierRead.getById.mockResolvedValue(null);

      await expect(
        usecase.execute({ id: 1, authId: 1, supplierId: 999 })
      ).rejects.toThrow("not found");
    });

    it("should call repository update method", async () => {
      const product = {
        id: 1,
        name: "Old",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockResolvedValue({ id: 1 });

      await usecase.execute({ id: 1, authId: 1, name: "New" });

      expect(mockProductRepo.update).toHaveBeenCalled();
    });

    it("should not verify category if categoryId not provided", async () => {
      const product = {
        id: 1,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockResolvedValue({ id: 1 });

      await usecase.execute({ id: 1, authId: 1, name: "Updated" });

      expect(mockCategoryRead.getById).not.toHaveBeenCalled();
    });

    it("should not verify supplier if supplierId not provided", async () => {
      const product = {
        id: 1,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockResolvedValue({ id: 1 });

      await usecase.execute({ id: 1, authId: 1, price: 75000 });

      expect(mockSupplierRead.getById).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large product ID", async () => {
      const product = {
        id: 999999,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockResolvedValue({ id: 999999 });

      const result = await usecase.execute({
        id: 999999,
        authId: 1,
        price: 75000,
      });

      expect(result.productId).toBe(999999);
    });

    it("should handle Vietnamese product name", async () => {
      const product = {
        id: 1,
        name: "Sữa tươi Việt",
        price: 50000,
        unit: "hộp",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockResolvedValue({
        id: 1,
        name: "Sữa tươi Việt mới",
      });

      const result = await usecase.execute({
        id: 1,
        authId: 1,
        name: "Sữa tươi Việt mới",
      });

      expect(result.productId).toBe(1);
    });

    it("should handle price of zero", async () => {
      const product = {
        id: 1,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockResolvedValue({ id: 1, price: 0 });

      const result = await usecase.execute({ id: 1, authId: 1, price: 0 });

      expect(result.productId).toBe(1);
    });

    it("should handle very high prices", async () => {
      const product = {
        id: 1,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockResolvedValue({
        id: 1,
        price: 999999999,
      });

      const result = await usecase.execute({
        id: 1,
        authId: 1,
        price: 999999999,
      });

      expect(result.productId).toBe(1);
    });

    it("should handle amount of zero", async () => {
      const product = {
        id: 1,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockResolvedValue({ id: 1, amount: 0 });

      const result = await usecase.execute({ id: 1, authId: 1, amount: 0 });

      expect(result.productId).toBe(1);
    });

    it("should handle very large amounts", async () => {
      const product = {
        id: 1,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockResolvedValue({ id: 1, amount: 1000000 });

      const result = await usecase.execute({
        id: 1,
        authId: 1,
        amount: 1000000,
      });

      expect(result.productId).toBe(1);
    });

    it("should handle null barcode", async () => {
      const product = {
        id: 1,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockResolvedValue({ id: 1, barcode: null });

      const result = await usecase.execute({ id: 1, authId: 1, barcode: null });

      expect(result.productId).toBe(1);
    });

    it("should handle null categoryId", async () => {
      const product = {
        id: 1,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockResolvedValue({ id: 1, categoryId: null });

      const result = await usecase.execute({
        id: 1,
        authId: 1,
        categoryId: null,
      });

      expect(result.productId).toBe(1);
    });

    it("should handle null supplierId", async () => {
      const product = {
        id: 1,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockResolvedValue({ id: 1, supplierId: null });

      const result = await usecase.execute({
        id: 1,
        authId: 1,
        supplierId: null,
      });

      expect(result.productId).toBe(1);
    });

    it("should handle database error during fetch", async () => {
      mockProductRepo.getByIds.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        usecase.execute({ id: 1, authId: 1, price: 75000 })
      ).rejects.toThrow();
    });

    it("should handle database error during update", async () => {
      const product = {
        id: 1,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockRejectedValue(new Error("Update failed"));

      await expect(
        usecase.execute({ id: 1, authId: 1, price: 75000 })
      ).rejects.toThrow();
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle updating product with category and supplier change", async () => {
      const product = {
        id: 1,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockCategoryRead.getById.mockResolvedValue({ id: 2, name: "Category 2" });
      mockSupplierRead.getById.mockResolvedValue({
        id: 2,
        name: "Supplier 2",
      });
      mockProductRepo.update.mockResolvedValue({
        id: 1,
        categoryId: 2,
        supplierId: 2,
      });

      const result = await usecase.execute({
        id: 1,
        authId: 1,
        categoryId: 2,
        supplierId: 2,
      });

      expect(result.productId).toBe(1);
    });

    it("should handle updating all fields of a product", async () => {
      const product = {
        id: 1,
        name: "Old",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockCategoryRead.getById.mockResolvedValue({ id: 2 });
      mockSupplierRead.getById.mockResolvedValue({ id: 2 });
      mockProductRepo.update.mockResolvedValue({
        id: 1,
        name: "Updated",
        price: 75000,
        unit: "bottle",
        amount: 200,
        barcode: 99999,
        categoryId: 2,
        supplierId: 2,
      });

      const result = await usecase.execute({
        id: 1,
        authId: 1,
        name: "Updated",
        price: 75000,
        unit: "bottle",
        amount: 200,
        barcode: 99999,
        categoryId: 2,
        supplierId: 2,
      });

      expect(result.productId).toBe(1);
      expect(product.update).toHaveBeenCalled();
    });

    it("should handle sequential updates to same product", async () => {
      const product = {
        id: 1,
        name: "Product",
        price: 50000,
        unit: "box",
        amount: 100,
        barcode: 12345,
        categoryId: 1,
        supplierId: 1,
        update: jest.fn(),
      };

      mockProductRepo.getByIds.mockResolvedValue([product]);
      mockProductRepo.update.mockResolvedValue({ id: 1 });

      const update1 = await usecase.execute({
        id: 1,
        authId: 1,
        name: "Update1",
      });

      mockProductRepo.getByIds.mockResolvedValue([
        { ...product, name: "Update1" },
      ]);

      const update2 = await usecase.execute({
        id: 1,
        authId: 1,
        price: 75000,
      });

      expect(update1.productId).toBe(1);
      expect(update2.productId).toBe(1);
    });
  });
});
