import { UpdateSlotUsecase } from "../../../src/application/services/slot/update-slot.usecase";
import { Slot } from "../../../src/domain/entities/slot";

describe("UpdateSlotUsecase Unit Tests", () => {
  let usecase: UpdateSlotUsecase;
  let mockSlotRepo: any;
  let mockSlotDetailUsecase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSlotRepo = {
      update: jest.fn(),
      getById: jest.fn(),
    };
    mockSlotDetailUsecase = {
      update: jest.fn(),
      deleteBySlotId: jest.fn(),
    };
    usecase = new UpdateSlotUsecase(mockSlotRepo, mockSlotDetailUsecase);
  });

  describe("Success Cases", () => {
    it("should update slot name successfully", async () => {
      const input = { id: 1, name: "Updated Slot", authId: 1 };
      const oldSlot = Slot.create({ id: 1, rackId: 1, name: "Old" });
      mockSlotRepo.getById.mockResolvedValue(oldSlot);
      mockSlotRepo.update.mockResolvedValue({ id: 1, name: "Updated Slot" });

      const result = await usecase.execute(input);

      expect(result.slotId).toBe(1);
      expect(mockSlotRepo.update).toHaveBeenCalled();
    });

    it("should update slot with productId", async () => {
      const input = { id: 1, name: "Slot A", productId: 100, authId: 1 };
      const oldSlot = Slot.create({ id: 1, rackId: 1, name: "Old" });
      mockSlotRepo.getById.mockResolvedValue(oldSlot);
      mockSlotRepo.update.mockResolvedValue({ id: 1 });
      mockSlotDetailUsecase.update.mockResolvedValue(undefined);

      const result = await usecase.execute(input);

      expect(result.slotId).toBe(1);
      expect(mockSlotDetailUsecase.update).toHaveBeenCalledWith(1, 100, undefined); // Thêm quantity = undefined
    });

    it("should update slot with productId and quantity", async () => {
      const input = { id: 1, name: "Slot A", productId: 100, quantity: 200, authId: 1 };
      const oldSlot = Slot.create({ id: 1, rackId: 1, name: "Old" });
      mockSlotRepo.getById.mockResolvedValue(oldSlot);
      mockSlotRepo.update.mockResolvedValue({ id: 1 });
      mockSlotDetailUsecase.update.mockResolvedValue(undefined);

      const result = await usecase.execute(input);

      expect(result.slotId).toBe(1);
      expect(mockSlotDetailUsecase.update).toHaveBeenCalledWith(1, 100, 200);
    });

    it("should update slot with Vietnamese name", async () => {
      const input = { id: 1, name: "Ô mới", authId: 1 };
      const oldSlot = Slot.create({ id: 1, rackId: 1, name: "Old" });
      mockSlotRepo.getById.mockResolvedValue(oldSlot);
      mockSlotRepo.update.mockResolvedValue({ id: 1 });

      const result = await usecase.execute(input);

      expect(result.slotId).toBe(1);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when ID is missing", async () => {
      const input: any = { name: "Slot", authId: 1 };

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when slot does not exist", async () => {
      const input = { id: 999, name: "Slot", authId: 1 };
      mockSlotRepo.getById.mockResolvedValue(null);

      await expect(usecase.execute(input)).rejects.toThrow("Slot with id 999 not found");
    });

    it("should throw error when name is empty", async () => {
      const input = { id: 1, name: "", authId: 1 };
      const oldSlot = Slot.create({ id: 1, rackId: 1, name: "Old" });
      mockSlotRepo.getById.mockResolvedValue(oldSlot);

      await expect(usecase.execute(input)).rejects.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input = { id: 1, name: "Slot", authId: 1 };
      mockSlotRepo.getById.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });
  });
});
