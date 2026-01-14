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
      transferProduct: jest.fn(),
      updateQuantity: jest.fn(),
    };
    usecase = new SlotDetailUsecase(mockSlotDetailRepo);
  });

  describe("add", () => {
    it("should add slot detail successfully", async () => {
      const slotId = 1;
      const productId = 100;
      const mockResult = { id: 1, slotId, productId, quantity: 0 };
      mockSlotDetailRepo.add.mockResolvedValue(mockResult);

      const result = await usecase.add(slotId, productId);

      expect(result).toEqual(mockResult);
      expect(mockSlotDetailRepo.add).toHaveBeenCalledWith(slotId, productId, 0); // quantity default = 0
    });

    it("should handle large IDs", async () => {
      mockSlotDetailRepo.add.mockResolvedValue({ id: 1 });

      await usecase.add(999999, 888888);

      expect(mockSlotDetailRepo.add).toHaveBeenCalledWith(999999, 888888, 0); // quantity default = 0
    });
  });

  describe("update", () => {
    it("should update slot detail successfully", async () => {
      const slotId = 1;
      const productId = 200;
      const mockResult = { id: 1, slotId, productId, quantity: 5 };
      mockSlotDetailRepo.update.mockResolvedValue(mockResult);

      const result = await usecase.update(slotId, productId);

      expect(result).toEqual(mockResult);
      expect(mockSlotDetailRepo.update).toHaveBeenCalledWith(slotId, productId, undefined); // quantity optional
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

  describe("transferProduct", () => {
    it("should transfer product successfully", async () => {
      const mockResult = {
        source: { slotId: 1, productId: 100, quantity: 5 },
        target: { slotId: 2, productId: 100, quantity: 10 },
        transferredQuantity: 5,
      };
      mockSlotDetailRepo.transferProduct.mockResolvedValue(mockResult);

      const result = await usecase.transferProduct(1, 2, 100, 5);

      expect(result).toEqual(mockResult);
      expect(mockSlotDetailRepo.transferProduct).toHaveBeenCalledWith(1, 2, 100, 5);
    });

    it("should throw error when quantity is zero", async () => {
      mockSlotDetailRepo.transferProduct.mockRejectedValue(
        new Error("Quantity must be greater than 0")
      );

      await expect(usecase.transferProduct(1, 2, 100, 0)).rejects.toThrow(
        "Quantity must be greater than 0"
      );
    });

    it("should throw error when not enough quantity", async () => {
      mockSlotDetailRepo.transferProduct.mockRejectedValue(
        new Error("Not enough quantity in source slot. Available: 3, Requested: 5")
      );

      await expect(usecase.transferProduct(1, 2, 100, 5)).rejects.toThrow(
        "Not enough quantity in source slot"
      );
    });
  });

  describe("updateQuantity", () => {
    it("should update quantity successfully", async () => {
      const mockResult = { slotId: 1, productId: 100, quantity: 20 };
      mockSlotDetailRepo.updateQuantity.mockResolvedValue(mockResult);

      const result = await usecase.updateQuantity(1, 100, 20);

      expect(result).toEqual(mockResult);
      expect(mockSlotDetailRepo.updateQuantity).toHaveBeenCalledWith(1, 100, 20);
    });

    it("should handle quantity = 0 (delete)", async () => {
      mockSlotDetailRepo.updateQuantity.mockResolvedValue(null);

      const result = await usecase.updateQuantity(1, 100, 0);

      expect(result).toBeNull();
    });

    it("should throw error for negative quantity", async () => {
      mockSlotDetailRepo.updateQuantity.mockRejectedValue(
        new Error("Quantity cannot be negative")
      );

      await expect(usecase.updateQuantity(1, 100, -5)).rejects.toThrow(
        "Quantity cannot be negative"
      );
    });
  });
});
