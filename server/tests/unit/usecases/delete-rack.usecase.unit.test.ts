import { DeleteRackUsecase } from "../../../src/application/services/rack/delete-rack.usecase";

describe("DeleteRackUsecase Unit Tests", () => {
  let usecase: DeleteRackUsecase;
  let mockRackRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRackRepo = {
      delete: jest.fn(),
      getByIds: jest.fn(),
    };
    usecase = new DeleteRackUsecase(mockRackRepo);
  });

  describe("Success Cases", () => {
    it("should delete rack successfully", async () => {
      const input = { id: 1, authId: 1 };
      mockRackRepo.getByIds.mockResolvedValue([{ id: 1, name: "Rack A" }]);
      mockRackRepo.delete.mockResolvedValue(undefined);

      const result = await usecase.execute(input);

      expect(result.success).toBe(true);
      expect(mockRackRepo.delete).toHaveBeenCalledWith(1);
    });

    it("should delete rack with large ID", async () => {
      const input = { id: 999999, authId: 1 };
      mockRackRepo.getByIds.mockResolvedValue([{ id: 999999, name: "Rack" }]);
      mockRackRepo.delete.mockResolvedValue(undefined);

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
      mockRackRepo.getByIds.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });
  });
});
