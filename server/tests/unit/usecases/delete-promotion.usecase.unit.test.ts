import { DeletePromotionUsecase } from "../../../src/application/services/promotion/delete-promotion.usecase";

describe("DeletePromotionUsecase Unit Tests", () => {
  let usecase: DeletePromotionUsecase;
  let mockPromotionRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPromotionRepo = {
      delete: jest.fn(),
      getByIds: jest.fn(),
    };
    usecase = new DeletePromotionUsecase(mockPromotionRepo);
  });

  describe("Success Cases", () => {
    it("should delete promotion successfully", async () => {
      const input = { id: 1, authId: 1 };
      mockPromotionRepo.getByIds.mockResolvedValue([{ id: 1, name: "Sale" }]);
      mockPromotionRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute(input);

      expect(result.success).toBe(true);
      expect(mockPromotionRepo.delete).toHaveBeenCalledWith(1);
    });

    it("should delete promotion with large ID", async () => {
      const input = { id: 999999, authId: 1 };
      mockPromotionRepo.getByIds.mockResolvedValue([{ id: 999999 }]);
      mockPromotionRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute(input);

      expect(result.success).toBe(true);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when promotion not found", async () => {
      const input = { id: 999, authId: 1 };
      mockPromotionRepo.getByIds.mockResolvedValue([]);

      await expect(usecase.execute(input)).rejects.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input = { id: 1, authId: 1 };
      mockPromotionRepo.getByIds.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });
  });
});
