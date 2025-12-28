import { UpdateEmployeeUsecase } from "../../../src/application/services/employee/update-employee.usecase";

// Mock prisma
jest.mock("../../../src/composition-root", () => ({
  prisma: {
    employee: {
      update: jest.fn(),
    },
  },
}));

import { prisma } from "../../../src/composition-root";

describe("UpdateEmployeeUsecase Unit Tests", () => {
  let usecase: UpdateEmployeeUsecase;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = prisma;
    usecase = new UpdateEmployeeUsecase();
    jest.clearAllMocks();
  });

  describe("Success Cases", () => {
    it("should update employee successfully", async () => {
      const mockEmployee = {
        id: 1,
        name: "Nguyễn Văn A",
        position: "SALES",
      };

      mockPrisma.employee.update.mockResolvedValue(mockEmployee);

      const result = await usecase.execute({
        id: 1,
        name: "Nguyễn Văn A",
        position: "SALES",
      });

      expect(mockPrisma.employee.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: "Nguyễn Văn A",
          position: "SALES",
        },
      });
      expect(result.name).toBe("Nguyễn Văn A");
      expect(result.position).toBe("SALES");
    });

    it("should update employee to MANAGER position", async () => {
      mockPrisma.employee.update.mockResolvedValue({
        id: 2,
        name: "Trần Thị B",
        position: "MANAGER",
      });

      const result = await usecase.execute({
        id: 2,
        name: "Trần Thị B",
        position: "MANAGER",
      });

      expect(result.position).toBe("MANAGER");
    });

    it("should update employee to INVENTORY position", async () => {
      mockPrisma.employee.update.mockResolvedValue({
        id: 3,
        name: "Lê Văn C",
        position: "INVENTORY",
      });

      await usecase.execute({
        id: 3,
        name: "Lê Văn C",
        position: "INVENTORY",
      });

      expect(mockPrisma.employee.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            position: "INVENTORY",
          }),
        })
      );
    });

    it("should update employee to RECEIVING position", async () => {
      mockPrisma.employee.update.mockResolvedValue({
        id: 4,
        name: "Phạm Thị D",
        position: "RECEIVING",
      });

      const result = await usecase.execute({
        id: 4,
        name: "Phạm Thị D",
        position: "RECEIVING",
      });

      expect(result.position).toBe("RECEIVING");
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error for invalid position", async () => {
      await expect(
        usecase.execute({
          id: 1,
          name: "Test",
          position: "INVALID_POSITION",
        })
      ).rejects.toThrow();
    });

    it("should throw error for empty name", async () => {
      await expect(
        usecase.execute({
          id: 1,
          name: "",
          position: "SALES",
        })
      ).rejects.toThrow();
    });

    it("should throw error for missing id", async () => {
      await expect(
        usecase.execute({
          name: "Test",
          position: "SALES",
        })
      ).rejects.toThrow();
    });

    it("should throw error for missing name", async () => {
      await expect(
        usecase.execute({
          id: 1,
          position: "SALES",
        })
      ).rejects.toThrow();
    });

    it("should throw error for missing position", async () => {
      await expect(
        usecase.execute({
          id: 1,
          name: "Test",
        })
      ).rejects.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle Vietnamese names with special characters", async () => {
      mockPrisma.employee.update.mockResolvedValue({
        id: 5,
        name: "Đỗ Thị Ngọc Ánh",
        position: "SALES",
      });

      const result = await usecase.execute({
        id: 5,
        name: "Đỗ Thị Ngọc Ánh",
        position: "SALES",
      });

      expect(result.name).toBe("Đỗ Thị Ngọc Ánh");
    });

    it("should handle very long names", async () => {
      const longName = "Nguyễn Văn " + "A".repeat(100);
      mockPrisma.employee.update.mockResolvedValue({
        id: 6,
        name: longName,
        position: "MANAGER",
      });

      await usecase.execute({
        id: 6,
        name: longName,
        position: "MANAGER",
      });

      expect(mockPrisma.employee.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: longName,
          }),
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      mockPrisma.employee.update.mockRejectedValue(
        new Error("Database connection error")
      );

      await expect(
        usecase.execute({
          id: 1,
          name: "Test",
          position: "SALES",
        })
      ).rejects.toThrow("Database connection error");
    });

    it("should handle employee not found", async () => {
      mockPrisma.employee.update.mockRejectedValue(
        new Error("Record to update not found")
      );

      await expect(
        usecase.execute({
          id: 999,
          name: "Test",
          position: "SALES",
        })
      ).rejects.toThrow("Record to update not found");
    });
  });
});
