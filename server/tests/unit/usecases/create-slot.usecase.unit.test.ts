import { CreateSlotUsecase } from "../../../src/application/services/slot/create-slot.usecase";
import { Slot } from "../../../src/domain/entities/slot";

describe("CreateSlotUsecase Unit Tests", () => {
  let usecase: CreateSlotUsecase;
  let mockSlotRepo: any;
  let mockRackRepo: any;
  let mockSlotDetailUsecase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSlotRepo = {
      add: jest.fn(),
    };
    mockRackRepo = {
      getByIds: jest.fn(),
    };
    mockSlotDetailUsecase = {
      add: jest.fn(),
    };
    usecase = new CreateSlotUsecase(mockSlotRepo, mockRackRepo, mockSlotDetailUsecase);
  });

  describe("Success Cases", () => {
    it("should create slot successfully without productId", async () => {
      const input = { rackId: 1, name: "Slot A1", authId: 1 };
      const mockSlot = { id: 1, rackId: 1, name: "Slot A1" };
      mockRackRepo.getByIds.mockResolvedValue([{ id: 1, name: "Rack A" }]);
      mockSlotRepo.add.mockResolvedValue(mockSlot);

      const result = await usecase.execute(input);

      expect(result.slotId).toBe(1);
      expect(mockRackRepo.getByIds).toHaveBeenCalledWith([1]);
      expect(mockSlotRepo.add).toHaveBeenCalled();
      expect(mockSlotDetailUsecase.add).not.toHaveBeenCalled();
    });

    it("should create slot with productId", async () => {
      const input = { rackId: 1, name: "Slot A1", productId: 100, authId: 1 };
      const mockSlot = { id: 1, rackId: 1, name: "Slot A1" };
      mockRackRepo.getByIds.mockResolvedValue([{ id: 1, name: "Rack A" }]);
      mockSlotRepo.add.mockResolvedValue(mockSlot);
      mockSlotDetailUsecase.add.mockResolvedValue(undefined);

      const result = await usecase.execute(input);

      expect(result.slotId).toBe(1);
      expect(mockSlotDetailUsecase.add).toHaveBeenCalledWith(1, 100);
    });

    it("should create slot with Vietnamese name", async () => {
      const input = { rackId: 1, name: "Ô chứa A1", authId: 1 };
      const mockSlot = { id: 2, rackId: 1, name: "Ô chứa A1" };
      mockRackRepo.getByIds.mockResolvedValue([{ id: 1, name: "Rack A" }]);
      mockSlotRepo.add.mockResolvedValue(mockSlot);

      const result = await usecase.execute(input);

      expect(result.slotId).toBe(2);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when name is empty", async () => {
      const input = { rackId: 1, name: "", authId: 1 };

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when rackId is missing", async () => {
      const input: any = { name: "Slot A", authId: 1 };

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when rack does not exist", async () => {
      const input = { rackId: 999, name: "Slot A", authId: 1 };
      mockRackRepo.getByIds.mockResolvedValue([]);

      await expect(usecase.execute(input)).rejects.toThrow("Rack with id 999 not found");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input = { rackId: 1, name: "Slot A", authId: 1 };
      mockRackRepo.getByIds.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });

    it("should handle slotDetail creation error", async () => {
      const input = { rackId: 1, name: "Slot A", productId: 100, authId: 1 };
      const mockSlot = { id: 1, rackId: 1, name: "Slot A" };
      mockRackRepo.getByIds.mockResolvedValue([{ id: 1 }]);
      mockSlotRepo.add.mockResolvedValue(mockSlot);
      mockSlotDetailUsecase.add.mockRejectedValue(new Error("SlotDetail Error"));

      await expect(usecase.execute(input)).rejects.toThrow("SlotDetail Error");
    });
  });
});
