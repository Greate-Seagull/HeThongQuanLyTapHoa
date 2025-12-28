import { SlotDetailUsecase } from "../../../src/application/services/slot/slot-detail.usecase";

describe("SlotDetailUsecase Unit Tests", () => {
  let usecase: SlotDetailUsecase;
  let mockSlotDetailRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSlotDetailRepo = {
      add: jest.fn(),
      update: jest.fn(),
      getBySlotId: jest.fn(),
      getAllWithProduct: jest.fn(),
      deleteBySlotId: jest.fn(),
    };
    usecase = new SlotDetailUsecase(mockSlotDetailRepo);
  });

  describe("add", () => {
    it("should add slot detail successfully", async () => {
      const slotId = 1;
      const productId = 100;
      const mockResult = { id: 1, slotId, productId };
      mockSlotDetailRepo.add.mockResolvedValue(mockResult);

      const result = await usecase.add(slotId, productId);

      expect(result).toEqual(mockResult);
      expect(mockSlotDetailRepo.add).toHaveBeenCalledWith(slotId, productId);
    });

    it("should handle large IDs", async () => {
      mockSlotDetailRepo.add.mockResolvedValue({ id: 1 });

      await usecase.add(999999, 888888);

      expect(mockSlotDetailRepo.add).toHaveBeenCalledWith(999999, 888888);
    });
  });

  describe("update", () => {
    it("should update slot detail successfully", async () => {
      const slotId = 1;
      const productId = 200;
      const mockResult = { id: 1, slotId, productId };
      mockSlotDetailRepo.update.mockResolvedValue(mockResult);

      const result = await usecase.update(slotId, productId);

      expect(result).toEqual(mockResult);
      expect(mockSlotDetailRepo.update).toHaveBeenCalledWith(slotId, productId);
    });
  });

  describe("getBySlotId", () => {
    it("should get slot detail by slotId", async () => {
      const slotId = 1;
      const mockDetail = { id: 1, slotId, productId: 100 };
      mockSlotDetailRepo.getBySlotId.mockResolvedValue(mockDetail);

      const result = await usecase.getBySlotId(slotId);

      expect(result).toEqual(mockDetail);
      expect(mockSlotDetailRepo.getBySlotId).toHaveBeenCalledWith(slotId);
    });

    it("should return null when slot detail not found", async () => {
      mockSlotDetailRepo.getBySlotId.mockResolvedValue(null);

      const result = await usecase.getBySlotId(999);

      expect(result).toBeNull();
    });
  });

  describe("getAllWithProduct", () => {
    it("should get all slot details with product info", async () => {
      const mockDetails = [
        { slotId: 1, productId: 100, product: { name: "Product A" } },
        { slotId: 2, productId: 200, product: { name: "Product B" } },
      ];
      mockSlotDetailRepo.getAllWithProduct.mockResolvedValue(mockDetails);

      const result = await usecase.getAllWithProduct();

      expect(result).toEqual(mockDetails);
      expect(mockSlotDetailRepo.getAllWithProduct).toHaveBeenCalled();
    });

    it("should return empty array when no details", async () => {
      mockSlotDetailRepo.getAllWithProduct.mockResolvedValue([]);

      const result = await usecase.getAllWithProduct();

      expect(result).toEqual([]);
    });
  });

  describe("deleteBySlotId", () => {
    it("should delete slot detail by slotId", async () => {
      const slotId = 1;
      mockSlotDetailRepo.deleteBySlotId.mockResolvedValue(undefined);

      await usecase.deleteBySlotId(slotId);

      expect(mockSlotDetailRepo.deleteBySlotId).toHaveBeenCalledWith(slotId);
    });
  });

  describe("Error Handling", () => {
    it("should handle add errors", async () => {
      mockSlotDetailRepo.add.mockRejectedValue(new Error("Add Error"));

      await expect(usecase.add(1, 100)).rejects.toThrow("Add Error");
    });

    it("should handle update errors", async () => {
      mockSlotDetailRepo.update.mockRejectedValue(new Error("Update Error"));

      await expect(usecase.update(1, 100)).rejects.toThrow("Update Error");
    });
  });
});
