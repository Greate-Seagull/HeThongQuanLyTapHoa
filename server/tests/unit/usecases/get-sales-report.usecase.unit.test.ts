import { GetSalesReportUsecase, GetSalesReportInput } from "../../../src/application/services/report/get-sales-report.usecase";

describe("GetSalesReportUsecase Unit Tests", () => {
  let usecase: GetSalesReportUsecase;
  let mockReportReadAccessor: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReportReadAccessor = {
      getSalesReport: jest.fn(),
    };
    usecase = new GetSalesReportUsecase(mockReportReadAccessor);
  });

  describe("Success Cases", () => {
    it("should get sales report without filters", async () => {
      const input: GetSalesReportInput = { authId: 1 };
      const mockSales = [
        { id: 1, total: 1000, totalQuantity: 10, usedPoint: 0 },
        { id: 2, total: 2000, totalQuantity: 20, usedPoint: 50 },
      ];
      mockReportReadAccessor.getSalesReport.mockResolvedValue(mockSales);

      const result = await usecase.execute(input);

      expect(result.sales).toEqual(mockSales);
      expect(result.summary.totalInvoices).toBe(2);
      expect(result.summary.totalRevenue).toBe(3000);
    });

    it("should get sales report with date range", async () => {
      const input: GetSalesReportInput = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        authId: 1,
      };
      const mockSales = [{ id: 1, total: 1000, totalQuantity: 10, usedPoint: 0 }];
      mockReportReadAccessor.getSalesReport.mockResolvedValue(mockSales);

      const result = await usecase.execute(input);

      expect(mockReportReadAccessor.getSalesReport).toHaveBeenCalledWith({
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-31"),
        employeeId: undefined,
        userId: undefined,
      });
    });

    it("should get sales report filtered by employeeId", async () => {
      const input: GetSalesReportInput = { employeeId: 5, authId: 1 };
      mockReportReadAccessor.getSalesReport.mockResolvedValue([]);

      await usecase.execute(input);

      expect(mockReportReadAccessor.getSalesReport).toHaveBeenCalledWith({
        startDate: undefined,
        endDate: undefined,
        employeeId: 5,
        userId: undefined,
      });
    });

    it("should get sales report filtered by userId", async () => {
      const input: GetSalesReportInput = { userId: 10, authId: 1 };
      mockReportReadAccessor.getSalesReport.mockResolvedValue([]);

      await usecase.execute(input);

      expect(mockReportReadAccessor.getSalesReport).toHaveBeenCalledWith({
        startDate: undefined,
        endDate: undefined,
        employeeId: undefined,
        userId: 10,
      });
    });
  });

  describe("Summary Calculations", () => {
    it("should calculate summary correctly", async () => {
      const input: GetSalesReportInput = { authId: 1 };
      const mockSales = [
        { id: 1, total: 1000, totalQuantity: 10, usedPoint: 0 },
        { id: 2, total: 2000, totalQuantity: 20, usedPoint: 50 },
        { id: 3, total: 3000, totalQuantity: 30, usedPoint: 100 },
      ];
      mockReportReadAccessor.getSalesReport.mockResolvedValue(mockSales);

      const result = await usecase.execute(input);

      expect(result.summary.totalInvoices).toBe(3);
      expect(result.summary.totalRevenue).toBe(6000);
      expect(result.summary.totalQuantity).toBe(60);
      expect(result.summary.averageInvoiceValue).toBe(2000);
      expect(result.summary.totalPointsUsed).toBe(150);
    });

    it("should handle zero average when no sales", async () => {
      const input: GetSalesReportInput = { authId: 1 };
      mockReportReadAccessor.getSalesReport.mockResolvedValue([]);

      const result = await usecase.execute(input);

      expect(result.summary.averageInvoiceValue).toBe(0);
    });

    it("should round average correctly", async () => {
      const input: GetSalesReportInput = { authId: 1 };
      const mockSales = [
        { id: 1, total: 1001, totalQuantity: 10, usedPoint: 0 },
        { id: 2, total: 1002, totalQuantity: 10, usedPoint: 0 },
      ];
      mockReportReadAccessor.getSalesReport.mockResolvedValue(mockSales);

      const result = await usecase.execute(input);

      expect(result.summary.averageInvoiceValue).toBe(1002);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty sales result", async () => {
      const input: GetSalesReportInput = { authId: 1 };
      mockReportReadAccessor.getSalesReport.mockResolvedValue([]);

      const result = await usecase.execute(input);

      expect(result.sales).toEqual([]);
      expect(result.summary.totalInvoices).toBe(0);
      expect(result.summary.totalRevenue).toBe(0);
    });

    it("should handle large sales dataset", async () => {
      const input: GetSalesReportInput = { authId: 1 };
      const mockSales = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        total: 1000,
        totalQuantity: 10,
        usedPoint: 5,
      }));
      mockReportReadAccessor.getSalesReport.mockResolvedValue(mockSales);

      const result = await usecase.execute(input);

      expect(result.summary.totalInvoices).toBe(1000);
      expect(result.summary.totalRevenue).toBe(1000000);
    });

    it("should handle sales with zero points used", async () => {
      const input: GetSalesReportInput = { authId: 1 };
      const mockSales = [
        { id: 1, total: 1000, totalQuantity: 10, usedPoint: 0 },
      ];
      mockReportReadAccessor.getSalesReport.mockResolvedValue(mockSales);

      const result = await usecase.execute(input);

      expect(result.summary.totalPointsUsed).toBe(0);
    });

    it("should handle multiple filters combined", async () => {
      const input: GetSalesReportInput = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        employeeId: 5,
        userId: 10,
        authId: 1,
      };
      mockReportReadAccessor.getSalesReport.mockResolvedValue([]);

      await usecase.execute(input);

      expect(mockReportReadAccessor.getSalesReport).toHaveBeenCalledWith({
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-31"),
        employeeId: 5,
        userId: 10,
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input: GetSalesReportInput = { authId: 1 };
      mockReportReadAccessor.getSalesReport.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });

    it("should handle invalid date format", async () => {
      const input: GetSalesReportInput = {
        startDate: "invalid-date",
        authId: 1,
      };
      mockReportReadAccessor.getSalesReport.mockRejectedValue(new Error("Invalid date"));

      await expect(usecase.execute(input)).rejects.toThrow();
    });
  });
});
