import { CreateShelfUsecase } from "../../../src/application/services/shelf/create-shelf.usecase";

describe("CreateShelfUsecase Unit Tests", () => {
  let usecase: CreateShelfUsecase;
  let mockShelfRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockShelfRepo = {
      add: jest.fn(),
    };
    usecase = new CreateShelfUsecase(mockShelfRepo);
  });

  describe("Success Cases", () => {
    it("should create shelf successfully", async () => {
      const input = { name: "Shelf A", authId: 1 };
      const mockShelf = { id: 1, name: "Shelf A" };
      mockShelfRepo.add.mockResolvedValue(mockShelf);

      const result = await usecase.execute(input);

      expect(result.shelfId).toBe(1);
      expect(mockShelfRepo.add).toHaveBeenCalled();
    });

    it("should create shelf with Vietnamese name", async () => {
      const input = { name: "Kệ hàng A", authId: 1 };
      const mockShelf = { id: 2, name: "Kệ hàng A" };
      mockShelfRepo.add.mockResolvedValue(mockShelf);

      const result = await usecase.execute(input);

      expect(result.shelfId).toBe(2);
    });

    it("should create shelf with long name", async () => {
      const longName = "A".repeat(100);
      const input = { name: longName, authId: 1 };
      const mockShelf = { id: 3, name: longName };
      mockShelfRepo.add.mockResolvedValue(mockShelf);

      const result = await usecase.execute(input);

      expect(result.shelfId).toBe(3);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when name is empty", async () => {
      const input = { name: "", authId: 1 };

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when name is missing", async () => {
      const input: any = { authId: 1 };

      await expect(usecase.execute(input)).rejects.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input = { name: "Shelf A", authId: 1 };
      mockShelfRepo.add.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });
  });
});
