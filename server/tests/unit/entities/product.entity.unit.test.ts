import { Product, ProductUnit } from "../../../src/domain/entities/product";

describe("Product Entity Unit Tests", () => {
  describe("create", () => {
    it("should create a product with valid data", () => {
      const input = {
        name: "Coca Cola",
        price: 15000,
        unit: ProductUnit.BOTTLE,
        amount: 100,
        barcode: 8934567890123,
      };

      const product = Product.create(input);

      expect(product).toBeInstanceOf(Product);
      expect(product.name).toBe("Coca Cola");
      expect(product.price).toBe(15000);
      expect(product.unit).toBe(ProductUnit.BOTTLE);
      expect(product.amount).toBe(100);
    });

    it("should create product with optional fields", () => {
      const input = {
        name: "Mì gói Hảo Hảo",
        price: 3000,
        unit: ProductUnit.PACKAGE,
        amount: 200,
        barcode: 8934563141000,
        categoryId: 1,
        supplierId: 1,
      };

      const product = Product.create(input);

      expect(product.barcode).toBe(8934563141000);
      expect(product.categoryId).toBe(1);
      expect(product.supplierId).toBe(1);
    });

    it("should throw error when price is negative", () => {
      const input = {
        name: "Invalid Product",
        price: -100,
        unit: ProductUnit.PIECE,
        barcode: 8934567890123,
      };

      expect(() => Product.create(input)).toThrow("Invalid price");
    });

    it("should throw error when price is zero", () => {
      const input = {
        name: "Invalid Product",
        price: 0,
        unit: ProductUnit.PIECE,
        barcode: 8934567890123,
      };

      expect(() => Product.create(input)).toThrow("Invalid price");
    });

    it("should throw error when amount is negative", () => {
      const input = {
        name: "Invalid Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        amount: -5,
        barcode: 8934567890123,
      };

      expect(() => Product.create(input)).toThrow("Invalid quantity");
    });

    it("should accept amount as zero (out of stock)", () => {
      const input = {
        name: "Out of Stock Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        amount: 0,
        barcode: 8934567890123,
      };

      const product = Product.create(input);
      expect(product.amount).toBe(0);
    });
  });

  describe("update", () => {
    let product: Product;

    beforeEach(() => {
      product = Product.create({
        name: "Original Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        amount: 50,
        barcode: 8934567890123,
      });
    });

    it("should update product name", () => {
      product.update({ name: "Updated Product" });
      expect(product.name).toBe("Updated Product");
    });

    it("should update product price", () => {
      product.update({ price: 15000 });
      expect(product.price).toBe(15000);
    });

    it("should update multiple fields at once", () => {
      product.update({
        name: "New Product",
        price: 20000,
        amount: 100,
        unit: ProductUnit.BOX,
      });

      expect(product.name).toBe("New Product");
      expect(product.price).toBe(20000);
      expect(product.amount).toBe(100);
      expect(product.unit).toBe(ProductUnit.BOX);
    });

    it("should throw error when updating to invalid price", () => {
      expect(() => product.update({ price: -100 })).toThrow("Invalid price");
    });

    it("should throw error when updating to invalid amount", () => {
      expect(() => product.update({ amount: -10 })).toThrow("Invalid quantity");
    });

    it("should not change fields if not provided in update", () => {
      const originalName = product.name;
      const originalPrice = product.price;

      product.update({ amount: 75 });

      expect(product.name).toBe(originalName);
      expect(product.price).toBe(originalPrice);
      expect(product.amount).toBe(75);
    });
  });

  describe("sellStock", () => {
    let product: Product;

    beforeEach(() => {
      product = Product.create({
        name: "Test Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        amount: 100,
        barcode: 8934567890123,
      });
    });

    it("should decrease amount when selling stock", () => {
      product.sellStock(10);
      expect(product.amount).toBe(90);
    });

    it("should handle selling all stock", () => {
      product.sellStock(100);
      expect(product.amount).toBe(0);
    });

    it("should throw error when selling more than available (business rule)", () => {
      // Product entity prevents negative stock
      expect(() => product.sellStock(150)).toThrow("Invalid quantity");
    });

    it("should throw error when selling zero quantity", () => {
      expect(() => product.sellStock(0)).toThrow("Invalid sold quantity");
    });

    it("should throw error when selling negative quantity", () => {
      expect(() => product.sellStock(-10)).toThrow("Invalid sold quantity");
    });
  });

  describe("receiveStock", () => {
    let product: Product;

    beforeEach(() => {
      product = Product.create({
        name: "Test Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        amount: 50,
        barcode: 8934567890123,
      });
    });

    it("should increase amount when receiving stock", () => {
      product.receiveStock(30);
      expect(product.amount).toBe(80);
    });

    it("should handle large quantity", () => {
      product.receiveStock(1000);
      expect(product.amount).toBe(1050);
    });

    it("should throw error when receiving zero quantity", () => {
      expect(() => product.receiveStock(0)).toThrow("Invalid received quantity");
    });

    it("should throw error when receiving negative quantity", () => {
      expect(() => product.receiveStock(-10)).toThrow("Invalid received quantity");
    });
  });

  describe("updateBarcode", () => {
    it("should update barcode successfully", () => {
      const product = Product.create({
        name: "Test Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        barcode: 8934567890123,
      });

      product.updateBarcode(8934563141000);
      expect(product.barcode).toBe(8934563141000);
    });
  });

  describe("updateUnit", () => {
    it("should update unit successfully", () => {
      const product = Product.create({
        name: "Test Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        barcode: 8934567890123,
      });

      product.updateUnit(ProductUnit.BOX);
      expect(product.unit).toBe(ProductUnit.BOX);
    });

    it("should throw error when updating to invalid unit", () => {
      const product = Product.create({
        name: "Test Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        barcode: 8934567890123,
      });

      expect(() => product.updateUnit("INVALID_UNIT")).toThrow("Invalid unit");
    });
  });

  describe("updatePrice", () => {
    it("should update price successfully", () => {
      const product = Product.create({
        name: "Test Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        barcode: 8934567890123,
      });

      product.updatePrice(15000);
      expect(product.price).toBe(15000);
    });

    it("should throw error when updating to invalid price", () => {
      const product = Product.create({
        name: "Test Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        barcode: 8934567890123,
      });

      expect(() => product.updatePrice(-100)).toThrow("Invalid price");
    });
  });

  describe("updateName", () => {
    it("should update name successfully", () => {
      const product = Product.create({
        name: "Original Name",
        price: 10000,
        unit: ProductUnit.PIECE,
        barcode: 8934567890123,
      });

      product.updateName("New Name");
      expect(product.name).toBe("New Name");
    });
  });

  describe("Business Scenarios", () => {
    it("should handle complete product lifecycle", () => {
      // Create product
      const product = Product.create({
        name: "Pepsi Cola",
        price: 12000,
        unit: ProductUnit.BOTTLE,
        amount: 0,
        barcode: 8934567890456,
      });

      // Receive stock
      product.receiveStock(100);
      expect(product.amount).toBe(100);

      // Sell some
      product.sellStock(30);
      expect(product.amount).toBe(70);

      // Receive more
      product.receiveStock(50);
      expect(product.amount).toBe(120);

      // Update price (promotion)
      product.updatePrice(10000);
      expect(product.price).toBe(10000);

      // Sell more
      product.sellStock(120);
      expect(product.amount).toBe(0);
    });

    it("should maintain data integrity during multiple operations", () => {
      const product = Product.create({
        name: "Test Product",
        price: 10000,
        unit: ProductUnit.PIECE,
        amount: 100,
        barcode: 8934567890123,
      });

      // Multiple operations
      product.sellStock(20);
      product.receiveStock(30);
      product.updatePrice(15000);
      product.sellStock(10);

      expect(product.amount).toBe(100); // 100 - 20 + 30 - 10
      expect(product.price).toBe(15000);
      expect(product.name).toBe("Test Product");
    });
  });
});
