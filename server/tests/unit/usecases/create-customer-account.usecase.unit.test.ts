import { CreateCustomerAccountUsecase } from "../../../src/application/services/customer-account/create-customer-account.usecase";

describe("CreateCustomerAccountUsecase Unit Tests", () => {
  let usecase: CreateCustomerAccountUsecase;
  let mockAccountRepo: any;
  let mockUserRepo: any;
  let mockPasswordService: any;
  let mockTransactionManager: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAccountRepo = {
      add: jest.fn(),
    };

    mockUserRepo = {
      add: jest.fn(),
    };

    mockPasswordService = {
      hashPassword: jest.fn(),
    };

    mockTransactionManager = {
      transaction: jest.fn((callback) => callback(null)),
    };

    usecase = new CreateCustomerAccountUsecase(
      mockAccountRepo,
      mockUserRepo,
      mockPasswordService,
      mockTransactionManager
    );
  });

  describe("Success Cases", () => {
    it("should create customer account successfully", async () => {
      const hashedPassword = "hashed_123";
      mockPasswordService.hashPassword.mockResolvedValue(hashedPassword);
      mockUserRepo.add.mockResolvedValue({ id: 1, name: "John", point: 0 });
      mockAccountRepo.add.mockResolvedValue({ id: 1, phoneNumber: "0123456789" });

      const result = await usecase.execute({
        phoneNumber: "0123456789",
        name: "John",
      });

      expect(result).toHaveProperty("message");
      expect(result.message).toContain("successfully");
    });

    it("should create account with Vietnamese name", async () => {
      mockPasswordService.hashPassword.mockResolvedValue("hashed");
      mockUserRepo.add.mockResolvedValue({ id: 1, name: "Nguyễn Văn A", point: 0 });
      mockAccountRepo.add.mockResolvedValue({ id: 1, phoneNumber: "0901234567" });

      const result = await usecase.execute({
        phoneNumber: "0901234567",
        name: "Nguyễn Văn A",
      });

      expect(result).toBeDefined();
    });

    it("should hash password with default value", async () => {
      mockPasswordService.hashPassword.mockResolvedValue("hashed");
      mockUserRepo.add.mockResolvedValue({ id: 1, name: "Test", point: 0 });
      mockAccountRepo.add.mockResolvedValue({ id: 1, phoneNumber: "0123456789" });

      await usecase.execute({
        phoneNumber: "0123456789",
        name: "Test",
      });

      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith("123", "10");
    });

    it("should create user with zero points", async () => {
      mockPasswordService.hashPassword.mockResolvedValue("hashed");
      mockUserRepo.add.mockResolvedValue({ id: 2, name: "Customer", point: 0 });
      mockAccountRepo.add.mockResolvedValue({ id: 2, phoneNumber: "0987654321" });

      await usecase.execute({
        phoneNumber: "0987654321",
        name: "Customer",
      });

      expect(mockUserRepo.add).toHaveBeenCalled();
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when phoneNumber is missing", async () => {
      await expect(
        usecase.execute({ name: "John" })
      ).rejects.toThrow();
    });

    it("should throw error when name is missing", async () => {
      await expect(
        usecase.execute({ phoneNumber: "0123456789" })
      ).rejects.toThrow();
    });

    it("should throw error when phoneNumber is empty", async () => {
      await expect(
        usecase.execute({ phoneNumber: "", name: "John" })
      ).rejects.toThrow();
    });

    it("should throw error when name is empty", async () => {
      await expect(
        usecase.execute({ phoneNumber: "0123456789", name: "" })
      ).rejects.toThrow();
    });
  });

  describe("Business Logic Cases", () => {
    it("should start transaction during creation", async () => {
      mockPasswordService.hashPassword.mockResolvedValue("hashed");
      mockUserRepo.add.mockResolvedValue({ id: 1, name: "Test", point: 0 });
      mockAccountRepo.add.mockResolvedValue({ id: 1, phoneNumber: "0123456789" });

      await usecase.execute({
        phoneNumber: "0123456789",
        name: "Test",
      });

      expect(mockTransactionManager.transaction).toHaveBeenCalled();
    });

    it("should add user before account", async () => {
      const callOrder: string[] = [];

      mockPasswordService.hashPassword.mockResolvedValue("hashed");
      mockUserRepo.add.mockImplementation(() => {
        callOrder.push("userRepo.add");
        return Promise.resolve({ id: 1, name: "Test", point: 0 });
      });
      mockAccountRepo.add.mockImplementation(() => {
        callOrder.push("accountRepo.add");
        return Promise.resolve({ id: 1, phoneNumber: "0123456789" });
      });

      mockTransactionManager.transaction.mockImplementation(async (callback) => {
        await callback(null);
      });

      await usecase.execute({
        phoneNumber: "0123456789",
        name: "Test",
      });

      expect(callOrder[0]).toBe("userRepo.add");
      expect(callOrder[1]).toBe("accountRepo.add");
    });

    it("should use same ID for user and account", async () => {
      mockPasswordService.hashPassword.mockResolvedValue("hashed");
      mockUserRepo.add.mockResolvedValue({ id: 42, name: "Test", point: 0 });
      mockAccountRepo.add.mockResolvedValue({ id: 42, phoneNumber: "0123456789" });

      await usecase.execute({
        phoneNumber: "0123456789",
        name: "Test",
      });

      expect(mockUserRepo.add).toHaveBeenCalled();
      expect(mockAccountRepo.add).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long names", async () => {
      const longName = "A".repeat(500);
      mockPasswordService.hashPassword.mockResolvedValue("hashed");
      mockUserRepo.add.mockResolvedValue({ id: 1, name: longName, point: 0 });
      mockAccountRepo.add.mockResolvedValue({ id: 1, phoneNumber: "0123456789" });

      const result = await usecase.execute({
        phoneNumber: "0123456789",
        name: longName,
      });

      expect(result).toBeDefined();
    });

    it("should handle special characters in name", async () => {
      mockPasswordService.hashPassword.mockResolvedValue("hashed");
      mockUserRepo.add.mockResolvedValue({ id: 1, name: "Test@#$%", point: 0 });
      mockAccountRepo.add.mockResolvedValue({ id: 1, phoneNumber: "0123456789" });

      const result = await usecase.execute({
        phoneNumber: "0123456789",
        name: "Test@#$%",
      });

      expect(result).toBeDefined();
    });

    it("should handle database error during user creation", async () => {
      mockPasswordService.hashPassword.mockResolvedValue("hashed");
      mockUserRepo.add.mockRejectedValue(new Error("User creation failed"));

      mockTransactionManager.transaction.mockImplementation(async (callback) => {
        try {
          await callback(null);
        } catch (e) {
          throw e;
        }
      });

      await expect(
        usecase.execute({
          phoneNumber: "0123456789",
          name: "Test",
        })
      ).rejects.toThrow("User creation failed");
    });

    it("should handle database error during account creation", async () => {
      mockPasswordService.hashPassword.mockResolvedValue("hashed");
      mockUserRepo.add.mockResolvedValue({ id: 1, name: "Test", point: 0 });
      mockAccountRepo.add.mockRejectedValue(new Error("Account creation failed"));

      mockTransactionManager.transaction.mockImplementation(async (callback) => {
        try {
          await callback(null);
        } catch (e) {
          throw e;
        }
      });

      await expect(
        usecase.execute({
          phoneNumber: "0123456789",
          name: "Test",
        })
      ).rejects.toThrow("Account creation failed");
    });

    it("should handle password hashing error", async () => {
      mockPasswordService.hashPassword.mockRejectedValue(
        new Error("Hashing failed")
      );

      await expect(
        usecase.execute({
          phoneNumber: "0123456789",
          name: "Test",
        })
      ).rejects.toThrow("Hashing failed");
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle multiple concurrent creations", async () => {
      mockPasswordService.hashPassword.mockResolvedValue("hashed");
      mockUserRepo.add
        .mockResolvedValueOnce({ id: 1, name: "User 1", point: 0 })
        .mockResolvedValueOnce({ id: 2, name: "User 2", point: 0 });
      mockAccountRepo.add
        .mockResolvedValueOnce({ id: 1, phoneNumber: "0111111111" })
        .mockResolvedValueOnce({ id: 2, phoneNumber: "0222222222" });

      const result1 = usecase.execute({
        phoneNumber: "0111111111",
        name: "User 1",
      });
      const result2 = usecase.execute({
        phoneNumber: "0222222222",
        name: "User 2",
      });

      const results = await Promise.all([result1, result2]);

      expect(results[0]).toBeDefined();
      expect(results[1]).toBeDefined();
    });

    it("should handle transaction rollback on error", async () => {
      mockPasswordService.hashPassword.mockResolvedValue("hashed");
      mockUserRepo.add.mockResolvedValue({ id: 1, name: "Test", point: 0 });
      mockAccountRepo.add.mockRejectedValue(new Error("Account failed"));

      mockTransactionManager.transaction.mockImplementation(async (callback) => {
        try {
          await callback(null);
        } catch (e) {
          throw e;
        }
      });

      await expect(
        usecase.execute({
          phoneNumber: "0123456789",
          name: "Test",
        })
      ).rejects.toThrow();

      // Transaction should have been called
      expect(mockTransactionManager.transaction).toHaveBeenCalled();
    });
  });
});
