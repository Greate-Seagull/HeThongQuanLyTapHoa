import { UpdateRackUsecase } from "../../../src/application/services/rack/update-rack.usecase";
import { Rack } from "../../../src/domain/entities/rack";

describe("UpdateRackUsecase Unit Tests", () => {
  let usecase: UpdateRackUsecase;
  let mockRackRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRackRepo = {
      update: jest.fn(),
      getByIds: jest.fn(),
    };
    usecase = new UpdateRackUsecase(mockRackRepo);
  });

  describe("Success Cases", () => {
    it("should update rack name successfully", async () => {
      const input = { id: 1, name: "Updated Rack", authId: 1 };
      const oldRack = Rack.create({ id: 1, shelfId: 1, name: "Old" });
      const mockRack = { id: 1, name: "Updated Rack" };
      mockRackRepo.getByIds.mockResolvedValue([oldRack]);
      mockRackRepo.update.mockResolvedValue(mockRack);

      const result = await usecase.execute(input);

      expect(result.rackId).toBe(1);
      expect(mockRackRepo.update).toHaveBeenCalled();
    });

    it("should update rack with Vietnamese name", async () => {
      const input = { id: 1, name: "Ngăn mới", authId: 1 };
      const oldRack = Rack.create({ id: 1, shelfId: 1, name: "Old" });
      const mockRack = { id: 1, name: "Ngăn mới" };
      mockRackRepo.getByIds.mockResolvedValue([oldRack]);
      mockRackRepo.update.mockResolvedValue(mockRack);

      const result = await usecase.execute(input);

      expect(result.rackId).toBe(1);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when ID is missing", async () => {
      const input: any = { name: "Rack", authId: 1 };

      await expect(usecase.execute(input)).rejects.toThrow();
    });

    it("should throw error when name is empty", async () => {
      const input = { id: 1, name: "", authId: 1 };

      await expect(usecase.execute(input)).rejects.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      const input = { id: 1, name: "Rack", authId: 1 };
      mockRackRepo.getByIds.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(input)).rejects.toThrow("DB Error");
    });
  });
});
