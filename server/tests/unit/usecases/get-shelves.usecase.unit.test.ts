import { GetShelvesUsecase } from "../../../src/application/services/shelf/get-shelves.usecase";

describe("GetShelvesUsecase Unit Tests", () => {
  let usecase: GetShelvesUsecase;
  let mockShelfRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockShelfRepo = {
      getAll: jest.fn(),
    };
    usecase = new GetShelvesUsecase(mockShelfRepo);
  });

  describe("Success Cases", () => {
    it("should get all shelves successfully", async () => {
      const mockShelves = [
        { id: 1, name: "Shelf A" },
        { id: 2, name: "Shelf B" },
      ];
      mockShelfRepo.getAll.mockResolvedValue(mockShelves);

      const result = await usecase.execute();

      expect(result).toEqual(mockShelves);
      expect(result.length).toBe(2);
    });

    it("should return empty array when no shelves", async () => {
      mockShelfRepo.getAll.mockResolvedValue([]);

      const result = await usecase.execute();

      expect(result).toEqual([]);
    });

    it("should handle large dataset", async () => {
      const mockShelves = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Shelf ${i + 1}`,
      }));
      mockShelfRepo.getAll.mockResolvedValue(mockShelves);

      const result = await usecase.execute();

      expect(result.length).toBe(100);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      mockShelfRepo.getAll.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute()).rejects.toThrow("DB Error");
    });
  });
});
