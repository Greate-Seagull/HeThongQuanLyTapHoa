import { GetStocktakingByIdUsecase } from "../../../src/application/services/stocktaking/get-stocktaking-by-id.usecase";

describe("GetStocktakingByIdUsecase Unit Tests", () => {
  let usecase: GetStocktakingByIdUsecase;
  let mockStocktakingRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStocktakingRepo = {
      findByIdWithDetails: jest.fn(),
    };
    usecase = new GetStocktakingByIdUsecase(mockStocktakingRepo);
  });

  describe("Success Cases", () => {
    it("should get stocktaking by id successfully", async () => {
      const mockStocktaking = {
        id: 1,
        employeeId: 1,
        createdAt: new Date(),
        details: [{ productId: 100, quantity: 50, status: "GOOD" }],
      };
      mockStocktakingRepo.findByIdWithDetails.mockResolvedValue(mockStocktaking);

      const result = await usecase.execute({ id: 1 });

      expect(result).toEqual(mockStocktaking);
      expect(mockStocktakingRepo.findByIdWithDetails).toHaveBeenCalledWith(1);
    });

    it("should return null when stocktaking not found", async () => {
      mockStocktakingRepo.findByIdWithDetails.mockResolvedValue(null);

      const result = await usecase.execute({ id: 999 });

      expect(result).toBeNull();
    });

    it("should get stocktaking with multiple details", async () => {
      const mockStocktaking = {
        id: 1,
        stocktakingDetails: [
          { productId: 100, quantity: 50 },
          { productId: 101, quantity: 30 },
        ],
      };
      mockStocktakingRepo.findByIdWithDetails.mockResolvedValue(mockStocktaking);

      const result = await usecase.execute({ id: 1 });

      expect(result.stocktakingDetails).toHaveLength(2);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      mockStocktakingRepo.findByIdWithDetails.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute({ id: 1 })).rejects.toThrow("DB Error");
    });
  });
});
