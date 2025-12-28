import { GetAccountsUsecase } from "../../../src/application/services/customer-account/get-accounts.usecase";

describe("GetAccountsUsecase Unit Tests", () => {
  let usecase: GetAccountsUsecase;
  let mockAccountRead: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAccountRead = {
      getAll: jest.fn(),
    };

    usecase = new GetAccountsUsecase(mockAccountRead);
  });

  describe("Success Cases", () => {
    it("should get all accounts successfully", async () => {
      const accounts = [
        {
          id: 1,
          phoneNumber: "0123456789",
          user: { id: 1, name: "John", point: 100 },
        },
        {
          id: 2,
          phoneNumber: "0987654321",
          user: { id: 2, name: "Jane", point: 50 },
        },
      ];

      mockAccountRead.getAll.mockResolvedValue(accounts);

      const result = await usecase.execute();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it("should return empty array when no accounts exist", async () => {
      mockAccountRead.getAll.mockResolvedValue([]);

      const result = await usecase.execute();

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should map account data correctly", async () => {
      const accounts = [
        {
          id: 1,
          phoneNumber: "0123456789",
          user: { id: 1, name: "John", point: 100 },
        },
      ];

      mockAccountRead.getAll.mockResolvedValue(accounts);

      const result = await usecase.execute();

      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("phoneNumber");
      expect(result[0]).toHaveProperty("user");
      expect(result[0].user).toHaveProperty("id");
      expect(result[0].user).toHaveProperty("name");
      expect(result[0].user).toHaveProperty("point");
    });

    it("should handle accounts with null user", async () => {
      const accounts = [
        {
          id: 1,
          phoneNumber: "0123456789",
          user: null,
        },
      ];

      mockAccountRead.getAll.mockResolvedValue(accounts);

      const result = await usecase.execute();

      expect(result[0].user).toBeNull();
    });

    it("should handle multiple accounts correctly", async () => {
      const accounts = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        phoneNumber: `010000000${i}`,
        user: { id: i + 1, name: `User ${i}`, point: 100 + i * 10 },
      }));

      mockAccountRead.getAll.mockResolvedValue(accounts);

      const result = await usecase.execute();

      expect(result).toHaveLength(5);
      expect(result[0].id).toBe(1);
      expect(result[4].id).toBe(5);
    });

    it("should preserve user point values", async () => {
      const accounts = [
        {
          id: 1,
          phoneNumber: "0123456789",
          user: { id: 1, name: "John", point: 1000 },
        },
      ];

      mockAccountRead.getAll.mockResolvedValue(accounts);

      const result = await usecase.execute();

      expect(result[0].user.point).toBe(1000);
    });
  });

  describe("Validation Error Cases", () => {
    it("should handle database read error", async () => {
      mockAccountRead.getAll.mockRejectedValue(
        new Error("Database error")
      );

      await expect(usecase.execute()).rejects.toThrow("Database error");
    });

    it("should handle connection timeout", async () => {
      mockAccountRead.getAll.mockRejectedValue(
        new Error("Connection timeout")
      );

      await expect(usecase.execute()).rejects.toThrow("Connection timeout");
    });

    it("should handle null response", async () => {
      mockAccountRead.getAll.mockResolvedValue(null);

      // Should handle gracefully or throw
      await expect(usecase.execute()).rejects.toThrow();
    });
  });

  describe("Business Logic Cases", () => {
    it("should call accountRead.getAll method", async () => {
      mockAccountRead.getAll.mockResolvedValue([]);

      await usecase.execute();

      expect(mockAccountRead.getAll).toHaveBeenCalled();
    });

    it("should call getAll exactly once per execute", async () => {
      mockAccountRead.getAll.mockResolvedValue([]);

      await usecase.execute();

      expect(mockAccountRead.getAll).toHaveBeenCalledTimes(1);
    });

    it("should extract required fields from accounts", async () => {
      const accounts = [
        {
          id: 1,
          phoneNumber: "0123456789",
          user: { id: 1, name: "John", point: 100 },
          extraField: "should not be in result",
        },
      ];

      mockAccountRead.getAll.mockResolvedValue(accounts);

      const result = await usecase.execute();

      expect(result[0]).not.toHaveProperty("extraField");
    });

    it("should map nested user object correctly", async () => {
      const accounts = [
        {
          id: 1,
          phoneNumber: "0123456789",
          user: { id: 1, name: "Test User", point: 50 },
        },
      ];

      mockAccountRead.getAll.mockResolvedValue(accounts);

      const result = await usecase.execute();

      expect(result[0].user.id).toBe(1);
      expect(result[0].user.name).toBe("Test User");
      expect(result[0].user.point).toBe(50);
    });

    it("should handle user with zero points", async () => {
      const accounts = [
        {
          id: 1,
          phoneNumber: "0123456789",
          user: { id: 1, name: "New User", point: 0 },
        },
      ];

      mockAccountRead.getAll.mockResolvedValue(accounts);

      const result = await usecase.execute();

      expect(result[0].user.point).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle accounts with Vietnamese names", async () => {
      const accounts = [
        {
          id: 1,
          phoneNumber: "0123456789",
          user: { id: 1, name: "Nguyễn Văn A", point: 100 },
        },
        {
          id: 2,
          phoneNumber: "0987654321",
          user: { id: 2, name: "Trần Thị B", point: 200 },
        },
      ];

      mockAccountRead.getAll.mockResolvedValue(accounts);

      const result = await usecase.execute();

      expect(result[0].user.name).toBe("Nguyễn Văn A");
      expect(result[1].user.name).toBe("Trần Thị B");
    });

    it("should handle very long user names", async () => {
      const longName = "A".repeat(500);
      const accounts = [
        {
          id: 1,
          phoneNumber: "0123456789",
          user: { id: 1, name: longName, point: 100 },
        },
      ];

      mockAccountRead.getAll.mockResolvedValue(accounts);

      const result = await usecase.execute();

      expect(result[0].user.name).toBe(longName);
    });

    it("should handle very large point values", async () => {
      const accounts = [
        {
          id: 1,
          phoneNumber: "0123456789",
          user: { id: 1, name: "User", point: 999999999 },
        },
      ];

      mockAccountRead.getAll.mockResolvedValue(accounts);

      const result = await usecase.execute();

      expect(result[0].user.point).toBe(999999999);
    });

    it("should handle large account IDs", async () => {
      const accounts = [
        {
          id: 2147483647,
          phoneNumber: "0123456789",
          user: { id: 2147483647, name: "User", point: 100 },
        },
      ];

      mockAccountRead.getAll.mockResolvedValue(accounts);

      const result = await usecase.execute();

      expect(result[0].id).toBe(2147483647);
    });

    it("should handle many accounts (100+)", async () => {
      const accounts = Array.from({ length: 150 }, (_, i) => ({
        id: i + 1,
        phoneNumber: `010000000${i % 10}`,
        user: { id: i + 1, name: `User ${i}`, point: 100 + i },
      }));

      mockAccountRead.getAll.mockResolvedValue(accounts);

      const result = await usecase.execute();

      expect(result).toHaveLength(150);
    });

    it("should handle special characters in phone numbers", async () => {
      const accounts = [
        {
          id: 1,
          phoneNumber: "+84 (123) 456-7890",
          user: { id: 1, name: "User", point: 100 },
        },
      ];

      mockAccountRead.getAll.mockResolvedValue(accounts);

      const result = await usecase.execute();

      expect(result[0].phoneNumber).toBe("+84 (123) 456-7890");
    });

    it("should handle accounts with undefined user", async () => {
      const accounts = [
        {
          id: 1,
          phoneNumber: "0123456789",
          user: undefined,
        },
      ];

      mockAccountRead.getAll.mockResolvedValue(accounts);

      const result = await usecase.execute();

      // Ternary checks for truthiness, undefined becomes null
      expect(result[0].user).toBeNull();
    });

    it("should handle mixed null and valid users", async () => {
      const accounts = [
        {
          id: 1,
          phoneNumber: "0111111111",
          user: { id: 1, name: "User 1", point: 100 },
        },
        {
          id: 2,
          phoneNumber: "0222222222",
          user: null,
        },
        {
          id: 3,
          phoneNumber: "0333333333",
          user: { id: 3, name: "User 3", point: 300 },
        },
      ];

      mockAccountRead.getAll.mockResolvedValue(accounts);

      const result = await usecase.execute();

      expect(result[0].user).toBeDefined();
      expect(result[1].user).toBeNull();
      expect(result[2].user).toBeDefined();
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle multiple consecutive calls", async () => {
      const accounts = [
        {
          id: 1,
          phoneNumber: "0123456789",
          user: { id: 1, name: "User", point: 100 },
        },
      ];

      mockAccountRead.getAll.mockResolvedValue(accounts);

      const result1 = await usecase.execute();
      const result2 = await usecase.execute();
      const result3 = await usecase.execute();

      expect(result1).toHaveLength(1);
      expect(result2).toHaveLength(1);
      expect(result3).toHaveLength(1);
      expect(mockAccountRead.getAll).toHaveBeenCalledTimes(3);
    });

    it("should maintain data consistency across calls", async () => {
      const accounts = [
        {
          id: 1,
          phoneNumber: "0123456789",
          user: { id: 1, name: "User", point: 100 },
        },
      ];

      mockAccountRead.getAll.mockResolvedValue(accounts);

      const result1 = await usecase.execute();
      const result2 = await usecase.execute();

      expect(result1[0].id).toBe(result2[0].id);
      expect(result1[0].phoneNumber).toBe(result2[0].phoneNumber);
      expect(result1[0].user.name).toBe(result2[0].user.name);
    });

    it("should handle dynamic account count changes", async () => {
      const accounts1 = [
        {
          id: 1,
          phoneNumber: "0123456789",
          user: { id: 1, name: "User 1", point: 100 },
        },
      ];

      const accounts2 = [
        {
          id: 1,
          phoneNumber: "0123456789",
          user: { id: 1, name: "User 1", point: 100 },
        },
        {
          id: 2,
          phoneNumber: "0987654321",
          user: { id: 2, name: "User 2", point: 200 },
        },
      ];

      mockAccountRead.getAll
        .mockResolvedValueOnce(accounts1)
        .mockResolvedValueOnce(accounts2);

      const result1 = await usecase.execute();
      const result2 = await usecase.execute();

      expect(result1).toHaveLength(1);
      expect(result2).toHaveLength(2);
    });

    it("should handle concurrent requests safely", async () => {
      const accounts = [
        {
          id: 1,
          phoneNumber: "0123456789",
          user: { id: 1, name: "User", point: 100 },
        },
      ];

      mockAccountRead.getAll.mockResolvedValue(accounts);

      const requests = [
        usecase.execute(),
        usecase.execute(),
        usecase.execute(),
      ];

      const results = await Promise.all(requests);

      expect(results).toHaveLength(3);
      expect(results[0]).toHaveLength(1);
      expect(results[1]).toHaveLength(1);
      expect(results[2]).toHaveLength(1);
    });
  });
});
