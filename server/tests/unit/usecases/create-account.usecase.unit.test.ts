import { CreateAccountUsecase } from "../../../src/application/services/employee-account/create-account.usecase";

describe("CreateAccountUsecase Unit Tests", () => {
  let usecase: CreateAccountUsecase;
  let mockEmployeeAccountRead: any;
  let mockPasswordService: any;
  let mockEmployeeAccountRepo: any;
  let mockEmployeeRepo: any;
  let mockTransactionManager: any;
  let mockTx: any;

  beforeEach(() => {
    mockTx = {};

    mockEmployeeAccountRead = {};
    
    mockPasswordService = {
      generateSalt: jest.fn().mockReturnValue("salt123"),
      hashPassword: jest.fn().mockResolvedValue("hashedpass"),
    };

    mockEmployeeAccountRepo = {
      add: jest.fn(),
    };

    mockEmployeeRepo = {
      add: jest.fn(),
    };

    mockTransactionManager = {
      transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(mockTx);
      }),
    };

    usecase = new CreateAccountUsecase(
      mockEmployeeAccountRead,
      mockPasswordService,
      mockEmployeeAccountRepo,
      mockEmployeeRepo,
      mockTransactionManager
    );
  });

  describe("Success Cases", () => {
    it("should create account successfully", async () => {
      mockEmployeeRepo.add.mockResolvedValue({ id: 1, name: "Test" });
      mockEmployeeAccountRepo.add.mockResolvedValue({
        id: 100,
        username: "testuser",
      });

      const result = await usecase.execute({
        username: "testuser",
        name: "Test Employee",
        position: "SALES",
      });

      expect(mockPasswordService.generateSalt).toHaveBeenCalled();
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(
        "123",
        "salt123"
      );
    });

    it("should use default position when not provided", async () => {
      mockEmployeeRepo.add.mockResolvedValue({ id: 2 });
      mockEmployeeAccountRepo.add.mockResolvedValue({ id: 200 });

      await usecase.execute({
        username: "user2",
        name: "Employee 2",
      });

      expect(mockEmployeeRepo.add).toHaveBeenCalled();
    });
  });
});
