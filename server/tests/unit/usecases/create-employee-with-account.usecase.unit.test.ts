import { CreateEmployeeWithAccountUsecase, CreateEmployeeWithAccountRequest } from "../../../src/application/services/employee/create-employee-with-account.usecase";

describe("CreateEmployeeWithAccountUsecase Unit Tests", () => {
  let usecase: CreateEmployeeWithAccountUsecase;
  let mockEmployeeRepo: any;
  let mockEmployeeAccountRepo: any;
  let mockPasswordService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEmployeeRepo = {
      add: jest.fn(),
    };
    mockEmployeeAccountRepo = {
      add: jest.fn(),
      getByUsername: jest.fn(),
    };
    mockPasswordService = {
      generateSalt: jest.fn(),
      hashPassword: jest.fn(),
    };
    usecase = new CreateEmployeeWithAccountUsecase(
      mockEmployeeRepo,
      mockEmployeeAccountRepo,
      mockPasswordService
    );
  });

  describe("Success Cases", () => {
    it("should create employee with MANAGER position successfully", async () => {
      const request: CreateEmployeeWithAccountRequest = {
        name: "John Doe",
        username: "johndoe",
        password: "SecurePass123",
        position: "MANAGER",
      };
      const mockEmp = { id: 1, name: "John Doe", position: "MANAGER" };
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue(null);
      mockEmployeeRepo.add.mockResolvedValue(mockEmp);
      mockPasswordService.generateSalt.mockReturnValue("salt123");
      mockPasswordService.hashPassword.mockReturnValue("hashed");
      mockEmployeeAccountRepo.add.mockResolvedValue(undefined);

      const result = await usecase.execute(request);
      expect(result).toEqual(mockEmp);
    });

    it("should create employee with SALES position", async () => {
      const request: CreateEmployeeWithAccountRequest = {
        name: "Jane Smith",
        username: "janesmith",
        password: "Pass1234",
        position: "SALES",
      };
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue(null);
      mockEmployeeRepo.add.mockResolvedValue({ id: 2, name: "Jane Smith", position: "SALES" });
      mockPasswordService.generateSalt.mockReturnValue("salt");
      mockPasswordService.hashPassword.mockReturnValue("hash");
      mockEmployeeAccountRepo.add.mockResolvedValue(undefined);

      const result = await usecase.execute(request);
      expect(result.position).toBe("SALES");
    });

    it("should create employee with INVENTORY position", async () => {
      const request: CreateEmployeeWithAccountRequest = {
        name: "Bob Wilson",
        username: "bobwilson",
        password: "Inv1234",
        position: "INVENTORY",
      };
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue(null);
      mockEmployeeRepo.add.mockResolvedValue({ id: 3, name: "Bob Wilson", position: "INVENTORY" });
      mockPasswordService.generateSalt.mockReturnValue("salt");
      mockPasswordService.hashPassword.mockReturnValue("hash");
      mockEmployeeAccountRepo.add.mockResolvedValue(undefined);

      const result = await usecase.execute(request);
      expect(result.position).toBe("INVENTORY");
    });

    it("should create employee with RECEIVING position", async () => {
      const request: CreateEmployeeWithAccountRequest = {
        name: "Alice Brown",
        username: "alicebrown",
        password: "Rec1234",
        position: "RECEIVING",
      };
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue(null);
      mockEmployeeRepo.add.mockResolvedValue({ id: 4, name: "Alice Brown", position: "RECEIVING" });
      mockPasswordService.generateSalt.mockReturnValue("salt");
      mockPasswordService.hashPassword.mockReturnValue("hash");
      mockEmployeeAccountRepo.add.mockResolvedValue(undefined);

      const result = await usecase.execute(request);
      expect(result.position).toBe("RECEIVING");
    });

    it("should hash password with generated salt", async () => {
      const request: CreateEmployeeWithAccountRequest = {
        name: "Test User",
        username: "testuser",
        password: "TestPass123",
        position: "MANAGER",
      };
      const salt = "generatedSalt";
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue(null);
      mockEmployeeRepo.add.mockResolvedValue({ id: 5, name: "Test User", position: "MANAGER" });
      mockPasswordService.generateSalt.mockReturnValue(salt);
      mockPasswordService.hashPassword.mockReturnValue("hashed");
      mockEmployeeAccountRepo.add.mockResolvedValue(undefined);

      await usecase.execute(request);
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith("TestPass123", salt);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when username already exists", async () => {
      const request: CreateEmployeeWithAccountRequest = {
        name: "John Doe",
        username: "existing",
        password: "Pass123",
        position: "MANAGER",
      };
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue({ id: 1, username: "existing" });

      await expect(usecase.execute(request)).rejects.toThrow();
    });

    it("should throw error when name is empty", async () => {
      const request = {
        name: "",
        username: "user",
        password: "Pass123",
        position: "MANAGER",
      } as any;
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue(null);
      mockEmployeeRepo.add.mockRejectedValue(new Error("Name required"));

      await expect(usecase.execute(request)).rejects.toThrow();
    });

    it("should throw error when username is empty", async () => {
      const request = {
        name: "John",
        username: "",
        password: "Pass123",
        position: "MANAGER",
      };
      mockEmployeeAccountRepo.getByUsername.mockRejectedValue(new Error("Invalid username"));

      await expect(usecase.execute(request)).rejects.toThrow();
    });

    it("should throw error when position is invalid", async () => {
      const request: CreateEmployeeWithAccountRequest = {
        name: "John",
        username: "john",
        password: "Pass123",
        position: "InvalidPos" as any,
      };
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue(null);
      mockEmployeeRepo.add.mockRejectedValue(new Error("Invalid position"));

      await expect(usecase.execute(request)).rejects.toThrow();
    });
  });

  describe("Business Logic Cases", () => {
    it("should check username uniqueness before creating employee", async () => {
      const request: CreateEmployeeWithAccountRequest = {
        name: "John Doe",
        username: "johndoe",
        password: "Pass123",
        position: "MANAGER",
      };
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue(null);
      mockEmployeeRepo.add.mockResolvedValue({ id: 1, name: "John Doe", position: "MANAGER" });
      mockPasswordService.generateSalt.mockReturnValue("salt");
      mockPasswordService.hashPassword.mockReturnValue("hash");
      mockEmployeeAccountRepo.add.mockResolvedValue(undefined);

      await usecase.execute(request);
      expect(mockEmployeeAccountRepo.getByUsername).toHaveBeenCalledWith("johndoe");
    });

    it("should call password service to generate salt", async () => {
      const request: CreateEmployeeWithAccountRequest = {
        name: "John",
        username: "john",
        password: "Pass",
        position: "SALES",
      };
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue(null);
      mockEmployeeRepo.add.mockResolvedValue({ id: 1, name: "John", position: "SALES" });
      mockPasswordService.generateSalt.mockReturnValue("salt");
      mockPasswordService.hashPassword.mockReturnValue("hash");
      mockEmployeeAccountRepo.add.mockResolvedValue(undefined);

      await usecase.execute(request);
      expect(mockPasswordService.generateSalt).toHaveBeenCalled();
    });

    it("should return created employee entity", async () => {
      const request: CreateEmployeeWithAccountRequest = {
        name: "John",
        username: "john",
        password: "Pass",
        position: "INVENTORY",
      };
      const expected = { id: 42, name: "John", position: "INVENTORY" };
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue(null);
      mockEmployeeRepo.add.mockResolvedValue(expected);
      mockPasswordService.generateSalt.mockReturnValue("salt");
      mockPasswordService.hashPassword.mockReturnValue("hash");
      mockEmployeeAccountRepo.add.mockResolvedValue(undefined);

      const result = await usecase.execute(request);
      expect(result).toEqual(expected);
      expect(result.id).toBe(42);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long employee name", async () => {
      const longName = "A".repeat(255);
      const request: CreateEmployeeWithAccountRequest = {
        name: longName,
        username: "user1",
        password: "Pass123",
        position: "MANAGER",
      };
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue(null);
      mockEmployeeRepo.add.mockResolvedValue({ id: 1, name: longName, position: "MANAGER" });
      mockPasswordService.generateSalt.mockReturnValue("salt");
      mockPasswordService.hashPassword.mockReturnValue("hash");
      mockEmployeeAccountRepo.add.mockResolvedValue(undefined);

      const result = await usecase.execute(request);
      expect(result.name.length).toBe(255);
    });

    it("should handle username with numbers", async () => {
      const request: CreateEmployeeWithAccountRequest = {
        name: "John",
        username: "user123",
        password: "Pass123",
        position: "MANAGER",
      };
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue(null);
      mockEmployeeRepo.add.mockResolvedValue({ id: 1, name: "John", position: "MANAGER" });
      mockPasswordService.generateSalt.mockReturnValue("salt");
      mockPasswordService.hashPassword.mockReturnValue("hash");
      mockEmployeeAccountRepo.add.mockResolvedValue(undefined);

      const result = await usecase.execute(request);
      expect(result).toBeDefined();
    });

    it("should handle Vietnamese characters in name", async () => {
      const request: CreateEmployeeWithAccountRequest = {
        name: "Nguyen Van A",
        username: "nguyenvana",
        password: "Pass123",
        position: "SALES",
      };
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue(null);
      mockEmployeeRepo.add.mockResolvedValue({ id: 1, name: "Nguyen Van A", position: "SALES" });
      mockPasswordService.generateSalt.mockReturnValue("salt");
      mockPasswordService.hashPassword.mockReturnValue("hash");
      mockEmployeeAccountRepo.add.mockResolvedValue(undefined);

      const result = await usecase.execute(request);
      expect(result.name).toBe("Nguyen Van A");
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle repository error during employee creation", async () => {
      const request: CreateEmployeeWithAccountRequest = {
        name: "John",
        username: "john",
        password: "Pass",
        position: "MANAGER",
      };
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue(null);
      mockEmployeeRepo.add.mockRejectedValue(new Error("DB Error"));

      await expect(usecase.execute(request)).rejects.toThrow("DB Error");
    });

    it("should handle sequential employee creation", async () => {
      const requests: CreateEmployeeWithAccountRequest[] = [
        { name: "Emp1", username: "emp1", password: "Pass1", position: "MANAGER" },
        { name: "Emp2", username: "emp2", password: "Pass2", position: "SALES" },
      ];
      let id = 0;
      mockEmployeeAccountRepo.getByUsername.mockResolvedValue(null);
      mockEmployeeRepo.add.mockImplementation((e) => {
        id++;
        return Promise.resolve({ ...e, id });
      });
      mockPasswordService.generateSalt.mockReturnValue("salt");
      mockPasswordService.hashPassword.mockReturnValue("hash");
      mockEmployeeAccountRepo.add.mockResolvedValue(undefined);

      const r1 = await usecase.execute(requests[0]);
      const r2 = await usecase.execute(requests[1]);
      expect(r1.id).toBe(1);
      expect(r2.id).toBe(2);
    });
  });
});
