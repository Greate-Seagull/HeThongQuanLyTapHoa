import { CreatePromotionUsecase } from "../../../src/application/services/promotion/create-promotion.usecase";

describe("CreatePromotionUsecase Unit Tests", () => {
  let usecase: CreatePromotionUsecase;
  let mockProductReadAccessor: any;
  let mockPromotionRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProductReadAccessor = {
      getByIds: jest.fn(),
      existByIds: jest.fn(),
    };
    mockPromotionRepo = {
      add: jest.fn(),
      addPromotionDetails: jest.fn(),
    };
    usecase = new CreatePromotionUsecase(mockProductReadAccessor, mockPromotionRepo);
  });

  describe("Success Cases", () => {
    it("should create promotion successfully", async () => {
      const input = {
        authId: 1,
        name: "Summer Sale",
        description: "Big sale",
        startedAt: "2025-06-01",
        endedAt: "2025-06-30",
        value: 20,
        promotionType: "PERCENTAGE",
        promotionDetails: [{ productId: 1 }],
      };
      mockProductReadAccessor.existByIds.mockResolvedValue(true);
      mockPromotionRepo.add.mockResolvedValue({ id: 1 });
      mockPromotionRepo.addPromotionDetails.mockResolvedValue(undefined);

      const result = await usecase.execute(input);

      expect(result.promotionId).toBe(1);
      expect(mockPromotionRepo.add).toHaveBeenCalled();
    });

    it("should create promotion with fixed amount type", async () => {
      const input = {
        authId: 1,
        name: "Fixed Discount",
        startedAt: "2025-06-01",
        endedAt: "2025-06-30",
        value: 10000,
        promotionType: "FIXED",
        promotionDetails: [],
      };
      mockProductReadAccessor.existByIds.mockResolvedValue(true);
      mockPromotionRepo.add.mockResolvedValue({ id: 2 });

      const result = await usecase.execute(input);

      expect(result.promotionId).toBe(2);
    });

    it("should create promotion with Vietnamese name", async () => {
      const input = {
        authId: 1,
        name: "Khuyến mãi tết",
        startedAt: "2025-01-01",
        endedAt: "2025-01-31",
        value: 15,
        promotionType: "PERCENTAGE",
        promotionDetails: [],
      };
      mockProductReadAccessor.existByIds.mockResolvedValue(true);
      mockPromotionRepo.add.mockResolvedValue({ id: 3 });

      const result = await usecase.execute(input);

      expect(result.promotionId).toBe(3);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when name is missing", async () => {
      const input = {
        authId: 1,
        startedAt: "2025-06-01",
        endedAt: "2025-06-30",
        value: 20,
        promotionType: "PERCENTAGE",
      };

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when value is negative", async () => {
      const input = {
        authId: 1,
        name: "Invalid",
        startedAt: "2025-06-01",
        endedAt: "2025-06-30",
        value: -10,
        promotionType: "PERCENTAGE",
      };
      mockProductReadAccessor.existByIds.mockResolvedValue(true);

      await expect(usecase.execute(input)).rejects.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input = {
        authId: 1,
        name: "Promotion",
        startedAt: "2025-06-01",
        endedAt: "2025-06-30",
        value: 20,
        promotionType: "PERCENTAGE",
        promotionDetails: [],
      };
      mockProductReadAccessor.existByIds.mockResolvedValue(true);
      mockPromotionRepo.add.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });
  });
});
