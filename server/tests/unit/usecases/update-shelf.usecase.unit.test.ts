import { UpdateShelfUsecase } from "../../../src/application/services/shelf/update-shelf.usecase";
import { Shelf } from "../../../src/domain/entities/shelf";

describe("UpdateShelfUsecase Unit Tests", () => {
  let usecase: UpdateShelfUsecase;
  let mockShelfRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockShelfRepo = {
      update: jest.fn(),
      getByIds: jest.fn(),
    };
    usecase = new UpdateShelfUsecase(mockShelfRepo);
  });

  describe("Success Cases", () => {
    it("should update shelf name successfully", async () => {
      const input = { id: 1, name: "Updated Shelf", authId: 1 };
      const oldShelf = Shelf.create({ id: 1, name: "Old" });
      const mockShelf = { id: 1, name: "Updated Shelf" };
      mockShelfRepo.getByIds.mockResolvedValue([oldShelf]);
      mockShelfRepo.update.mockResolvedValue(mockShelf);

      const result = await usecase.execute(input);

      expect(result.shelfId).toBe(1);
      expect(mockShelfRepo.update).toHaveBeenCalled();
    });

    it("should update shelf with Vietnamese name", async () => {
      const input = { id: 1, name: "Kệ mới", authId: 1 };
      const oldShelf = Shelf.create({ id: 1, name: "Old" });
      const mockShelf = { id: 1, name: "Kệ mới" };
      mockShelfRepo.getByIds.mockResolvedValue([oldShelf]);
      mockShelfRepo.update.mockResolvedValue(mockShelf);

      const result = await usecase.execute(input);

      expect(result.shelfId).toBe(1);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when ID is missing", async () => {
      const input: any = { name: "Shelf", authId: 1 };

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when name is empty", async () => {
      const input = { id: 1, name: "", authId: 1 };

      await expect(usecase.execute(input)).rejects.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input = { id: 1, name: "Shelf", authId: 1 };
      mockShelfRepo.getByIds.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });
  });
});
