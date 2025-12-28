import { GetMyInvoicesUsecase } from "../../../src/application/services/invoice/get-my-invoices.usecase";

describe("GetMyInvoicesUsecase Unit Tests", () => {
  let usecase: GetMyInvoicesUsecase;
  let mockInvoiceRead: any;

  beforeEach(() => {
    mockInvoiceRead = {
      getByUserId: jest.fn(),
    };

    usecase = new GetMyInvoicesUsecase(mockInvoiceRead);
  });

  describe("Success Cases", () => {
    it("should get invoices using authId", async () => {
      const mockInvoices = [
        { id: 1, totalAmount: 100000, createdAt: new Date() },
        { id: 2, totalAmount: 50000, createdAt: new Date() },
      ];

      mockInvoiceRead.getByUserId.mockResolvedValue(mockInvoices);

      const result = await usecase.execute({ authId: 1 });

      expect(mockInvoiceRead.getByUserId).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
    });

    it("should get invoices using user.id", async () => {
      const mockInvoices = [{ id: 3, totalAmount: 75000 }];

      mockInvoiceRead.getByUserId.mockResolvedValue(mockInvoices);

      const result = await usecase.execute({ user: { id: 2 } });

      expect(mockInvoiceRead.getByUserId).toHaveBeenCalledWith(2);
      expect(result).toHaveLength(1);
    });

    it("should get invoices using body.authId", async () => {
      mockInvoiceRead.getByUserId.mockResolvedValue([]);

      await usecase.execute({ body: { authId: 3 } });

      expect(mockInvoiceRead.getByUserId).toHaveBeenCalledWith(3);
    });

    it("should get invoices using query.authId", async () => {
      mockInvoiceRead.getByUserId.mockResolvedValue([]);

      await usecase.execute({ query: { authId: 4 } });

      expect(mockInvoiceRead.getByUserId).toHaveBeenCalledWith(4);
    });

    it("should return empty array when user has no invoices", async () => {
      mockInvoiceRead.getByUserId.mockResolvedValue([]);

      const result = await usecase.execute({ authId: 5 });

      expect(result).toEqual([]);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when userId is missing", async () => {
      await expect(usecase.execute({})).rejects.toThrow(
        "User ID is required to fetch invoices"
      );
    });

    it("should throw error when input is null", async () => {
      await expect(usecase.execute(null)).rejects.toThrow();
    });

    it("should throw error when input is undefined", async () => {
      await expect(usecase.execute(undefined)).rejects.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle large number of invoices", async () => {
      const mockInvoices = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        totalAmount: 10000,
      }));

      mockInvoiceRead.getByUserId.mockResolvedValue(mockInvoices);

      const result = await usecase.execute({ authId: 1 });

      expect(result).toHaveLength(1000);
    });

    it("should handle string userId and convert to number", async () => {
      mockInvoiceRead.getByUserId.mockResolvedValue([]);

      await usecase.execute({ authId: "10" });

      expect(mockInvoiceRead.getByUserId).toHaveBeenCalledWith(10);
    });

    it("should prioritize authId over other sources", async () => {
      mockInvoiceRead.getByUserId.mockResolvedValue([]);

      await usecase.execute({
        authId: 1,
        user: { id: 2 },
        body: { authId: 3 },
        query: { authId: 4 },
      });

      expect(mockInvoiceRead.getByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      mockInvoiceRead.getByUserId.mockRejectedValue(
        new Error("Database connection error")
      );

      await expect(
        usecase.execute({ authId: 1 })
      ).rejects.toThrow("Database connection error");
    });

    it("should handle errors from invoice accessor", async () => {
      mockInvoiceRead.getByUserId.mockRejectedValue(
        new Error("Failed to fetch invoices")
      );

      await expect(
        usecase.execute({ authId: 1 })
      ).rejects.toThrow("Failed to fetch invoices");
    });
  });
});
