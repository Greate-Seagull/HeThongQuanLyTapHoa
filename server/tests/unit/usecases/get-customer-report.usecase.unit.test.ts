import { GetCustomerReportUsecase, GetCustomerReportInput } from "../../../src/application/services/report/get-customer-report.usecase";

describe("GetCustomerReportUsecase Unit Tests", () => {
  let usecase: GetCustomerReportUsecase;
  let mockReportReadAccessor: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReportReadAccessor = {
      getCustomerReport: jest.fn(),
    };
    usecase = new GetCustomerReportUsecase(mockReportReadAccessor);
  });

  describe("Success Cases", () => {
    it("should get customer report ordered by points", async () => {
      const input: GetCustomerReportInput = { orderBy: "point", authId: 1 };
      const mockCustomers = [
        { id: 1, name: "Customer A", currentPoints: 100, totalSpent: 1000, totalPointsUsed: 50 },
        { id: 2, name: "Customer B", currentPoints: 200, totalSpent: 2000, totalPointsUsed: 100 },
      ];
      mockReportReadAccessor.getCustomerReport.mockResolvedValue(mockCustomers);

      const result = await usecase.execute(input);

      expect(result.customers).toEqual(mockCustomers);
      expect(result.summary.totalCustomers).toBe(2);
      expect(mockReportReadAccessor.getCustomerReport).toHaveBeenCalledWith("point");
    });

    it("should get customer report ordered by totalSpent", async () => {
      const input: GetCustomerReportInput = { orderBy: "totalSpent", authId: 1 };
      const mockCustomers = [
        { id: 1, name: "Customer A", currentPoints: 100, totalSpent: 5000, totalPointsUsed: 50 },
      ];
      mockReportReadAccessor.getCustomerReport.mockResolvedValue(mockCustomers);

      const result = await usecase.execute(input);

      expect(mockReportReadAccessor.getCustomerReport).toHaveBeenCalledWith("totalSpent");
    });

    it("should default to point ordering when orderBy not specified", async () => {
      const input: GetCustomerReportInput = { authId: 1 };
      mockReportReadAccessor.getCustomerReport.mockResolvedValue([]);

      await usecase.execute(input);

      expect(mockReportReadAccessor.getCustomerReport).toHaveBeenCalledWith("point");
    });

    it("should return empty customers array when no customers", async () => {
      const input: GetCustomerReportInput = { orderBy: "point", authId: 1 };
      mockReportReadAccessor.getCustomerReport.mockResolvedValue([]);

      const result = await usecase.execute(input);

      expect(result.customers).toEqual([]);
      expect(result.summary.totalCustomers).toBe(0);
    });
  });

  describe("Summary Calculations", () => {
    it("should calculate summary totals correctly", async () => {
      const input: GetCustomerReportInput = { orderBy: "point", authId: 1 };
      const mockCustomers = [
        { id: 1, name: "A", currentPoints: 100, totalSpent: 1000, totalPointsUsed: 50 },
        { id: 2, name: "B", currentPoints: 200, totalSpent: 2000, totalPointsUsed: 100 },
        { id: 3, name: "C", currentPoints: 300, totalSpent: 3000, totalPointsUsed: 150 },
      ];
      mockReportReadAccessor.getCustomerReport.mockResolvedValue(mockCustomers);

      const result = await usecase.execute(input);

      expect(result.summary.totalCustomers).toBe(3);
      expect(result.summary.totalPoints).toBe(600);
      expect(result.summary.totalSpent).toBe(6000);
      expect(result.summary.totalPointsUsed).toBe(300);
      expect(result.summary.averageSpent).toBe(2000);
    });

    it("should handle zero average when no customers", async () => {
      const input: GetCustomerReportInput = { orderBy: "point", authId: 1 };
      mockReportReadAccessor.getCustomerReport.mockResolvedValue([]);

      const result = await usecase.execute(input);

      expect(result.summary.averageSpent).toBe(0);
    });

    it("should round average spent correctly", async () => {
      const input: GetCustomerReportInput = { orderBy: "point", authId: 1 };
      const mockCustomers = [
        { id: 1, name: "A", currentPoints: 100, totalSpent: 1001, totalPointsUsed: 0 },
        { id: 2, name: "B", currentPoints: 200, totalSpent: 1002, totalPointsUsed: 0 },
      ];
      mockReportReadAccessor.getCustomerReport.mockResolvedValue(mockCustomers);

      const result = await usecase.execute(input);

      expect(result.summary.averageSpent).toBe(1002);
    });
  });

  describe("Edge Cases", () => {
    it("should handle customers with zero points", async () => {
      const input: GetCustomerReportInput = { orderBy: "point", authId: 1 };
      const mockCustomers = [
        { id: 1, name: "A", currentPoints: 0, totalSpent: 0, totalPointsUsed: 0 },
      ];
      mockReportReadAccessor.getCustomerReport.mockResolvedValue(mockCustomers);

      const result = await usecase.execute(input);

      expect(result.summary.totalPoints).toBe(0);
      expect(result.summary.totalSpent).toBe(0);
    });

    it("should handle large customer dataset", async () => {
      const input: GetCustomerReportInput = { orderBy: "point", authId: 1 };
      const mockCustomers = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Customer ${i + 1}`,
        currentPoints: 100,
        totalSpent: 1000,
        totalPointsUsed: 50,
      }));
      mockReportReadAccessor.getCustomerReport.mockResolvedValue(mockCustomers);

      const result = await usecase.execute(input);

      expect(result.summary.totalCustomers).toBe(1000);
      expect(result.summary.totalPoints).toBe(100000);
    });

    it("should handle Vietnamese customer names", async () => {
      const input: GetCustomerReportInput = { orderBy: "point", authId: 1 };
      const mockCustomers = [
        { id: 1, name: "Nguyễn Văn A", currentPoints: 100, totalSpent: 1000, totalPointsUsed: 0 },
      ];
      mockReportReadAccessor.getCustomerReport.mockResolvedValue(mockCustomers);

      const result = await usecase.execute(input);

      expect(result.customers[0].name).toBe("Nguyễn Văn A");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input: GetCustomerReportInput = { orderBy: "point", authId: 1 };
      mockReportReadAccessor.getCustomerReport.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });

    it("should handle connection timeout", async () => {
      const input: GetCustomerReportInput = { orderBy: "point", authId: 1 };
      mockReportReadAccessor.getCustomerReport.mockRejectedValue(new Error("Timeout"));

      await expect(usecase.execute(input)).rejects.toThrow("Timeout");
    });
  });
});
