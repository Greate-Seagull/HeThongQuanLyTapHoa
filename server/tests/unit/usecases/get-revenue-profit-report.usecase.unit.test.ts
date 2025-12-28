import { GetRevenueProfitReportUsecase, GetRevenueProfitReportInput } from "../../../src/application/services/report/get-revenue-profit-report.usecase";

describe("GetRevenueProfitReportUsecase Unit Tests", () => {
  let usecase: GetRevenueProfitReportUsecase;
  let mockReportReadAccessor: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReportReadAccessor = {
      getRevenueProfitReport: jest.fn(),
    };
    usecase = new GetRevenueProfitReportUsecase(mockReportReadAccessor);
  });

  describe("Success Cases", () => {
    it("should get revenue profit report with date range", async () => {
      const input: GetRevenueProfitReportInput = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        authId: 1,
      };
      const mockReport = {
        totalRevenue: 100000,
        totalCost: 60000,
        totalProfit: 40000,
        profitMargin: 40,
      };
      mockReportReadAccessor.getRevenueProfitReport.mockResolvedValue(mockReport);

      const result = await usecase.execute(input);

      expect(result).toEqual(mockReport);
      expect(mockReportReadAccessor.getRevenueProfitReport).toHaveBeenCalled();
    });

    it("should handle report with zero profit", async () => {
      const input: GetRevenueProfitReportInput = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        authId: 1,
      };
      const mockReport = {
        totalRevenue: 100000,
        totalCost: 100000,
        totalProfit: 0,
        profitMargin: 0,
      };
      mockReportReadAccessor.getRevenueProfitReport.mockResolvedValue(mockReport);

      const result = await usecase.execute(input);

      expect(result.totalProfit).toBe(0);
      expect(result.profitMargin).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large revenue values", async () => {
      const input: GetRevenueProfitReportInput = {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        authId: 1,
      };
      const mockReport = {
        totalRevenue: 10000000,
        totalCost: 6000000,
        totalProfit: 4000000,
        profitMargin: 40,
      };
      mockReportReadAccessor.getRevenueProfitReport.mockResolvedValue(mockReport);

      const result = await usecase.execute(input);

      expect(result.totalRevenue).toBe(10000000);
    });

    it("should handle negative profit", async () => {
      const input: GetRevenueProfitReportInput = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        authId: 1,
      };
      const mockReport = {
        totalRevenue: 50000,
        totalCost: 80000,
        totalProfit: -30000,
        profitMargin: -60,
      };
      mockReportReadAccessor.getRevenueProfitReport.mockResolvedValue(mockReport);

      const result = await usecase.execute(input);

      expect(result.totalProfit).toBe(-30000);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input: GetRevenueProfitReportInput = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        authId: 1,
      };
      mockReportReadAccessor.getRevenueProfitReport.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });
  });
});
