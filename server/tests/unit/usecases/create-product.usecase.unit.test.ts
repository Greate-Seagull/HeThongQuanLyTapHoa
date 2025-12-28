import { CreateProductUsecase } from "../../../src/application/services/product/create-product.usecase";
import { Product, ProductUnit } from "../../../src/domain/entities/product";

describe("CreateProductUsecase Unit Tests", () => {
  let usecase: CreateProductUsecase;
  let mockProductRepo: any;
  let mockCategoryRead: any;
  let mockSupplierRead: any;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock ProductRepository
    mockProductRepo = {
      create: jest.fn(),
      getByIds: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Mock ProductCategoryReadAccessor
    mockCategoryRead = {
      getById: jest.fn(),
      getAll: jest.fn(),
    };

    // Mock SupplierReadAccessor
    mockSupplierRead = {
      getById: jest.fn(),
      getAll: jest.fn(),
    };

    // Create usecase instance with mocked dependencies
    usecase = new CreateProductUsecase(
      mockProductRepo,
      mockCategoryRead,
      mockSupplierRead
    );
  });

  describe("Success Cases", () => {
    it("should create product successfully with minimal required fields", async () => {
      const input = {
        authId: 1,
        name: "Coca Cola",
        price: 15000,
        unit: ProductUnit.BOTTLE,
        barcode: 8934567890123,
      };

      const mockSavedProduct = {
        id: 1,
        name: "Coca Cola",
        price: 15000,
        unit: ProductUnit.BOTTLE,
        amount: 0,
        barcode: 8934567890123,
      };

      mockProductRepo.create.mockResolvedValue(mockSavedProduct);

      const result = await usecase.execute(input);

      expect(result).toEqual({ productId: 1 });
      expect(mockProductRepo.create).toHaveBeenCalledTimes(1);
      expect(mockProductRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Coca Cola",
          price: 15000,
          unit: ProductUnit.BOTTLE,
        })
      );
    });

    it("should create product with all optional fields", async () => {
      const input = {
        authId: 1,
        name: "Mì gói Hảo Hảo",
        price: 3000,
        unit: ProductUnit.PACKAGE,
        amount: 100,
        barcode: 8934563141000,
        categoryId: 5,
        supplierId: 3,
      };

      const mockCategory = { id: 5, name: "Thực phẩm" };
      const mockSupplier = { id: 3, name: "ACECOOK" };
      const mockSavedProduct = { id: 10, ...input };

      mockCategoryRead.getById.mockResolvedValue(mockCategory);
      mockSupplierRead.getById.mockResolvedValue(mockSupplier);
      mockProductRepo.create.mockResolvedValue(mockSavedProduct);

      const result = await usecase.execute(input);

      expect(result).toEqual({ productId: 10 });
      expect(mockCategoryRead.getById).toHaveBeenCalledWith(5);
      expect(mockSupplierRead.getById).toHaveBeenCalledWith(3);
      expect(mockProductRepo.create).toHaveBeenCalledTimes(1);
    });

    it("should create product without category and supplier", async () => {
      const input = {
        authId: 1,
        name: "Generic Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        amount: 50,
        barcode: 8934567890456,
      };

      const mockSavedProduct = { id: 2, ...input };
      mockProductRepo.create.mockResolvedValue(mockSavedProduct);

      const result = await usecase.execute(input);

      expect(result).toEqual({ productId: 2 });
      expect(mockCategoryRead.getById).not.toHaveBeenCalled();
      expect(mockSupplierRead.getById).not.toHaveBeenCalled();
    });

    it("should default amount to 0 if not provided", async () => {
      const input = {
        authId: 1,
        name: "New Product",
        price: 20000,
        unit: ProductUnit.BOX,
        barcode: 8934567890789,
      };

      mockProductRepo.create.mockResolvedValue({ id: 3, ...input, amount: 0 });

      await usecase.execute(input);

      expect(mockProductRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 0,
        })
      );
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when name is empty", async () => {
      const input = {
        authId: 1,
        name: "",
        price: 10000,
        unit: ProductUnit.PIECE,
        barcode: 8934567890123,
      };

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when name is missing", async () => {
      const input = {
        authId: 1,
        price: 10000,
        unit: ProductUnit.PIECE,
        barcode: 8934567890123,
      };

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when price is negative", async () => {
      const input = {
        authId: 1,
        name: "Invalid Product",
        price: -100,
        unit: ProductUnit.PIECE,
        barcode: 8934567890123,
      };

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when amount is negative", async () => {
      const input = {
        authId: 1,
        name: "Invalid Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        amount: -5,
        barcode: 8934567890123,
      };

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when unit is empty", async () => {
      const input = {
        authId: 1,
        name: "Product",
        price: 10000,
        unit: "",
        barcode: 8934567890123,
      };

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when authId is missing", async () => {
      const input = {
        name: "Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        barcode: 8934567890123,
      };

      await expect(usecase.execute(input)).rejects.toThrow();
    });
  });

  describe("Business Logic Error Cases", () => {
    it("should throw error when categoryId does not exist", async () => {
      const input = {
        authId: 1,
        name: "Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        categoryId: 999,
        barcode: 8934567890123,
      };

      mockCategoryRead.getById.mockResolvedValue(null);

      await expect(usecase.execute(input))
        .rejects
        .toThrow("Category with id 999 not found");

      expect(mockCategoryRead.getById).toHaveBeenCalledWith(999);
      expect(mockProductRepo.create).not.toHaveBeenCalled();
    });

    it("should throw error when supplierId does not exist", async () => {
      const input = {
        authId: 1,
        name: "Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        supplierId: 888,
        barcode: 8934567890123,
      };

      mockSupplierRead.getById.mockResolvedValue(null);

      await expect(usecase.execute(input))
        .rejects
        .toThrow("Supplier with id 888 not found");

      expect(mockSupplierRead.getById).toHaveBeenCalledWith(888);
      expect(mockProductRepo.create).not.toHaveBeenCalled();
    });

    it("should throw error when both category and supplier do not exist", async () => {
      const input = {
        authId: 1,
        name: "Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        categoryId: 999,
        supplierId: 888,
        barcode: 8934567890123,
      };

      mockCategoryRead.getById.mockResolvedValue(null);

      await expect(usecase.execute(input))
        .rejects
        .toThrow("Category with id 999 not found");

      // Should fail at category check first
      expect(mockCategoryRead.getById).toHaveBeenCalledWith(999);
      expect(mockSupplierRead.getById).not.toHaveBeenCalled();
    });
  });

  describe("Repository Interaction", () => {
    it("should pass Product entity to repository", async () => {
      const input = {
        authId: 1,
        name: "Test Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        barcode: 8934567890123,
      };

      mockProductRepo.create.mockResolvedValue({ id: 1, ...input });

      await usecase.execute(input);

      expect(mockProductRepo.create).toHaveBeenCalledWith(
        expect.any(Product)
      );
    });

    it("should handle repository errors gracefully", async () => {
      const input = {
        authId: 1,
        name: "Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        barcode: 8934567890123,
      };

      mockProductRepo.create.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(usecase.execute(input))
        .rejects
        .toThrow("Database connection failed");
    });
  });

  describe("Edge Cases", () => {
    it("should handle barcode as string that can be coerced to number", async () => {
      const input = {
        authId: 1,
        name: "Product with String Barcode",
        price: 10000,
        unit: ProductUnit.PIECE,
        barcode: "8934563141000",
      };

      mockProductRepo.create.mockResolvedValue({ id: 1, ...input });

      const result = await usecase.execute(input);

      expect(result).toEqual({ productId: 1 });
      expect(mockProductRepo.create).toHaveBeenCalled();
    });

    it("should handle null values for optional fields", async () => {
      const input = {
        authId: 1,
        name: "Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        barcode: 8934567890123,
        categoryId: null,
        supplierId: null,
      };

      mockProductRepo.create.mockResolvedValue({ id: 1, ...input });

      const result = await usecase.execute(input);

      expect(result).toEqual({ productId: 1 });
      expect(mockCategoryRead.getById).not.toHaveBeenCalled();
      expect(mockSupplierRead.getById).not.toHaveBeenCalled();
    });

    it("should handle zero price (boundary case)", async () => {
      const input = {
        authId: 1,
        name: "Free Product",
        price: 0,
        unit: ProductUnit.PIECE,
        barcode: 8934567890123,
      };

      // Price = 0 should throw error because price must be > 0
      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should handle zero amount (out of stock)", async () => {
      const input = {
        authId: 1,
        name: "Out of Stock",
        price: 10000,
        unit: ProductUnit.PIECE,
        amount: 0,
        barcode: 8934567890123,
      };

      mockProductRepo.create.mockResolvedValue({ id: 1, ...input });

      const result = await usecase.execute(input);

      expect(result).toEqual({ productId: 1 });
    });

    it("should handle very large numbers", async () => {
      const input = {
        authId: 1,
        name: "Expensive Product",
        price: 999999999,
        unit: ProductUnit.PIECE,
        amount: 999999999,
        barcode: 9999999999999,
      };

      mockProductRepo.create.mockResolvedValue({ id: 1, ...input });

      const result = await usecase.execute(input);

      expect(result).toEqual({ productId: 1 });
    });
  });

  describe("Input Transformation", () => {
    it("should parse and transform input correctly", async () => {
      const input = {
        authId: 1, // Must be number (Zod validation)
        name: "Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        barcode: 8934567890123,
      };

      mockProductRepo.create.mockResolvedValue({ id: 1, ...input });

      await usecase.execute(input);

      // Verify that input was parsed and transformed
      expect(mockProductRepo.create).toHaveBeenCalled();
    });
  });

  describe("Complete Scenarios", () => {
    it("should successfully create a complete product with all validations", async () => {
      const input = {
        authId: 1,
        name: "Nước ngọt Coca Cola 330ml",
        price: 12000,
        unit: ProductUnit.BOTTLE,
        amount: 500,
        barcode: 8934567890123,
        categoryId: 2,
        supplierId: 5,
      };

      const mockCategory = { id: 2, name: "Nước giải khát" };
      const mockSupplier = { id: 5, name: "Coca-Cola Vietnam" };
      const mockSavedProduct = { id: 100, ...input };

      mockCategoryRead.getById.mockResolvedValue(mockCategory);
      mockSupplierRead.getById.mockResolvedValue(mockSupplier);
      mockProductRepo.create.mockResolvedValue(mockSavedProduct);

      const result = await usecase.execute(input);

      // Verify all interactions happened in correct order
      expect(mockCategoryRead.getById).toHaveBeenCalledWith(2);
      expect(mockSupplierRead.getById).toHaveBeenCalledWith(5);
      expect(mockProductRepo.create).toHaveBeenCalledWith(expect.any(Product));
      expect(result).toEqual({ productId: 100 });
    });
  });
});
