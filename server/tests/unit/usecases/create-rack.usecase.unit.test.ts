import { CreateRackUsecase } from "../../../src/application/services/rack/create-rack.usecase";

describe("CreateRackUsecase Unit Tests", () => {
  let usecase: CreateRackUsecase;
  let mockRackRepo: any;
  let mockShelfRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRackRepo = {
      add: jest.fn(),
    };
    mockShelfRepo = {
      getByIds: jest.fn(),
    };
    usecase = new CreateRackUsecase(mockRackRepo, mockShelfRepo);
  });

  describe("Success Cases", () => {
    it("should create rack successfully", async () => {
      const input = { shelfId: 1, name: "Rack A", authId: 1 };
      const mockRack = { id: 1, shelfId: 1, name: "Rack A" };
      mockShelfRepo.getByIds.mockResolvedValue([{ id: 1, name: "Shelf A" }]);
      mockRackRepo.add.mockResolvedValue(mockRack);

      const result = await usecase.execute(input);

      expect(result.rackId).toBe(1);
      expect(mockRackRepo.add).toHaveBeenCalled();
    });

    it("should create rack with Vietnamese name", async () => {
      const input = { shelfId: 1, name: "Ngăn A", authId: 1 };
      const mockRack = { id: 2, shelfId: 1, name: "Ngăn A" };
      mockShelfRepo.getByIds.mockResolvedValue([{ id: 1, name: "Shelf A" }]);
      mockRackRepo.add.mockResolvedValue(mockRack);

      const result = await usecase.execute(input);

      expect(result.rackId).toBe(2);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when name is empty", async () => {
      const input = { shelfId: 1, name: "", authId: 1 };

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when shelfId is missing", async () => {
      const input: any = { name: "Rack A", authId: 1 };

      await expect(usecase.execute(input)).rejects.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input = { shelfId: 1, name: "Rack A", authId: 1 };
      mockShelfRepo.getByIds.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });
  });
});
