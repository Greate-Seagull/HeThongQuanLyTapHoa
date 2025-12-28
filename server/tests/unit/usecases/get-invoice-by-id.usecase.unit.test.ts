import { GetInvoiceByIdUsecase } from "../../../src/application/services/invoice/get-invoice-by-id.usecase";

describe("GetInvoiceByIdUsecase Unit Tests", () => {
  let usecase: GetInvoiceByIdUsecase;
  let mockInvoiceRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockInvoiceRepo = {
      findByIdWithDetails: jest.fn(),
    };
    usecase = new GetInvoiceByIdUsecase(mockInvoiceRepo);
  });

  describe("Success Cases", () => {
    it("should get invoice by id successfully", async () => {
      const mockInvoice = {
        id: 1,
        total: 150000,
        employee: { id: 1, name: "John" },
        user: { id: 1, name: "Customer A" },
        items: [{ productId: 100, quantity: 2, price: 75000 }],
      };
      mockInvoiceRepo.findByIdWithDetails.mockResolvedValue(mockInvoice);

      const result = await usecase.execute({ id: 1 });

      expect(result).toEqual(mockInvoice);
      expect(mockInvoiceRepo.findByIdWithDetails).toHaveBeenCalledWith(1);
    });

    it("should return null when invoice not found", async () => {
      mockInvoiceRepo.findByIdWithDetails.mockResolvedValue(null);

      const result = await usecase.execute({ id: 999 });

      expect(result).toBeNull();
    });

    it("should get invoice with multiple items", async () => {
      const mockInvoice = {
        id: 1,
        total: 300000,
        invoiceDetails: [
          { productId: 100, quantity: 2, price: 100000 },
          { productId: 101, quantity: 1, price: 100000 },
        ],
      };
      mockInvoiceRepo.findByIdWithDetails.mockResolvedValue(mockInvoice);

      const result = await usecase.execute({ id: 1 });

      expect(result.invoiceDetails).toHaveLength(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle large invoice ID", async () => {
      const mockInvoice = { id: 999999, total: 100000 };
      mockInvoiceRepo.findByIdWithDetails.mockResolvedValue(mockInvoice);

      const result = await usecase.execute({ id: 999999 });

      expect(result.id).toBe(999999);
    });

    it("should handle invoice with promotions", async () => {
      const mockInvoice = {
        id: 1,
        total: 80000,
        invoiceDetails: [
          {
            productId: 100,
            quantity: 1,
            price: 100000,
            promotion: { id: 1, name: "Sale 20%" },
          },
        ],
      };
      mockInvoiceRepo.findByIdWithDetails.mockResolvedValue(mockInvoice);

      const result = await usecase.execute({ id: 1 });

      expect(result.invoiceDetails[0]).toHaveProperty("promotion");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      mockInvoiceRepo.findByIdWithDetails.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute({ id: 1 })).rejects.toThrow("DB Error");
    });
  });
});
