import { DeleteEmployeeAccountUsecase } from "../../../src/application/services/employee-account/delete-employee-account.usecase";

describe("DeleteEmployeeAccountUsecase Unit Tests", () => {
  let usecase: DeleteEmployeeAccountUsecase;
  let mockEmployeeAccountRepo: any;
  let mockEmployeeRepo: any;
  let mockTransactionManager: any;
  let mockTx: any;

  beforeEach(() => {
    mockTx = {
      employeeAccount: {
        deleteMany: jest.fn(),
      },
      employee: {
        delete: jest.fn(),
      },
    };

    mockEmployeeAccountRepo = {};
    mockEmployeeRepo = {};
    mockTransactionManager = {
      transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(mockTx);
      }),
    };

    usecase = new DeleteEmployeeAccountUsecase(
      mockEmployeeAccountRepo,
      mockEmployeeRepo,
      mockTransactionManager
    );
  });

  describe("Success Cases", () => {
    it("should delete employee account successfully", async () => {
      mockTx.employeeAccount.deleteMany.mockResolvedValue({ count: 1 });
      mockTx.employee.delete.mockResolvedValue({ id: 1 });

      const result = await usecase.execute({ id: 1 });

      expect(mockTx.employeeAccount.deleteMany).toHaveBeenCalledWith({
        where: { employeeId: 1 },
      });
      expect(mockTx.employee.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result.message).toBe("Deleted successfully");
    });

    it("should accept string id and convert to number", async () => {
      mockTx.employeeAccount.deleteMany.mockResolvedValue({ count: 1 });
      mockTx.employee.delete.mockResolvedValue({ id: 5 });

      await usecase.execute({ id: "5" });

      expect(mockTx.employeeAccount.deleteMany).toHaveBeenCalledWith({
        where: { employeeId: 5 },
      });
      expect(mockTx.employee.delete).toHaveBeenCalledWith({
        where: { id: 5 },
      });
    });

    it("should handle deletion when employee has no account", async () => {
      mockTx.employeeAccount.deleteMany.mockResolvedValue({ count: 0 });
      mockTx.employee.delete.mockResolvedValue({ id: 10 });

      const result = await usecase.execute({ id: 10 });

      expect(result.message).toBe("Deleted successfully");
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error for invalid id type", async () => {
      await expect(usecase.execute({ id: null })).rejects.toThrow();
    });

    it("should throw error for missing id", async () => {
      await expect(usecase.execute({})).rejects.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle deletion of employee with multiple accounts", async () => {
      mockTx.employeeAccount.deleteMany.mockResolvedValue({ count: 2 });
      mockTx.employee.delete.mockResolvedValue({ id: 1 });

      const result = await usecase.execute({ id: 1 });

      expect(result.message).toBe("Deleted successfully");
    });

    it("should handle very large employee IDs", async () => {
      const largeId = 999999999;
      mockTx.employeeAccount.deleteMany.mockResolvedValue({ count: 1 });
      mockTx.employee.delete.mockResolvedValue({ id: largeId });

      await usecase.execute({ id: largeId });

      expect(mockTx.employee.delete).toHaveBeenCalledWith({
        where: { id: largeId },
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle error when deleting employee accounts fails", async () => {
      mockTx.employeeAccount.deleteMany.mockRejectedValue(
        new Error("Delete accounts failed")
      );

      await expect(usecase.execute({ id: 1 })).rejects.toThrow(
        "Delete accounts failed"
      );
    });

    it("should handle error when deleting employee fails", async () => {
      mockTx.employeeAccount.deleteMany.mockResolvedValue({ count: 1 });
      mockTx.employee.delete.mockRejectedValue(
        new Error("Employee not found")
      );

      await expect(usecase.execute({ id: 1 })).rejects.toThrow(
        "Employee not found"
      );
    });

    it("should handle transaction rollback on error", async () => {
      mockTx.employeeAccount.deleteMany.mockResolvedValue({ count: 1 });
      mockTx.employee.delete.mockRejectedValue(new Error("Database error"));

      await expect(usecase.execute({ id: 1 })).rejects.toThrow(
        "Database error"
      );

      // Verify transaction was called
      expect(mockTransactionManager.transaction).toHaveBeenCalled();
    });
  });
});
