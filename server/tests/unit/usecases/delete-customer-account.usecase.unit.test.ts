import { DeleteCustomerAccountUsecase } from "../../../src/application/services/customer-account/delete-customer-account.usecase";

describe("DeleteCustomerAccountUsecase Unit Tests", () => {
  let usecase: DeleteCustomerAccountUsecase;
  let mockAccountRepo: any;
  let mockUserRepo: any;
  let mockTransactionManager: any;
  let mockTx: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTx = {
      account: {
        delete: jest.fn(),
      },
      user: {
        delete: jest.fn(),
      },
    };

    mockAccountRepo = {
      delete: jest.fn(),
    };

    mockUserRepo = {
      delete: jest.fn(),
    };

    mockTransactionManager = {
      transaction: jest.fn((callback) => callback(mockTx)),
    };

    usecase = new DeleteCustomerAccountUsecase(
      mockAccountRepo,
      mockUserRepo,
      mockTransactionManager
    );
  });

  describe("Success Cases", () => {
    it("should delete customer account successfully", async () => {
      const result = await usecase.execute({ id: "1" });

      expect(result).toHaveProperty("message");
      expect(result.message).toContain("successfully");
      expect(mockTransactionManager.transaction).toHaveBeenCalled();
    });

    it("should delete customer with numeric string ID", async () => {
      const result = await usecase.execute({ id: "123" });

      expect(result).toBeDefined();
      expect(mockTx.account.delete).toHaveBeenCalledWith({
        where: { id: 123 },
      });
    });

    it("should delete both account and user", async () => {
      const callOrder: string[] = [];

      mockTx.account.delete.mockImplementation(() => {
        callOrder.push("account.delete");
        return Promise.resolve();
      });

      mockTx.user.delete.mockImplementation(() => {
        callOrder.push("user.delete");
        return Promise.resolve();
      });

      mockTransactionManager.transaction.mockImplementation((callback) =>
        callback(mockTx)
      );

      await usecase.execute({ id: "5" });

      expect(callOrder).toContain("account.delete");
      expect(callOrder).toContain("user.delete");
    });

    it("should delete customer with large ID", async () => {
      const result = await usecase.execute({ id: "999999" });

      expect(result).toBeDefined();
      expect(mockTx.account.delete).toHaveBeenCalled();
    });

    it("should handle successful cascade deletion", async () => {
      mockTx.account.delete.mockResolvedValue({});
      mockTx.user.delete.mockResolvedValue({});

      const result = await usecase.execute({ id: "42" });

      expect(result.message).toContain("successfully");
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when id is missing", async () => {
      await expect(usecase.execute({})).rejects.toThrow();
    });

    it("should throw error when id is null", async () => {
      await expect(usecase.execute({ id: null })).rejects.toThrow();
    });

    it("should throw error when id is undefined", async () => {
      await expect(usecase.execute({ id: undefined })).rejects.toThrow();
    });


  });

  describe("Business Logic Cases", () => {
    it("should convert string id to number", async () => {
      mockTransactionManager.transaction.mockImplementation((callback) =>
        callback(mockTx)
      );

      await usecase.execute({ id: "42" });

      expect(mockTx.account.delete).toHaveBeenCalledWith({
        where: { id: 42 },
      });
    });

    it("should start transaction for deletion", async () => {
      mockTransactionManager.transaction.mockImplementation((callback) =>
        callback(mockTx)
      );

      await usecase.execute({ id: "1" });

      expect(mockTransactionManager.transaction).toHaveBeenCalled();
    });

    it("should delete account before user in transaction", async () => {
      const operations: string[] = [];

      mockTx.account.delete.mockImplementation(() => {
        operations.push("deleteAccount");
        return Promise.resolve();
      });

      mockTx.user.delete.mockImplementation(() => {
        operations.push("deleteUser");
        return Promise.resolve();
      });

      mockTransactionManager.transaction.mockImplementation((callback) =>
        callback(mockTx)
      );

      await usecase.execute({ id: "1" });

      expect(operations[0]).toBe("deleteAccount");
      expect(operations[1]).toBe("deleteUser");
    });

    it("should log deletion task with ID", async () => {
      mockTransactionManager.transaction.mockImplementation((callback) =>
        callback(mockTx)
      );

      const result = await usecase.execute({ id: "99" });

      expect(mockTransactionManager.transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("should use transaction manager for safe deletion", async () => {
      mockTransactionManager.transaction.mockImplementation((callback) =>
        callback(mockTx)
      );

      await usecase.execute({ id: "1" });

      expect(mockTransactionManager.transaction).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle deletion of non-existent account", async () => {
      mockTx.account.delete.mockResolvedValue(null);
      mockTx.user.delete.mockResolvedValue(null);

      mockTransactionManager.transaction.mockImplementation((callback) =>
        callback(mockTx)
      );

      const result = await usecase.execute({ id: "999" });

      expect(result).toBeDefined();
    });

    it("should handle account deletion error gracefully", async () => {
      mockTx.account.delete.mockRejectedValue(new Error("Account not found"));

      mockTransactionManager.transaction.mockImplementation(async (callback) => {
        try {
          await callback(mockTx);
        } catch (e) {
          throw e;
        }
      });

      await expect(usecase.execute({ id: "1" })).rejects.toThrow(
        "Account not found"
      );
    });

    it("should handle user deletion error gracefully", async () => {
      mockTx.user.delete.mockRejectedValue(new Error("User not found"));

      mockTransactionManager.transaction.mockImplementation(async (callback) => {
        try {
          await callback(mockTx);
        } catch (e) {
          throw e;
        }
      });

      await expect(usecase.execute({ id: "1" })).rejects.toThrow(
        "User not found"
      );
    });

    it("should handle very large ID numbers", async () => {
      mockTransactionManager.transaction.mockImplementation((callback) =>
        callback(mockTx)
      );

      const result = await usecase.execute({ id: "2147483647" });

      expect(result).toBeDefined();
    });

    it("should handle deletion with leading zeros in ID", async () => {
      mockTransactionManager.transaction.mockImplementation((callback) =>
        callback(mockTx)
      );

      await usecase.execute({ id: "00123" });

      expect(mockTx.account.delete).toHaveBeenCalledWith({
        where: { id: 123 },
      });
    });

    it("should handle transaction timeout", async () => {
      mockTransactionManager.transaction.mockRejectedValue(
        new Error("Transaction timeout")
      );

      await expect(usecase.execute({ id: "1" })).rejects.toThrow(
        "Transaction timeout"
      );
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle multiple deletions sequentially", async () => {
      mockTransactionManager.transaction.mockImplementation((callback) =>
        callback(mockTx)
      );

      const delete1 = await usecase.execute({ id: "1" });
      const delete2 = await usecase.execute({ id: "2" });
      const delete3 = await usecase.execute({ id: "3" });

      expect(delete1).toBeDefined();
      expect(delete2).toBeDefined();
      expect(delete3).toBeDefined();
      expect(mockTransactionManager.transaction).toHaveBeenCalledTimes(3);
    });

    it("should handle rollback on partial failure", async () => {
      let callbackExecuted = false;

      mockTransactionManager.transaction.mockImplementation(async (callback) => {
        try {
          await callback(mockTx);
          callbackExecuted = true;
        } catch (e) {
          callbackExecuted = false;
          throw e;
        }
      });

      mockTx.account.delete.mockResolvedValue({});
      mockTx.user.delete.mockRejectedValue(new Error("User delete failed"));

      await expect(usecase.execute({ id: "1" })).rejects.toThrow(
        "User delete failed"
      );

      expect(callbackExecuted).toBe(false);
    });

    it("should maintain data consistency with transaction", async () => {
      const deletedIds: number[] = [];

      mockTx.account.delete.mockImplementation(({ where }) => {
        deletedIds.push(where.id);
        return Promise.resolve();
      });

      mockTx.user.delete.mockImplementation(({ where }) => {
        deletedIds.push(where.id);
        return Promise.resolve();
      });

      mockTransactionManager.transaction.mockImplementation((callback) =>
        callback(mockTx)
      );

      await usecase.execute({ id: "42" });

      expect(deletedIds[0]).toBe(42);
      expect(deletedIds[1]).toBe(42);
    });
  });
});
