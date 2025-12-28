import { GetEmployeeAccountsUsecase } from "../../../src/application/services/employee-account/get-employee-accounts.usecase";

describe("GetEmployeeAccountsUsecase Unit Tests", () => {
  let usecase: GetEmployeeAccountsUsecase;
  let mockEmployeeAccountRead: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEmployeeAccountRead = {
      getAll: jest.fn(),
    };
    usecase = new GetEmployeeAccountsUsecase(mockEmployeeAccountRead);
  });

  describe("Success Cases", () => {
    it("should get all employee accounts successfully", async () => {
      const mockAccounts = [
        {
          id: 1,
          username: "john_doe",
          employee: { id: 1, name: "John Doe", position: "SALES" },
        },
        {
          id: 2,
          username: "jane_smith",
          employee: { id: 2, name: "Jane Smith", position: "MANAGER" },
        },
      ];
      mockEmployeeAccountRead.getAll.mockResolvedValue(mockAccounts);

      const result = await usecase.execute();

      expect(result).toHaveLength(2);
      expect(result[0].username).toBe("john_doe");
      expect(result[0].employee.name).toBe("John Doe");
    });

    it("should return empty array when no accounts", async () => {
      mockEmployeeAccountRead.getAll.mockResolvedValue([]);

      const result = await usecase.execute();

      expect(result).toEqual([]);
    });

    it("should handle Vietnamese employee names", async () => {
      const mockAccounts = [
        {
          id: 1,
          username: "nguyen_van_a",
          employee: { id: 1, name: "Nguyễn Văn A", position: "INVENTORY" },
        },
      ];
      mockEmployeeAccountRead.getAll.mockResolvedValue(mockAccounts);

      const result = await usecase.execute();

      expect(result[0].employee.name).toBe("Nguyễn Văn A");
    });
  });

  describe("Edge Cases", () => {
    it("should handle large number of accounts", async () => {
      const mockAccounts = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        username: `user_${i + 1}`,
        employee: { id: i + 1, name: `Employee ${i + 1}`, position: "SALES" },
      }));
      mockEmployeeAccountRead.getAll.mockResolvedValue(mockAccounts);

      const result = await usecase.execute();

      expect(result).toHaveLength(100);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      mockEmployeeAccountRead.getAll.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute()).rejects.toThrow("DB Error");
    });
  });
});
