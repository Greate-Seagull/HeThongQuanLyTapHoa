import { GetInventoryReportUsecase, GetInventoryReportInput } from "../../../src/application/services/report/get-inventory-report.usecase";

describe("GetInventoryReportUsecase Unit Tests", () => {
  let usecase: GetInventoryReportUsecase;
  let mockReportReadAccessor: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReportReadAccessor = {
      getInventoryReport: jest.fn(),
    };
    usecase = new GetInventoryReportUsecase(mockReportReadAccessor);
  });

  describe("Success Cases", () => {
    it("should get inventory report successfully", async () => {
      const input: GetInventoryReportInput = { authId: 1 };
      const mockInventory = [
        { id: 1, name: "Product A", amount: 100, price: 100, isLowStock: false },
        { id: 2, name: "Product B", amount: 50, price: 100, isLowStock: false },
      ];
      mockReportReadAccessor.getInventoryReport.mockResolvedValue(mockInventory);

      const result = await usecase.execute(input);

      expect(result.products).toEqual(mockInventory);
      expect(result.summary.totalProducts).toBe(2);
      expect(mockReportReadAccessor.getInventoryReport).toHaveBeenCalledWith(10);
    });

    it("should use custom lowStockThreshold", async () => {
      const input: GetInventoryReportInput = { lowStockThreshold: 20, authId: 1 };
      mockReportReadAccessor.getInventoryReport.mockResolvedValue([]);

      await usecase.execute(input);

      expect(mockReportReadAccessor.getInventoryReport).toHaveBeenCalledWith(20);
    });

    it("should return empty products when no inventory", async () => {
      const input: GetInventoryReportInput = { authId: 1 };
      mockReportReadAccessor.getInventoryReport.mockResolvedValue([]);

      const result = await usecase.execute(input);

      expect(result.products).toEqual([]);
      expect(result.summary.totalProducts).toBe(0);
    });

    it("should identify out of stock products", async () => {
      const input: GetInventoryReportInput = { authId: 1 };
      const mockInventory = [
        { id: 1, name: "Out of Stock", amount: 0, price: 100, isLowStock: true },
        { id: 2, name: "In Stock", amount: 50, price: 100, isLowStock: false },
      ];
      mockReportReadAccessor.getInventoryReport.mockResolvedValue(mockInventory);

      const result = await usecase.execute(input);

      expect(result.summary.outOfStockProducts).toBe(1);
    });
  });

  describe("Summary Calculations", () => {
    it("should calculate total value correctly", async () => {
      const input: GetInventoryReportInput = { authId: 1 };
      const mockInventory = [
        { id: 1, name: "A", amount: 100, price: 100, isLowStock: false },
        { id: 2, name: "B", amount: 50, price: 200, isLowStock: false },
      ];
      mockReportReadAccessor.getInventoryReport.mockResolvedValue(mockInventory);

      const result = await usecase.execute(input);

      expect(result.summary.totalValue).toBe(20000);
    });

    it("should count low stock products correctly", async () => {
      const input: GetInventoryReportInput = { authId: 1 };
      const mockInventory = [
        { id: 1, name: "A", amount: 5, price: 100, isLowStock: true },
        { id: 2, name: "B", amount: 50, price: 100, isLowStock: false },
        { id: 3, name: "C", amount: 3, price: 100, isLowStock: true },
      ];
      mockReportReadAccessor.getInventoryReport.mockResolvedValue(mockInventory);

      const result = await usecase.execute(input);

      expect(result.summary.lowStockProducts).toBe(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle large inventory dataset", async () => {
      const input: GetInventoryReportInput = { authId: 1 };
      const mockInventory = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        amount: 100,
        price: 100,
        isLowStock: false,
      }));
      mockReportReadAccessor.getInventoryReport.mockResolvedValue(mockInventory);

      const result = await usecase.execute(input);

      expect(result.products.length).toBe(1000);
    });

    it("should handle Vietnamese product names", async () => {
      const input: GetInventoryReportInput = { authId: 1 };
      const mockInventory = [
        { id: 1, name: "Bánh mì", amount: 50, price: 5000, isLowStock: false },
      ];
      mockReportReadAccessor.getInventoryReport.mockResolvedValue(mockInventory);

      const result = await usecase.execute(input);

      expect(result.products[0].name).toBe("Bánh mì");
    });

    it("should handle very large values", async () => {
      const input: GetInventoryReportInput = { authId: 1 };
      const mockInventory = [
        { id: 1, name: "Expensive", amount: 1000, price: 1000, isLowStock: false },
      ];
      mockReportReadAccessor.getInventoryReport.mockResolvedValue(mockInventory);

      const result = await usecase.execute(input);

      expect(result.summary.totalValue).toBe(1000000);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input: GetInventoryReportInput = { authId: 1 };
      mockReportReadAccessor.getInventoryReport.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });

    it("should handle connection timeout", async () => {
      const input: GetInventoryReportInput = { authId: 1 };
      mockReportReadAccessor.getInventoryReport.mockRejectedValue(new Error("Timeout"));

      await expect(usecase.execute(input)).rejects.toThrow("Timeout");
    });
  });
});
