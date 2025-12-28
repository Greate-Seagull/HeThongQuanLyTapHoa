import { DeleteSlotUsecase } from "../../../src/application/services/slot/delete-slot.usecase";

describe("DeleteSlotUsecase Unit Tests", () => {
  let usecase: DeleteSlotUsecase;
  let mockSlotRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSlotRepo = {
      delete: jest.fn(),
      getByIds: jest.fn(),
    };
    usecase = new DeleteSlotUsecase(mockSlotRepo);
  });

  describe("Success Cases", () => {
    it("should delete slot successfully", async () => {
      const input = { id: 1, authId: 1 };
      mockSlotRepo.getByIds.mockResolvedValue([{ id: 1, name: "Slot A" }]);
      mockSlotRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute(input);

      expect(result.success).toBe(true);
      expect(mockSlotRepo.getByIds).toHaveBeenCalledWith([1]);
      expect(mockSlotRepo.delete).toHaveBeenCalledWith(1);
    });

    it("should delete slot with large ID", async () => {
      const input = { id: 999999, authId: 1 };
      mockSlotRepo.getByIds.mockResolvedValue([{ id: 999999 }]);
      mockSlotRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute(input);

      expect(result.success).toBe(true);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when ID is missing", async () => {
      const input: any = { authId: 1 };

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when slot does not exist", async () => {
      const input = { id: 999, authId: 1 };
      mockSlotRepo.getByIds.mockResolvedValue([]);

      await expect(usecase.execute(input)).rejects.toThrow("Slot with id 999 not found");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input = { id: 1, authId: 1 };
      mockSlotRepo.getByIds.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });
  });
});
