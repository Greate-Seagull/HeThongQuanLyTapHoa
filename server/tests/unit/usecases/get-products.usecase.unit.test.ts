import { GetProductsUsecase } from "../../../src/application/services/product/get-products.usecase";

describe("GetProductsUsecase Unit Tests", () => {
  let usecase: GetProductsUsecase;
  let mockProductReadAccess: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockProductReadAccess = {
      getProducts: jest.fn(),
    };

    usecase = new GetProductsUsecase(mockProductReadAccess);
  });

  describe("Success Cases", () => {
    it("should get all products successfully", async () => {
      const products = [
        {
          id: 1,
          name: "Product 1",
          price: 10000,
          unit: "box",
          amount: 100,
          barcode: 12345,
          categoryId: 1,
          supplierId: 1,
          category: { id: 1, name: "Category 1" },
          supplier: { id: 1, name: "Supplier 1" },
        },
      ];

      mockProductReadAccess.getProducts.mockResolvedValue(products);

      const result = await usecase.execute({});

      expect(result).toHaveProperty("products");
      expect(result.products).toHaveLength(1);
      expect(result.products[0].id).toBe(1);
    });

    it("should return empty products array when no products exist", async () => {
      mockProductReadAccess.getProducts.mockResolvedValue([]);

      const result = await usecase.execute({});

      expect(result.products).toHaveLength(0);
    });

    it("should include all product properties in result", async () => {
      const products = [
        {
          id: 1,
          name: "Full Product",
          price: 50000,
          unit: "box",
          amount: 100,
          barcode: 99999,
          categoryId: 1,
          supplierId: 1,
          category: { id: 1, name: "Cat" },
          supplier: { id: 1, name: "Supp" },
        },
      ];

      mockProductReadAccess.getProducts.mockResolvedValue(products);

      const result = await usecase.execute({});

      const product = result.products[0];
      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("price");
      expect(product).toHaveProperty("unit");
      expect(product).toHaveProperty("amount");
      expect(product).toHaveProperty("barcode");
      expect(product).toHaveProperty("categoryId");
      expect(product).toHaveProperty("supplierId");
    });

    it("should return multiple products when they exist", async () => {
      const products = [
        {
          id: 1,
          name: "P1",
          price: 10000,
          unit: "box",
          amount: 100,
          barcode: 1,
          categoryId: 1,
          supplierId: 1,
          category: { id: 1, name: "C1" },
          supplier: { id: 1, name: "S1" },
        },
        {
          id: 2,
          name: "P2",
          price: 20000,
          unit: "bottle",
          amount: 200,
          barcode: 2,
          categoryId: 2,
          supplierId: 2,
          category: { id: 2, name: "C2" },
          supplier: { id: 2, name: "S2" },
        },
      ];

      mockProductReadAccess.getProducts.mockResolvedValue(products);

      const result = await usecase.execute({});

      expect(result.products).toHaveLength(2);
      expect(result.products[0].name).toBe("P1");
      expect(result.products[1].name).toBe("P2");
    });

    it("should return products with different units", async () => {
      const products = [
        {
          id: 1,
          name: "Milk",
          price: 30000,
          unit: "liter",
          amount: 50,
          barcode: 111,
          categoryId: 1,
          supplierId: 1,
          category: { id: 1, name: "Dairy" },
          supplier: { id: 1, name: "Farm" },
        },
        {
          id: 2,
          name: "Bread",
          price: 25000,
          unit: "piece",
          amount: 100,
          barcode: 222,
          categoryId: 2,
          supplierId: 2,
          category: { id: 2, name: "Bakery" },
          supplier: { id: 2, name: "Bakery Co" },
        },
      ];

      mockProductReadAccess.getProducts.mockResolvedValue(products);

      const result = await usecase.execute({});

      expect(result.products[0].unit).toBe("liter");
      expect(result.products[1].unit).toBe("piece");
    });
  });

  describe("Validation Error Cases", () => {
    it("should handle input parameter gracefully", async () => {
      mockProductReadAccess.getProducts.mockResolvedValue([]);

      const result = await usecase.execute({ unused: "param" });

      expect(result).toHaveProperty("products");
    });

    it("should not fail with null input", async () => {
      mockProductReadAccess.getProducts.mockResolvedValue([]);

      const result = await usecase.execute(null);

      expect(result).toHaveProperty("products");
    });

    it("should not fail with undefined input", async () => {
      mockProductReadAccess.getProducts.mockResolvedValue([]);

      const result = await usecase.execute(undefined);

      expect(result).toHaveProperty("products");
    });
  });

  describe("Business Logic Cases", () => {
    it("should call getProducts from read accessor", async () => {
      mockProductReadAccess.getProducts.mockResolvedValue([]);

      await usecase.execute({});

      expect(mockProductReadAccess.getProducts).toHaveBeenCalled();
    });

    it("should wrap products in response object", async () => {
      const products = [
        {
          id: 1,
          name: "Test",
          price: 10000,
          unit: "box",
          amount: 50,
          barcode: 123,
          categoryId: 1,
          supplierId: 1,
          category: { id: 1, name: "Cat" },
          supplier: { id: 1, name: "Supp" },
        },
      ];

      mockProductReadAccess.getProducts.mockResolvedValue(products);

      const result = await usecase.execute({});

      expect(result).toHaveProperty("products");
      expect(Array.isArray(result.products)).toBe(true);
    });

    it("should call getProducts only once per execute", async () => {
      mockProductReadAccess.getProducts.mockResolvedValue([]);

      await usecase.execute({});

      expect(mockProductReadAccess.getProducts).toHaveBeenCalledTimes(1);
    });

    it("should include category information for each product", async () => {
      const products = [
        {
          id: 1,
          name: "Test",
          price: 10000,
          unit: "box",
          amount: 50,
          barcode: 123,
          categoryId: 5,
          supplierId: 1,
          category: { id: 5, name: "Electronics" },
          supplier: { id: 1, name: "Supp" },
        },
      ];

      mockProductReadAccess.getProducts.mockResolvedValue(products);

      const result = await usecase.execute({});

      expect(result.products[0].category).toBeDefined();
      expect(result.products[0].category.name).toBe("Electronics");
    });

    it("should include supplier information for each product", async () => {
      const products = [
        {
          id: 1,
          name: "Test",
          price: 10000,
          unit: "box",
          amount: 50,
          barcode: 123,
          categoryId: 1,
          supplierId: 3,
          category: { id: 1, name: "Cat" },
          supplier: { id: 3, name: "Major Supplier" },
        },
      ];

      mockProductReadAccess.getProducts.mockResolvedValue(products);

      const result = await usecase.execute({});

      expect(result.products[0].supplier).toBeDefined();
      expect(result.products[0].supplier.name).toBe("Major Supplier");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large number of products (1000+)", async () => {
      const products = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Product ${i}`,
        price: 10000 + i * 100,
        unit: "box",
        amount: 100,
        barcode: 1000 + i,
        categoryId: (i % 10) + 1,
        supplierId: (i % 5) + 1,
        category: { id: (i % 10) + 1, name: `Cat ${i % 10}` },
        supplier: { id: (i % 5) + 1, name: `Supp ${i % 5}` },
      }));

      mockProductReadAccess.getProducts.mockResolvedValue(products);

      const result = await usecase.execute({});

      expect(result.products).toHaveLength(1000);
    });

    it("should handle products with Vietnamese names", async () => {
      const products = [
        {
          id: 1,
          name: "Sữa tươi Việt",
          price: 30000,
          unit: "hộp",
          amount: 100,
          barcode: 111,
          categoryId: 1,
          supplierId: 1,
          category: { id: 1, name: "Sữa" },
          supplier: { id: 1, name: "Công ty sữa Việt" },
        },
        {
          id: 2,
          name: "Bánh mì Pháp",
          price: 25000,
          unit: "cái",
          amount: 50,
          barcode: 222,
          categoryId: 2,
          supplierId: 2,
          category: { id: 2, name: "Bánh" },
          supplier: { id: 2, name: "Tiệm bánh ngoại" },
        },
      ];

      mockProductReadAccess.getProducts.mockResolvedValue(products);

      const result = await usecase.execute({});

      expect(result.products[0].name).toBe("Sữa tươi Việt");
      expect(result.products[1].name).toBe("Bánh mì Pháp");
    });

    it("should handle products with special characters in name", async () => {
      const products = [
        {
          id: 1,
          name: "Product @#$% & Special!",
          price: 10000,
          unit: "box",
          amount: 50,
          barcode: 123,
          categoryId: 1,
          supplierId: 1,
          category: { id: 1, name: "Cat" },
          supplier: { id: 1, name: "Supp" },
        },
      ];

      mockProductReadAccess.getProducts.mockResolvedValue(products);

      const result = await usecase.execute({});

      expect(result.products[0].name).toContain("@");
      expect(result.products[0].name).toContain("&");
    });

    it("should handle products with zero price", async () => {
      const products = [
        {
          id: 1,
          name: "Free Product",
          price: 0,
          unit: "box",
          amount: 1000,
          barcode: 123,
          categoryId: 1,
          supplierId: 1,
          category: { id: 1, name: "Cat" },
          supplier: { id: 1, name: "Supp" },
        },
      ];

      mockProductReadAccess.getProducts.mockResolvedValue(products);

      const result = await usecase.execute({});

      expect(result.products[0].price).toBe(0);
    });

    it("should handle products with very high prices", async () => {
      const products = [
        {
          id: 1,
          name: "Luxury Item",
          price: 999999999,
          unit: "box",
          amount: 1,
          barcode: 999,
          categoryId: 1,
          supplierId: 1,
          category: { id: 1, name: "Luxury" },
          supplier: { id: 1, name: "Premium" },
        },
      ];

      mockProductReadAccess.getProducts.mockResolvedValue(products);

      const result = await usecase.execute({});

      expect(result.products[0].price).toBe(999999999);
    });

    it("should handle database read failure", async () => {
      mockProductReadAccess.getProducts.mockRejectedValue(
        new Error("Database error")
      );

      await expect(usecase.execute({})).rejects.toThrow("Database error");
    });

    it("should handle timeout error from database", async () => {
      mockProductReadAccess.getProducts.mockRejectedValue(
        new Error("Query timeout")
      );

      await expect(usecase.execute({})).rejects.toThrow("Query timeout");
    });
  });

  describe("Complex Scenarios", () => {
    it("should retrieve mixed products with different categories and suppliers", async () => {
      const products = [
        {
          id: 1,
          name: "Electronics",
          price: 500000,
          unit: "piece",
          amount: 20,
          barcode: 1001,
          categoryId: 1,
          supplierId: 1,
          category: { id: 1, name: "Electronics" },
          supplier: { id: 1, name: "Tech Corp" },
        },
        {
          id: 2,
          name: "Food",
          price: 15000,
          unit: "box",
          amount: 500,
          barcode: 1002,
          categoryId: 2,
          supplierId: 2,
          category: { id: 2, name: "Food" },
          supplier: { id: 2, name: "Food Inc" },
        },
        {
          id: 3,
          name: "Clothing",
          price: 250000,
          unit: "piece",
          amount: 100,
          barcode: 1003,
          categoryId: 3,
          supplierId: 3,
          category: { id: 3, name: "Clothing" },
          supplier: { id: 3, name: "Fashion Co" },
        },
      ];

      mockProductReadAccess.getProducts.mockResolvedValue(products);

      const result = await usecase.execute({});

      expect(result.products).toHaveLength(3);
      expect(result.products[0].category.name).toBe("Electronics");
      expect(result.products[1].supplier.name).toBe("Food Inc");
      expect(result.products[2].unit).toBe("piece");
    });

    it("should handle multiple concurrent requests", async () => {
      const products = [
        {
          id: 1,
          name: "Product",
          price: 10000,
          unit: "box",
          amount: 100,
          barcode: 123,
          categoryId: 1,
          supplierId: 1,
          category: { id: 1, name: "Cat" },
          supplier: { id: 1, name: "Supp" },
        },
      ];

      mockProductReadAccess.getProducts.mockResolvedValue(products);

      const requests = [
        usecase.execute({}),
        usecase.execute({}),
        usecase.execute({}),
      ];

      const results = await Promise.all(requests);

      expect(results).toHaveLength(3);
      expect(results[0].products).toHaveLength(1);
      expect(results[1].products).toHaveLength(1);
      expect(results[2].products).toHaveLength(1);
    });

    it("should maintain product order from read accessor", async () => {
      const products = [
        {
          id: 10,
          name: "Product 10",
          price: 100000,
          unit: "box",
          amount: 10,
          barcode: 10,
          categoryId: 1,
          supplierId: 1,
          category: { id: 1, name: "Cat" },
          supplier: { id: 1, name: "Supp" },
        },
        {
          id: 5,
          name: "Product 5",
          price: 50000,
          unit: "box",
          amount: 50,
          barcode: 5,
          categoryId: 1,
          supplierId: 1,
          category: { id: 1, name: "Cat" },
          supplier: { id: 1, name: "Supp" },
        },
        {
          id: 1,
          name: "Product 1",
          price: 10000,
          unit: "box",
          amount: 100,
          barcode: 1,
          categoryId: 1,
          supplierId: 1,
          category: { id: 1, name: "Cat" },
          supplier: { id: 1, name: "Supp" },
        },
      ];

      mockProductReadAccess.getProducts.mockResolvedValue(products);

      const result = await usecase.execute({});

      expect(result.products[0].id).toBe(10);
      expect(result.products[1].id).toBe(5);
      expect(result.products[2].id).toBe(1);
    });
  });

  describe("Performance Cases", () => {
    it("should execute efficiently with no parameters", async () => {
      mockProductReadAccess.getProducts.mockResolvedValue([]);

      const startTime = Date.now();
      const result = await usecase.execute({});
      const endTime = Date.now();

      expect(result).toHaveProperty("products");
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });

    it("should handle rapid successive calls", async () => {
      const products = [
        {
          id: 1,
          name: "P",
          price: 10000,
          unit: "box",
          amount: 100,
          barcode: 1,
          categoryId: 1,
          supplierId: 1,
          category: { id: 1, name: "C" },
          supplier: { id: 1, name: "S" },
        },
      ];

      mockProductReadAccess.getProducts.mockResolvedValue(products);

      for (let i = 0; i < 5; i++) {
        await usecase.execute({});
      }

      expect(mockProductReadAccess.getProducts).toHaveBeenCalledTimes(5);
    });
  });
});
