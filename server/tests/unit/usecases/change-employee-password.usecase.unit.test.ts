import { ChangeEmployeePasswordUsecase } from "../../../src/application/services/employee-account/change-employee-password.usecase";
import bcrypt from "bcryptjs";

// Mock bcrypt
jest.mock("bcryptjs");

// Mock prisma
jest.mock("../../../src/composition-root", () => ({
  prisma: {
    employeeAccount: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prisma } from "../../../src/composition-root";

describe("ChangeEmployeePasswordUsecase Unit Tests", () => {
  let usecase: ChangeEmployeePasswordUsecase;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = prisma;
    usecase = new ChangeEmployeePasswordUsecase();
    jest.clearAllMocks();
  });

  describe("Success Cases", () => {
    it("should change employee password successfully", async () => {
      const input = {
        id: 1,
        currentPassword: "oldPass123",
        newPassword: "newPass456",
      };

      mockPrisma.employeeAccount.findFirst.mockResolvedValue({
        id: 100,
        employeeId: 1,
        passwordHash: "oldHashValue",
        salt: "oldSalt",
      });
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      (bcrypt.genSaltSync as jest.Mock).mockReturnValue("newSalt");
      (bcrypt.hashSync as jest.Mock).mockReturnValue("newHashValue");
      mockPrisma.employeeAccount.update.mockResolvedValue({ id: 100 });

      const result = await usecase.execute(input);

      expect(mockPrisma.employeeAccount.findFirst).toHaveBeenCalledWith({
        where: { employeeId: 1 },
      });
      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        "oldPass123",
        "oldHashValue"
      );
      expect(bcrypt.genSaltSync).toHaveBeenCalledWith(10);
      expect(bcrypt.hashSync).toHaveBeenCalledWith("newPass456", "newSalt");
      expect(mockPrisma.employeeAccount.update).toHaveBeenCalledWith({
        where: { id: 100 },
        data: { passwordHash: "newHashValue", salt: "newSalt" },
      });
      expect(result.success).toBe(true);
    });

    it("should handle different employee IDs", async () => {
      mockPrisma.employeeAccount.findFirst.mockResolvedValue({
        id: 200,
        employeeId: 99,
        passwordHash: "hash",
        salt: "salt",
      });
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      (bcrypt.genSaltSync as jest.Mock).mockReturnValue("salt");
      (bcrypt.hashSync as jest.Mock).mockReturnValue("newhash");

      await usecase.execute({
        id: 99,
        currentPassword: "current",
        newPassword: "newpass123",
      });

      expect(mockPrisma.employeeAccount.findFirst).toHaveBeenCalledWith({
        where: { employeeId: 99 },
      });
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when account not found", async () => {
      mockPrisma.employeeAccount.findFirst.mockResolvedValue(null);

      await expect(
        usecase.execute({
          id: 999,
          currentPassword: "pass",
          newPassword: "newpass",
        })
      ).rejects.toThrow("Tài khoản không tồn tại");
    });

    it("should throw error when current password is incorrect", async () => {
      mockPrisma.employeeAccount.findFirst.mockResolvedValue({
        id: 100,
        employeeId: 1,
        passwordHash: "hash",
        salt: "salt",
      });
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

      await expect(
        usecase.execute({
          id: 1,
          currentPassword: "wrongPassword",
          newPassword: "newpass123",
        })
      ).rejects.toThrow("Mật khẩu hiện tại không đúng");
    });
  });

  describe("Edge Cases", () => {
    it("should handle password with special characters", async () => {
      mockPrisma.employeeAccount.findFirst.mockResolvedValue({
        id: 100,
        employeeId: 1,
        passwordHash: "hash",
        salt: "salt",
      });
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      (bcrypt.genSaltSync as jest.Mock).mockReturnValue("salt");
      (bcrypt.hashSync as jest.Mock).mockReturnValue("newhash");

      await usecase.execute({
        id: 1,
        currentPassword: "current@123!",
        newPassword: "new@Pass#2024$",
      });

      expect(bcrypt.hashSync).toHaveBeenCalledWith("new@Pass#2024$", "salt");
    });

    it("should handle Vietnamese characters in password", async () => {
      mockPrisma.employeeAccount.findFirst.mockResolvedValue({
        id: 100,
        employeeId: 1,
        passwordHash: "hash",
        salt: "salt",
      });
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      (bcrypt.genSaltSync as jest.Mock).mockReturnValue("salt");
      (bcrypt.hashSync as jest.Mock).mockReturnValue("newhash");

      await usecase.execute({
        id: 1,
        currentPassword: "mậtKhẩuCũ123",
        newPassword: "mậtKhẩuMới456",
      });

      expect(bcrypt.compareSync).toHaveBeenCalledWith("mậtKhẩuCũ123", "hash");
    });

    it("should handle very long passwords", async () => {
      const longPassword = "a".repeat(100);
      mockPrisma.employeeAccount.findFirst.mockResolvedValue({
        id: 100,
        employeeId: 1,
        passwordHash: "hash",
        salt: "salt",
      });
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      (bcrypt.genSaltSync as jest.Mock).mockReturnValue("salt");
      (bcrypt.hashSync as jest.Mock).mockReturnValue("newhash");

      await usecase.execute({
        id: 1,
        currentPassword: "current",
        newPassword: longPassword,
      });

      expect(bcrypt.hashSync).toHaveBeenCalledWith(longPassword, "salt");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors during account lookup", async () => {
      mockPrisma.employeeAccount.findFirst.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(
        usecase.execute({
          id: 1,
          currentPassword: "pass",
          newPassword: "newpass",
        })
      ).rejects.toThrow("Database connection failed");
    });

    it("should handle errors during password update", async () => {
      mockPrisma.employeeAccount.findFirst.mockResolvedValue({
        id: 100,
        employeeId: 1,
        passwordHash: "hash",
        salt: "salt",
      });
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      (bcrypt.genSaltSync as jest.Mock).mockReturnValue("salt");
      (bcrypt.hashSync as jest.Mock).mockReturnValue("newhash");
      mockPrisma.employeeAccount.update.mockRejectedValue(
        new Error("Update failed")
      );

      await expect(
        usecase.execute({
          id: 1,
          currentPassword: "current",
          newPassword: "newpass",
        })
      ).rejects.toThrow("Update failed");
    });
  });
});
