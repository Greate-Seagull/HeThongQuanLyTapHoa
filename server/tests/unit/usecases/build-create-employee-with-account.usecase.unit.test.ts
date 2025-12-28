import { buildCreateEmployeeWithAccountUsecase } from "../../../src/application/services/employee/build-create-employee-with-account.usecase";

describe("BuildCreateEmployeeWithAccountUsecase Unit Tests", () => {
  let usecase: any;
  let mockEmployeeRepo: any;
  let mockEmployeeAccountRepo: any;
  let mockPasswordService: any;

  beforeEach(() => {
    mockEmployeeRepo = {
      add: jest.fn(),
    };

    mockEmployeeAccountRepo = {
      getByUsername: jest.fn(),
      add: jest.fn(),
    };

    mockPasswordService = {
      generateSalt: jest.fn().mockReturnValue("salt123"),
      hashPassword: jest.fn().mockReturnValue("hashedpass"),
    };

    usecase = buildCreateEmployeeWithAccountUsecase(
      mockEmployeeRepo,
      mockEmployeeAccountRepo,
      mockPasswordService
    );
  });

  describe("Success Cases", () => {
    it("should create employee with account successfully", async () => {
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue(null);
      mockEmployeeRepo.add.mockResolvedValue({
        id: 1,
        name: "Test Employee",
        position: "SALES",
      });
      mockEmployeeAccountRepo.add.mockResolvedValue({
        id: 100,
        username: "testuser",
      });

      const result = await usecase.execute({
        name: "Test Employee",
        username: "testuser",
        password: "password123",
        position: "SALES",
      });

      expect(mockEmployeeAccountRepo.getByUsername).toHaveBeenCalledWith(
        "testuser"
      );
      expect(mockPasswordService.generateSalt).toHaveBeenCalled();
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(
        "password123",
        "salt123"
      );
      expect(mockEmployeeRepo.add).toHaveBeenCalled();
      expect(mockEmployeeAccountRepo.add).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });

    it("should create employee with MANAGER position", async () => {
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue(null);
      mockEmployeeRepo.add.mockResolvedValue({
        id: 2,
        name: "Manager",
        position: "MANAGER",
      });

      const result = await usecase.execute({
        name: "Manager",
        username: "manager",
        password: "pass",
        position: "MANAGER",
      });

      expect(result.position).toBe("MANAGER");
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when username already exists", async () => {
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue({
        id: 100,
        username: "existing",
      });

      await expect(
        usecase.execute({
          name: "Test",
          username: "existing",
          password: "pass",
          position: "SALES",
        })
      ).rejects.toThrow("Username already exists");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors during username check", async () => {
      mockEmployeeAccountRepo.getByUsername.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        usecase.execute({
          name: "Test",
          username: "test",
          password: "pass",
          position: "SALES",
        })
      ).rejects.toThrow("Database error");
    });

    it("should handle errors during employee creation", async () => {
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue(null);
      mockEmployeeRepo.add.mockRejectedValue(new Error("Create failed"));

      await expect(
        usecase.execute({
          name: "Test",
          username: "test",
          password: "pass",
          position: "SALES",
        })
      ).rejects.toThrow("Create failed");
    });
  });
});
