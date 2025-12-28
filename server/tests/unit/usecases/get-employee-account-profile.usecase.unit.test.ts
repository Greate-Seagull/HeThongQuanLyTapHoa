import { GetEmployeeAccountProfileUsecase } from "../../../src/application/services/employee-account/get-employee-account-profile.usecase";

describe("GetEmployeeAccountProfileUsecase Unit Tests", () => {
  let usecase: GetEmployeeAccountProfileUsecase;
  let mockEmployeeAccountRepo: any;
  let mockEmployeeRepo: any;
  let mockEmployeeRead: any;

  beforeEach(() => {
    mockEmployeeAccountRepo = {
      findByEmployeeId: jest.fn(),
    };

    mockEmployeeRepo = {
      getById: jest.fn(),
    };

    mockEmployeeRead = {
      getPositionById: jest.fn(),
    };

    usecase = new GetEmployeeAccountProfileUsecase(
      mockEmployeeAccountRepo,
      mockEmployeeRepo,
      mockEmployeeRead
    );
  });

  describe("Success Cases", () => {
    it("should get employee account profile successfully", async () => {
      const mockAccount = {
        id: 100,
        employeeId: 1,
        username: "user123",
      };
      const mockEmployee = {
        id: 1,
        name: "Nguyễn Văn A",
        position: "MANAGER",
      };

      mockEmployeeAccountRepo.findByEmployeeId.mockResolvedValue(mockAccount);
      mockEmployeeRepo.getById.mockResolvedValue(mockEmployee);

      const result = await usecase.execute({ id: 1 });

      expect(result.id).toBe(100);
      expect(result.employeeId).toBe(1);
      expect(result.username).toBe("user123");
      expect(result.name).toBe("Nguyễn Văn A");
      expect(result.position).toBe("MANAGER");
    });

    it("should fallback to read accessor when employee not found in repo", async () => {
      const mockAccount = {
        id: 100,
        employeeId: 2,
        username: "user456",
      };
      const mockEmployee = {
        name: "Trần Thị B",
        position: "SALES",
      };

      mockEmployeeAccountRepo.findByEmployeeId.mockResolvedValue(mockAccount);
      mockEmployeeRepo.getById.mockResolvedValue(null);
      mockEmployeeRead.getPositionById.mockResolvedValue(mockEmployee);

      const result = await usecase.execute({ id: 2 });

      expect(mockEmployeeRead.getPositionById).toHaveBeenCalledWith(2);
      expect(result.name).toBe("Trần Thị B");
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when account not found", async () => {
      mockEmployeeAccountRepo.findByEmployeeId.mockResolvedValue(null);

      await expect(
        usecase.execute({ id: 999 })
      ).rejects.toThrow("Employee account not found");
    });

    it("should throw error when employee not found", async () => {
      mockEmployeeAccountRepo.findByEmployeeId.mockResolvedValue({
        id: 100,
        employeeId: 1,
      });
      mockEmployeeRepo.getById.mockResolvedValue(null);
      mockEmployeeRead.getPositionById.mockResolvedValue(null);

      await expect(
        usecase.execute({ id: 1 })
      ).rejects.toThrow("Employee not found");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      mockEmployeeAccountRepo.findByEmployeeId.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        usecase.execute({ id: 1 })
      ).rejects.toThrow("Database error");
    });
  });
});
