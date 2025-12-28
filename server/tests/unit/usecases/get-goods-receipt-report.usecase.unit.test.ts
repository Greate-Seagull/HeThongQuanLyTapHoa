import { GetGoodsReceiptReportUsecase, GetGoodsReceiptReportInput } from "../../../src/application/services/report/get-goods-receipt-report.usecase";

describe("GetGoodsReceiptReportUsecase Unit Tests", () => {
  let usecase: GetGoodsReceiptReportUsecase;
  let mockReportReadAccessor: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReportReadAccessor = {
      getGoodsReceiptReport: jest.fn(),
    };
    usecase = new GetGoodsReceiptReportUsecase(mockReportReadAccessor);
  });

  describe("Success Cases", () => {
    it("should get goods receipt report with date range", async () => {
      const input: GetGoodsReceiptReportInput = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        authId: 1,
      };
      const mockReceipts = [
        { id: 1, createdAt: new Date(), totalAmount: 10000, totalQuantity: 100 },
        { id: 2, createdAt: new Date(), totalAmount: 20000, totalQuantity: 200 },
      ];
      mockReportReadAccessor.getGoodsReceiptReport.mockResolvedValue(mockReceipts);

      const result = await usecase.execute(input);

      expect(result.goodReceipts).toEqual(mockReceipts);
      expect(result.summary.totalGoodReceipts).toBe(2);
    });

    it("should return empty array when no receipts", async () => {
      const input: GetGoodsReceiptReportInput = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        authId: 1,
      };
      mockReportReadAccessor.getGoodsReceiptReport.mockResolvedValue([]);

      const result = await usecase.execute(input);

      expect(result.goodReceipts).toEqual([]);
      expect(result.summary.totalGoodReceipts).toBe(0);
    });

    it("should filter by supplierId", async () => {
      const input: GetGoodsReceiptReportInput = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        supplierId: 5,
        authId: 1,
      };
      mockReportReadAccessor.getGoodsReceiptReport.mockResolvedValue([]);

      await usecase.execute(input);

      expect(mockReportReadAccessor.getGoodsReceiptReport).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle large dataset", async () => {
      const input: GetGoodsReceiptReportInput = {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        authId: 1,
      };
      const mockReceipts = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        createdAt: new Date(),
        totalAmount: 10000,
        totalQuantity: 100,
      }));
      mockReportReadAccessor.getGoodsReceiptReport.mockResolvedValue(mockReceipts);

      const result = await usecase.execute(input);

      expect(result.goodReceipts.length).toBe(1000);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input: GetGoodsReceiptReportInput = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        authId: 1,
      };
      mockReportReadAccessor.getGoodsReceiptReport.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });
  });
});
