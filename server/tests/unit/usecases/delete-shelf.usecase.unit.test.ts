import { DeleteShelfUsecase } from "../../../src/application/services/shelf/delete-shelf.usecase";

describe("DeleteShelfUsecase Unit Tests", () => {
  let usecase: DeleteShelfUsecase;
  let mockShelfRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockShelfRepo = {
      delete: jest.fn(),
      getByIds: jest.fn(),
    };
    usecase = new DeleteShelfUsecase(mockShelfRepo);
  });

  describe("Success Cases", () => {
    it("should delete shelf successfully", async () => {
      const input = { id: 1, authId: 1 };
      mockShelfRepo.getByIds.mockResolvedValue([{ id: 1, name: "Shelf A" }]);
      mockShelfRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute(input);

      expect(result.success).toBe(true);
      expect(mockShelfRepo.delete).toHaveBeenCalledWith(1);
    });

    it("should delete shelf with large ID", async () => {
      const input = { id: 999999, authId: 1 };
      mockShelfRepo.getByIds.mockResolvedValue([{ id: 999999, name: "Shelf" }]);
      mockShelfRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute(input);

      expect(result.success).toBe(true);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when ID is missing", async () => {
      const input: any = { authId: 1 };

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when ID is negative", async () => {
      const input = { id: -1, authId: 1 };

      await expect(usecase.execute(input)).rejects.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input = { id: 1, authId: 1 };
      mockShelfRepo.getByIds.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });
  });
});
