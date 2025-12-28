import { GetStocktakingReportUsecase, GetStocktakingReportInput } from "../../../src/application/services/report/get-stocktaking-report.usecase";

describe("GetStocktakingReportUsecase Unit Tests", () => {
  let usecase: GetStocktakingReportUsecase;
  let mockReportReadAccessor: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReportReadAccessor = {
      getStocktakingReport: jest.fn(),
    };
    usecase = new GetStocktakingReportUsecase(mockReportReadAccessor);
  });

  describe("Success Cases", () => {
    it("should get stocktaking report with date range", async () => {
      const input: GetStocktakingReportInput = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        authId: 1,
      };
      const mockStocktakings = [
        { id: 1, createdAt: new Date(), details: [{ hasDiscrepancy: true, discrepancy: 5 }] },
        { id: 2, createdAt: new Date(), details: [{ hasDiscrepancy: false, discrepancy: 0 }] },
      ];
      mockReportReadAccessor.getStocktakingReport.mockResolvedValue(mockStocktakings);

      const result = await usecase.execute(input);

      expect(result.stocktakings).toEqual(mockStocktakings);
      expect(result.summary.totalStocktakings).toBe(2);
    });

    it("should return empty array when no stocktakings", async () => {
      const input: GetStocktakingReportInput = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        authId: 1,
      };
      mockReportReadAccessor.getStocktakingReport.mockResolvedValue([]);

      const result = await usecase.execute(input);

      expect(result.stocktakings).toEqual([]);
      expect(result.summary.totalStocktakings).toBe(0);
    });

    it("should filter by hasDiscrepancy", async () => {
      const input: GetStocktakingReportInput = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        hasDiscrepancy: true,
        authId: 1,
      };
      mockReportReadAccessor.getStocktakingReport.mockResolvedValue([]);

      await usecase.execute(input);

      expect(mockReportReadAccessor.getStocktakingReport).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle large dataset", async () => {
      const input: GetStocktakingReportInput = {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        authId: 1,
      };
      const mockStocktakings = Array.from({ length: 500 }, (_, i) => ({
        id: i + 1,
        createdAt: new Date(),
        details: [{ hasDiscrepancy: false, discrepancy: 0 }],
      }));
      mockReportReadAccessor.getStocktakingReport.mockResolvedValue(mockStocktakings);

      const result = await usecase.execute(input);

      expect(result.stocktakings.length).toBe(500);
    });

    it("should handle zero discrepancies", async () => {
      const input: GetStocktakingReportInput = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        authId: 1,
      };
      const mockStocktakings = [
        { id: 1, createdAt: new Date(), details: [{ hasDiscrepancy: false, discrepancy: 0 }] },
      ];
      mockReportReadAccessor.getStocktakingReport.mockResolvedValue(mockStocktakings);

      const result = await usecase.execute(input);

      expect(result.summary.totalDiscrepancies).toBe(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input: GetStocktakingReportInput = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        authId: 1,
      };
      mockReportReadAccessor.getStocktakingReport.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });
  });
});
