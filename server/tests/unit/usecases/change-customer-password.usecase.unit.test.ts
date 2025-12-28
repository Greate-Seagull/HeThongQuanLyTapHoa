import { ChangeCustomerPasswordUsecase } from "../../../src/application/services/customer-account/change-customer-password.usecase";

describe("ChangeCustomerPasswordUsecase Unit Tests", () => {
  let usecase: ChangeCustomerPasswordUsecase;
  let mockTransactionManager: any;
  let mockPasswordService: any;
  let mockTx: any;

  beforeEach(() => {
    mockTx = {
      account: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    mockTransactionManager = {
      transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(mockTx);
      }),
    };

    mockPasswordService = {
      comparePassword: jest.fn(),
      hashPassword: jest.fn(),
      generateSalt: jest.fn(),
    };

    usecase = new ChangeCustomerPasswordUsecase(
      mockTransactionManager,
      mockPasswordService
    );
  });

  describe("Success Cases", () => {
    it("should change password successfully", async () => {
      const input = {
        id: 1,
        currentPassword: "oldPass123",
        newPassword: "newPass456",
      };

      mockTx.account.findFirst.mockResolvedValue({
        id: 100,
        passwordHash: "oldHashValue",
        salt: "oldSalt",
      });
      mockPasswordService.comparePassword.mockReturnValue(true);
      mockPasswordService.generateSalt.mockReturnValue("newSalt");
      mockPasswordService.hashPassword.mockResolvedValue("newHashValue");
      mockTx.account.update.mockResolvedValue({ id: 100 });

      const result = await usecase.execute(input);

      expect(mockTx.account.findFirst).toHaveBeenCalledWith({
        where: { userId: 1 },
        select: { id: true, passwordHash: true, salt: true },
      });
      expect(mockPasswordService.comparePassword).toHaveBeenCalledWith(
        "oldPass123",
        "oldHashValue"
      );
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(
        "newPass456",
        "newSalt"
      );
      expect(mockTx.account.update).toHaveBeenCalledWith({
        where: { id: 100 },
        data: { passwordHash: "newHashValue", salt: "newSalt" },
      });
      expect(result.message).toBe("Đổi mật khẩu thành công");
    });

    it("should accept string id and convert to number", async () => {
      mockTx.account.findFirst.mockResolvedValue({
        id: 100,
        passwordHash: "hash",
        salt: "salt",
      });
      mockPasswordService.comparePassword.mockReturnValue(true);
      mockPasswordService.generateSalt.mockReturnValue("salt");
      mockPasswordService.hashPassword.mockResolvedValue("newhash");

      await usecase.execute({
        id: "5",
        currentPassword: "current",
        newPassword: "newpass",
      });

      expect(mockTx.account.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 5 },
        })
      );
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when account not found", async () => {
      mockTx.account.findFirst.mockResolvedValue(null);

      await expect(
        usecase.execute({
          id: 999,
          currentPassword: "pass",
          newPassword: "newpass",
        })
      ).rejects.toThrow("Account not found");
    });

    it("should throw error when current password is incorrect", async () => {
      mockTx.account.findFirst.mockResolvedValue({
        id: 100,
        passwordHash: "hash",
        salt: "salt",
      });
      mockPasswordService.comparePassword.mockReturnValue(false);

      await expect(
        usecase.execute({
          id: 1,
          currentPassword: "wrongPass",
          newPassword: "newpass",
        })
      ).rejects.toThrow("Mật khẩu hiện tại không đúng");
    });

    it("should throw error when new password is too short", async () => {
      await expect(
        usecase.execute({
          id: 1,
          currentPassword: "current",
          newPassword: "123",
        })
      ).rejects.toThrow();
    });

    it("should throw error when current password is empty", async () => {
      await expect(
        usecase.execute({
          id: 1,
          currentPassword: "",
          newPassword: "newpass123",
        })
      ).rejects.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle password with special characters", async () => {
      mockTx.account.findFirst.mockResolvedValue({
        id: 100,
        passwordHash: "hash",
        salt: "salt",
      });
      mockPasswordService.comparePassword.mockReturnValue(true);
      mockPasswordService.generateSalt.mockReturnValue("salt");
      mockPasswordService.hashPassword.mockResolvedValue("newhash");

      await usecase.execute({
        id: 1,
        currentPassword: "current@123!",
        newPassword: "new@Pass#2024$",
      });

      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(
        "new@Pass#2024$",
        "salt"
      );
    });

    it("should handle Vietnamese characters in password", async () => {
      mockTx.account.findFirst.mockResolvedValue({
        id: 100,
        passwordHash: "hash",
        salt: "salt",
      });
      mockPasswordService.comparePassword.mockReturnValue(true);
      mockPasswordService.generateSalt.mockReturnValue("salt");
      mockPasswordService.hashPassword.mockResolvedValue("newhash");

      await usecase.execute({
        id: 1,
        currentPassword: "mậtKhẩuCũ123",
        newPassword: "mậtKhẩuMới456",
      });

      expect(mockPasswordService.comparePassword).toHaveBeenCalledWith(
        "mậtKhẩuCũ123",
        "hash"
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors during account lookup", async () => {
      mockTx.account.findFirst.mockRejectedValue(
        new Error("Database connection error")
      );

      await expect(
        usecase.execute({
          id: 1,
          currentPassword: "pass",
          newPassword: "newpass",
        })
      ).rejects.toThrow("Database connection error");
    });

    it("should handle errors during password update", async () => {
      mockTx.account.findFirst.mockResolvedValue({
        id: 100,
        passwordHash: "hash",
        salt: "salt",
      });
      mockPasswordService.comparePassword.mockReturnValue(true);
      mockPasswordService.generateSalt.mockReturnValue("salt");
      mockPasswordService.hashPassword.mockResolvedValue("newhash");
      mockTx.account.update.mockRejectedValue(new Error("Update failed"));

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
