import { GetMyAccountUsecase } from "../../../src/application/services/customer-account/get-my-account.usecase";

describe("GetMyAccountUsecase Unit Tests", () => {
  let usecase: GetMyAccountUsecase;
  let mockAccountRead: any;

  beforeEach(() => {
    mockAccountRead = {
      getByUserId: jest.fn(),
    };

    usecase = new GetMyAccountUsecase(mockAccountRead);
  });

  describe("Success Cases", () => {
    it("should get account successfully", async () => {
      const mockAccount = {
        id: 100,
        phoneNumber: "0901234567",
        user: {
          id: 1,
          name: "Nguyễn Văn A",
          point: 150,
        },
      };

      mockAccountRead.getByUserId.mockResolvedValue(mockAccount);

      const result = await usecase.execute({ authId: 1 });

      expect(mockAccountRead.getByUserId).toHaveBeenCalledWith(1);
      expect(result.id).toBe(100);
      expect(result.phoneNumber).toBe("0901234567");
      expect(result.user.name).toBe("Nguyễn Văn A");
      expect(result.user.point).toBe(150);
    });

    it("should get account with zero points", async () => {
      mockAccountRead.getByUserId.mockResolvedValue({
        id: 200,
        phoneNumber: "0987654321",
        user: {
          id: 2,
          name: "Trần Thị B",
          point: 0,
        },
      });

      const result = await usecase.execute({ authId: 2 });

      expect(result.user.point).toBe(0);
    });

    it("should get account with high points", async () => {
      mockAccountRead.getByUserId.mockResolvedValue({
        id: 300,
        phoneNumber: "0123456789",
        user: {
          id: 3,
          name: "Lê Văn C",
          point: 9999,
        },
      });

      const result = await usecase.execute({ authId: 3 });

      expect(result.user.point).toBe(9999);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when account not found", async () => {
      mockAccountRead.getByUserId.mockResolvedValue(null);

      await expect(
        usecase.execute({ authId: 999 })
      ).rejects.toThrow("Account not found");
    });

    it("should throw error for missing authId", async () => {
      await expect(usecase.execute({})).rejects.toThrow();
    });

    it("should throw error for invalid authId type", async () => {
      await expect(
        usecase.execute({ authId: "invalid" })
      ).rejects.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle Vietnamese names", async () => {
      mockAccountRead.getByUserId.mockResolvedValue({
        id: 400,
        phoneNumber: "0912345678",
        user: {
          id: 4,
          name: "Đỗ Thị Ngọc Ánh",
          point: 100,
        },
      });

      const result = await usecase.execute({ authId: 4 });

      expect(result.user.name).toBe("Đỗ Thị Ngọc Ánh");
    });

    it("should handle phone numbers with various formats", async () => {
      mockAccountRead.getByUserId.mockResolvedValue({
        id: 500,
        phoneNumber: "+84901234567",
        user: {
          id: 5,
          name: "User",
          point: 50,
        },
      });

      const result = await usecase.execute({ authId: 5 });

      expect(result.phoneNumber).toBe("+84901234567");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      mockAccountRead.getByUserId.mockRejectedValue(
        new Error("Database connection error")
      );

      await expect(
        usecase.execute({ authId: 1 })
      ).rejects.toThrow("Database connection error");
    });
  });
});
