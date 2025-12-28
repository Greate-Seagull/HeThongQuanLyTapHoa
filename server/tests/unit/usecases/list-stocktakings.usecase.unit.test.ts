import { ListStocktakingsUsecase } from "../../../src/application/services/stocktaking/list-stocktakings.usecase";

describe("ListStocktakingsUsecase Unit Tests", () => {
  let usecase: ListStocktakingsUsecase;
  let mockStocktakingRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStocktakingRepo = {
      findAllWithDetails: jest.fn(),
    };
    usecase = new ListStocktakingsUsecase(mockStocktakingRepo);
  });

  describe("Success Cases", () => {
    it("should list all stocktakings successfully", async () => {
      const mockStocktakings = [
        { id: 1, employeeId: 1, details: [] },
        { id: 2, employeeId: 1, details: [] },
      ];
      mockStocktakingRepo.findAllWithDetails.mockResolvedValue(mockStocktakings);

      const result = await usecase.execute();

      expect(result).toEqual(mockStocktakings);
      expect(mockStocktakingRepo.findAllWithDetails).toHaveBeenCalled();
    });

    it("should return empty array when no stocktakings", async () => {
      mockStocktakingRepo.findAllWithDetails.mockResolvedValue([]);

      const result = await usecase.execute();

      expect(result).toEqual([]);
    });

    it("should return stocktakings with full details", async () => {
      const mockStocktakings = [
        {
          id: 1,
          employee: { id: 1, name: "John" },
          details: [
            {
              productId: 100,
              product: { name: "Product A" },
              slot: { name: "A1" },
            },
          ],
        },
      ];
      mockStocktakingRepo.findAllWithDetails.mockResolvedValue(mockStocktakings);

      const result = await usecase.execute();

      expect(result[0]).toHaveProperty("employee");
      expect(result[0]).toHaveProperty("details");
    });
  });

  describe("Edge Cases", () => {
    it("should handle large number of stocktakings", async () => {
      const mockStocktakings = Array.from({ length: 500 }, (_, i) => ({
        id: i + 1,
        employeeId: 1,
      }));
      mockStocktakingRepo.findAllWithDetails.mockResolvedValue(mockStocktakings);

      const result = await usecase.execute();

      expect(result).toHaveLength(500);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      mockStocktakingRepo.findAllWithDetails.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute()).rejects.toThrow("DB Error");
    });
  });
});
