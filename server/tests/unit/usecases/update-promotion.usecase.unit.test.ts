import { UpdatePromotionUsecase } from "../../../src/application/services/promotion/update-promotion.usecase";

describe("UpdatePromotionUsecase Unit Tests", () => {
  let usecase: UpdatePromotionUsecase;
  let mockProductReadAccessor: any;
  let mockPromotionRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProductReadAccessor = {
      existByIds: jest.fn(),
    };
    mockPromotionRepo = {
      update: jest.fn(),
      getByIds: jest.fn(),
    };
    usecase = new UpdatePromotionUsecase(mockProductReadAccessor, mockPromotionRepo);
  });

  describe("Success Cases", () => {
    it("should update promotion name successfully", async () => {
      const input = { id: 1, name: "Updated Sale", authId: 1 };
      const mockPromotion = {
        id: 1,
        name: "Old Sale",
        update: jest.fn(),
      };
      mockPromotionRepo.getByIds.mockResolvedValue([mockPromotion]);
      mockProductReadAccessor.existByIds.mockResolvedValue(true);
      mockPromotionRepo.update.mockResolvedValue({ id: 1, name: "Updated Sale" });

      const result = await usecase.execute(input);

      expect(mockPromotion.update).toHaveBeenCalledWith(expect.objectContaining({ id: 1, name: "Updated Sale" }));
      expect(result.promotionId).toBe(1);
      expect(mockPromotionRepo.update).toHaveBeenCalled();
    });

    it("should update promotion value", async () => {
      const input = { id: 1, value: 25, authId: 1 };
      const mockPromotion = {
        id: 1,
        value: 20,
        update: jest.fn(),
      };
      mockPromotionRepo.getByIds.mockResolvedValue([mockPromotion]);
      mockProductReadAccessor.existByIds.mockResolvedValue(true);
      mockPromotionRepo.update.mockResolvedValue({ id: 1 });

      const result = await usecase.execute(input);

      expect(mockPromotion.update).toHaveBeenCalled();
      expect(result.promotionId).toBe(1);
    });

    it("should update promotion dates", async () => {
      const input = {
        id: 1,
        startedAt: "2025-07-01",
        endedAt: "2025-07-31",
        authId: 1,
      };
      const mockPromotion = {
        id: 1,
        update: jest.fn(),
      };
      mockPromotionRepo.getByIds.mockResolvedValue([mockPromotion]);
      mockProductReadAccessor.existByIds.mockResolvedValue(true);
      mockPromotionRepo.update.mockResolvedValue({ id: 1 });

      const result = await usecase.execute(input);

      expect(mockPromotion.update).toHaveBeenCalled();
      expect(result.promotionId).toBe(1);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when promotion not found", async () => {
      const input = { id: 999, name: "Updated", authId: 1 };
      mockPromotionRepo.getByIds.mockResolvedValue([]);

      await expect(usecase.execute(input)).rejects.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input = { id: 1, name: "Updated", authId: 1 };
      mockPromotionRepo.getByIds.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });
  });
});
