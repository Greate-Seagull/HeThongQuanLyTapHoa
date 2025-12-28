import { ListSlotWithProductUsecase } from "../../../src/application/services/slot/list-slot-with-product.usecase";

describe("ListSlotWithProductUsecase Unit Tests", () => {
  let usecase: ListSlotWithProductUsecase;
  let mockSlotDetailUsecase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSlotDetailUsecase = {
      getAllWithProduct: jest.fn(),
    };
    usecase = new ListSlotWithProductUsecase(mockSlotDetailUsecase);
  });

  describe("Success Cases", () => {
    it("should list all slots with product information", async () => {
      const mockSlotDetails = [
        {
          slotId: 1,
          slot: {
            name: "A1",
            rackId: 10,
            rack: {
              name: "Rack A",
              shelfId: 100,
              shelf: { name: "Shelf 1" },
            },
          },
          productId: 1000,
          product: {
            name: "Product A",
            price: 10000,
            unit: "piece",
          },
        },
      ];

      mockSlotDetailUsecase.getAllWithProduct.mockResolvedValue(mockSlotDetails);

      const result = await usecase.execute();

      expect(result).toEqual([
        {
          slotId: 1,
          slotName: "A1",
          rackId: 10,
          rackName: "Rack A",
          shelfId: 100,
          shelfName: "Shelf 1",
          productId: 1000,
          productName: "Product A",
          productPrice: 10000,
          productUnit: "piece",
        },
      ]);
    });

    it("should handle multiple slots with products", async () => {
      const mockSlotDetails = [
        {
          slotId: 1,
          slot: {
            name: "A1",
            rackId: 10,
            rack: { name: "Rack A", shelfId: 100, shelf: { name: "Shelf 1" } },
          },
          productId: 1000,
          product: { name: "Product A", price: 10000, unit: "kg" },
        },
        {
          slotId: 2,
          slot: {
            name: "A2",
            rackId: 10,
            rack: { name: "Rack A", shelfId: 100, shelf: { name: "Shelf 1" } },
          },
          productId: 2000,
          product: { name: "Product B", price: 20000, unit: "box" },
        },
      ];

      mockSlotDetailUsecase.getAllWithProduct.mockResolvedValue(mockSlotDetails);

      const result = await usecase.execute();

      expect(result).toHaveLength(2);
      expect(result[0].slotId).toBe(1);
      expect(result[1].slotId).toBe(2);
    });

    it("should return empty array when no slots", async () => {
      mockSlotDetailUsecase.getAllWithProduct.mockResolvedValue([]);

      const result = await usecase.execute();

      expect(result).toEqual([]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle Vietnamese product names", async () => {
      const mockSlotDetails = [
        {
          slotId: 1,
          slot: {
            name: "Ô A1",
            rackId: 10,
            rack: { name: "Ngăn A", shelfId: 100, shelf: { name: "Kệ 1" } },
          },
          productId: 1000,
          product: { name: "Bánh mì", price: 15000, unit: "cái" },
        },
      ];

      mockSlotDetailUsecase.getAllWithProduct.mockResolvedValue(mockSlotDetails);

      const result = await usecase.execute();

      expect(result[0].productName).toBe("Bánh mì");
      expect(result[0].slotName).toBe("Ô A1");
    });

    it("should handle large dataset", async () => {
      const mockSlotDetails = Array.from({ length: 500 }, (_, i) => ({
        slotId: i + 1,
        slot: {
          name: `Slot ${i + 1}`,
          rackId: 1,
          rack: { name: "Rack 1", shelfId: 1, shelf: { name: "Shelf 1" } },
        },
        productId: i + 1000,
        product: { name: `Product ${i}`, price: 10000, unit: "piece" },
      }));

      mockSlotDetailUsecase.getAllWithProduct.mockResolvedValue(mockSlotDetails);

      const result = await usecase.execute();

      expect(result).toHaveLength(500);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      mockSlotDetailUsecase.getAllWithProduct.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute()).rejects.toThrow("DB Error");
    });
  });
});
