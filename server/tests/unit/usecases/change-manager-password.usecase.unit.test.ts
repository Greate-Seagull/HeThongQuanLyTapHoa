import { ChangeManagerPasswordUsecase } from "../../../src/application/services/employee-account/change-manager-password.usecase";

describe("ChangeManagerPasswordUsecase Unit Tests", () => {
  let usecase: ChangeManagerPasswordUsecase;
  let mockTransactionManager: any;
  let mockPasswordService: any;
  let mockTx: any;

  beforeEach(() => {
    mockTx = {
      employeeAccount: {
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
    };

    usecase = new ChangeManagerPasswordUsecase(
      mockTransactionManager,
      mockPasswordService
    );
  });

  describe("Success Cases", () => {
    it("should change manager password successfully", async () => {
      mockTx.employeeAccount.findFirst.mockResolvedValue({
        id: 100,
        passwordHash: "oldhash",
        salt: "salt123",
      });
      mockPasswordService.comparePassword.mockResolvedValue(true);
      mockPasswordService.hashPassword.mockResolvedValue("newhash");

      const result = await usecase.execute({
        id: 1,
        currentPassword: "oldpass",
        newPassword: "newpass123",
      });

      expect(result.message).toBe("Đổi mật khẩu thành công");
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when account not found", async () => {
      mockTx.employeeAccount.findFirst.mockResolvedValue(null);

      await expect(
        usecase.execute({
          id: 999,
          currentPassword: "pass",
          newPassword: "newpass",
        })
      ).rejects.toThrow("Không tìm thấy tài khoản");
    });

    it("should throw error when current password is incorrect", async () => {
      mockTx.employeeAccount.findFirst.mockResolvedValue({
        id: 100,
        passwordHash: "hash",
        salt: "salt",
      });
      mockPasswordService.comparePassword.mockResolvedValue(false);

      await expect(
        usecase.execute({
          id: 1,
          currentPassword: "wrongpass",
          newPassword: "newpass",
        })
      ).rejects.toThrow("Mật khẩu hiện tại không đúng");
    });
  });
});
