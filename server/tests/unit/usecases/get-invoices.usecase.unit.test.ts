import { GetInvoicesUsecase } from "../../../src/application/services/invoice/get-invoices.usecase";

describe("GetInvoicesUsecase Unit Tests", () => {
  let usecase: GetInvoicesUsecase;
  let mockInvoiceRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockInvoiceRepo = {
      findAllWithDetails: jest.fn(),
    };
    usecase = new GetInvoicesUsecase(mockInvoiceRepo);
  });

  describe("Success Cases", () => {
    it("should get all invoices successfully", async () => {
      const mockInvoices = [
        { id: 1, total: 100000, employeeId: 1, userId: 1 },
        { id: 2, total: 200000, employeeId: 1, userId: 2 },
      ];
      mockInvoiceRepo.findAllWithDetails.mockResolvedValue(mockInvoices);

      const result = await usecase.execute();

      expect(result).toEqual(mockInvoices);
      expect(mockInvoiceRepo.findAllWithDetails).toHaveBeenCalled();
    });

    it("should return empty array when no invoices", async () => {
      mockInvoiceRepo.findAllWithDetails.mockResolvedValue([]);

      const result = await usecase.execute();

      expect(result).toEqual([]);
    });

    it("should return invoices with full details", async () => {
      const mockInvoices = [
        {
          id: 1,
          total: 150000,
          employee: { id: 1, name: "John" },
          user: { id: 1, name: "Customer A" },
          items: [{ productId: 100, quantity: 2, price: 75000 }],
        },
      ];
      mockInvoiceRepo.findAllWithDetails.mockResolvedValue(mockInvoices);

      const result = await usecase.execute();

      expect(result[0]).toHaveProperty("employee");
      expect(result[0]).toHaveProperty("user");
      expect(result[0]).toHaveProperty("items");
    });
  });

  describe("Edge Cases", () => {
    it("should handle large number of invoices", async () => {
      const mockInvoices = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        total: 100000,
      }));
      mockInvoiceRepo.findAllWithDetails.mockResolvedValue(mockInvoices);

      const result = await usecase.execute();

      expect(result).toHaveLength(1000);
    });

    it("should handle invoices with Vietnamese names", async () => {
      const mockInvoices = [
        {
          id: 1,
          total: 100000,
          employee: { id: 1, name: "Nguyễn Văn A" },
          user: { id: 1, name: "Trần Thị B" },
        },
      ];
      mockInvoiceRepo.findAllWithDetails.mockResolvedValue(mockInvoices);

      const result = await usecase.execute();

      expect(result[0].employee.name).toBe("Nguyễn Văn A");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      mockInvoiceRepo.findAllWithDetails.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute()).rejects.toThrow("DB Error");
    });
  });
});
