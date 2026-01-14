import { UpdateManagerProfileUsecase } from "../../../src/application/services/employee-account/update-manager-profile.usecase";

// Mock prisma
jest.mock("../../../src/composition-root", () => ({
  prisma: {
    employee: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    employeeAccount: {
      updateMany: jest.fn(),
    },
  },
}));

import { prisma } from "../../../src/composition-root";

describe("UpdateManagerProfileUsecase Unit Tests", () => {
  let usecase: UpdateManagerProfileUsecase;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = prisma;
    usecase = new UpdateManagerProfileUsecase();
    jest.clearAllMocks();
  });

  describe("Success Cases", () => {
    it("should update manager profile successfully", async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 1,
        name: "Old Name",
        position: "MANAGER",
        avatar: null,
      });
      mockPrisma.employee.update.mockResolvedValue({
        id: 1,
        name: "New Name",
        position: "MANAGER", // ✅ Include position in mock response
        avatar: null,
      });
      mockPrisma.employeeAccount.updateMany.mockResolvedValue({ count: 1 });

      const result = await usecase.execute({
        id: 1,
        name: "New Name",
        username: "newuser",
      });

      expect(result.name).toBe("New Name");
      expect(result.username).toBe("newuser");
      expect(result.position).toBe("MANAGER");
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when manager not found", async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);

      await expect(
        usecase.execute({
          id: 999,
          name: "Name",
          username: "user",
        })
      ).rejects.toThrow("Manager not found");
    });

    it("should throw error when employee is not manager", async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 1,
        position: "SALES",
      });

      await expect(
        usecase.execute({
          id: 1,
          name: "Name",
          username: "user",
        })
      ).rejects.toThrow("Manager not found");
    });
  });
});
