import { UpdateEmployeeAccountUsecase } from "../../../src/application/services/employee-account/update-employee-account.usecase";

describe("UpdateEmployeeAccountUsecase Unit Tests", () => {
  let usecase: UpdateEmployeeAccountUsecase;
  let mockEmployeeAccountRepo: any;
  let mockEmployeeAccountRead: any;
  let mockEmployeeRepo: any;
  let mockEmployeeRead: any;

  beforeEach(() => {
    mockEmployeeAccountRepo = {
      getById: jest.fn(),
      save: jest.fn(),
    };

    mockEmployeeAccountRead = {};

    mockEmployeeRepo = {
      getById: jest.fn(),
      save: jest.fn(),
    };

    mockEmployeeRead = {
      getPositionById: jest.fn(),
    };

    usecase = new UpdateEmployeeAccountUsecase(
      mockEmployeeAccountRepo,
      mockEmployeeAccountRead,
      mockEmployeeRepo,
      mockEmployeeRead
    );
  });

  describe("Success Cases", () => {
    it("should update username only", async () => {
      const mockAccount = {
        id: 1,
        employeeId: 10,
        username: "olduser",
        updateUsername: jest.fn(),
      };
      const mockEmployee = {
        name: "Nguyễn Văn A",
        position: "Manager",
      };

      mockEmployeeAccountRepo.getById.mockResolvedValue(mockAccount);
      mockEmployeeAccountRepo.save.mockResolvedValue({
        ...mockAccount,
        username: "newuser",
      });
      mockEmployeeRead.getPositionById.mockResolvedValue(mockEmployee);

      const result = await usecase.execute({
        id: 1,
        username: "newuser",
      });

      expect(mockAccount.updateUsername).toHaveBeenCalledWith("newuser");
      expect(mockEmployeeAccountRepo.save).toHaveBeenCalledWith(mockAccount);
      expect(result.username).toBe("newuser");
      expect(result.name).toBe("Nguyễn Văn A");
      expect(result.position).toBe("Manager");
    });

    it("should update name and position", async () => {
      const mockAccount = {
        id: 1,
        employeeId: 10,
        username: "user123",
        updateUsername: jest.fn(),
      };
      const mockEmployee = {
        id: 10,
        name: "Old Name",
        position: "Old Position",
        update: jest.fn().mockImplementation(function(name, position) {
          if (name !== undefined) this.name = name;
          if (position !== undefined) this.position = position;
        }),
      };

      mockEmployeeAccountRepo.getById.mockResolvedValue(mockAccount);
      mockEmployeeAccountRepo.save.mockResolvedValue(mockAccount);
      mockEmployeeRepo.getById.mockResolvedValue(mockEmployee);
      mockEmployeeRepo.save.mockImplementation((emp) => Promise.resolve(emp));

      const result = await usecase.execute({
        id: 1,
        name: "Trần Thị B",
        position: "Supervisor",
      });

      expect(mockEmployee.update).toHaveBeenCalledWith(
        "Trần Thị B",
        "Supervisor",
        undefined // avatar parameter
      );
      expect(mockEmployeeRepo.save).toHaveBeenCalledWith(mockEmployee);
      expect(result.name).toBe("Trần Thị B");
      expect(result.position).toBe("Supervisor");
    });

    it("should update all fields together", async () => {
      const mockAccount = {
        id: 1,
        employeeId: 10,
        username: "olduser",
        updateUsername: jest.fn(),
      };
      const mockEmployee = {
        name: "Old Name",
        position: "Old Position",
        update: jest.fn(),
      };

      mockEmployeeAccountRepo.getById.mockResolvedValue(mockAccount);
      mockEmployeeAccountRepo.save.mockResolvedValue({
        ...mockAccount,
        username: "newuser",
      });
      mockEmployeeRepo.getById.mockResolvedValue(mockEmployee);
      mockEmployeeRepo.save.mockResolvedValue({
        ...mockEmployee,
        name: "Lê Văn C",
        position: "Staff",
      });

      const result = await usecase.execute({
        id: 1,
        username: "newuser",
        name: "Lê Văn C",
        position: "Staff",
      });

      expect(mockAccount.updateUsername).toHaveBeenCalledWith("newuser");
      expect(mockEmployee.update).toHaveBeenCalledWith("Lê Văn C", "Staff", undefined);
      expect(result.id).toBe(1);
      expect(result.username).toBe("newuser");
    });

    it("should update only name", async () => {
      const mockAccount = {
        id: 1,
        employeeId: 10,
        username: "user123",
        updateUsername: jest.fn(),
      };
      const mockEmployee = {
        name: "Old Name",
        position: "Manager",
        update: jest.fn(),
      };

      mockEmployeeAccountRepo.getById.mockResolvedValue(mockAccount);
      mockEmployeeAccountRepo.save.mockResolvedValue(mockAccount);
      mockEmployeeRepo.getById.mockResolvedValue(mockEmployee);
      mockEmployeeRepo.save.mockResolvedValue({
        ...mockEmployee,
        name: "Phạm Thị D",
      });

      await usecase.execute({
        id: 1,
        name: "Phạm Thị D",
      });

      expect(mockEmployee.update).toHaveBeenCalledWith("Phạm Thị D", undefined, undefined);
    });
  });

  describe("Validation Error Cases", () => {
    it("should throw error when account not found", async () => {
      mockEmployeeAccountRepo.getById.mockResolvedValue(null);

      await expect(
        usecase.execute({
          id: 999,
          username: "newuser",
        })
      ).rejects.toThrow("Employee account not found");
    });

    it("should throw error when employee not found for name/position update", async () => {
      const mockAccount = {
        id: 1,
        employeeId: 10,
        username: "user",
        updateUsername: jest.fn(),
      };

      mockEmployeeAccountRepo.getById.mockResolvedValue(mockAccount);
      mockEmployeeAccountRepo.save.mockResolvedValue(mockAccount);
      mockEmployeeRepo.getById.mockResolvedValue(null);

      await expect(
        usecase.execute({
          id: 1,
          name: "New Name",
        })
      ).rejects.toThrow("Employee not found");
    });

    it("should throw error for invalid id type", async () => {
      await expect(
        usecase.execute({
          id: "invalid",
          username: "user",
        })
      ).rejects.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle Vietnamese names with special characters", async () => {
      const mockAccount = {
        id: 1,
        employeeId: 10,
        username: "user",
        updateUsername: jest.fn(),
      };
      const mockEmployee = {
        name: "Đỗ Thị Ngọc Ánh",
        position: "Manager",
        update: jest.fn(),
      };

      mockEmployeeAccountRepo.getById.mockResolvedValue(mockAccount);
      mockEmployeeAccountRepo.save.mockResolvedValue(mockAccount);
      mockEmployeeRepo.getById.mockResolvedValue(mockEmployee);
      mockEmployeeRepo.save.mockResolvedValue(mockEmployee);

      await usecase.execute({
        id: 1,
        name: "Đỗ Thị Ngọc Ánh",
      });

      expect(mockEmployee.update).toHaveBeenCalledWith(
        "Đỗ Thị Ngọc Ánh",
        undefined,
        undefined
      );
    });

    it("should handle very long usernames", async () => {
      const longUsername = "a".repeat(100);
      const mockAccount = {
        id: 1,
        employeeId: 10,
        username: "short",
        updateUsername: jest.fn(),
      };
      const mockEmployee = {
        name: "Name",
        position: "Position",
      };

      mockEmployeeAccountRepo.getById.mockResolvedValue(mockAccount);
      mockEmployeeAccountRepo.save.mockResolvedValue({
        ...mockAccount,
        username: longUsername,
      });
      mockEmployeeRead.getPositionById.mockResolvedValue(mockEmployee);

      await usecase.execute({
        id: 1,
        username: longUsername,
      });

      expect(mockAccount.updateUsername).toHaveBeenCalledWith(longUsername);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors during account retrieval", async () => {
      mockEmployeeAccountRepo.getById.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        usecase.execute({
          id: 1,
          username: "user",
        })
      ).rejects.toThrow("Database error");
    });

    it("should handle errors during account save", async () => {
      const mockAccount = {
        id: 1,
        employeeId: 10,
        username: "user",
        updateUsername: jest.fn(),
      };

      mockEmployeeAccountRepo.getById.mockResolvedValue(mockAccount);
      mockEmployeeAccountRepo.save.mockRejectedValue(
        new Error("Save failed")
      );

      await expect(
        usecase.execute({
          id: 1,
          username: "newuser",
        })
      ).rejects.toThrow("Save failed");
    });

    it("should handle errors during employee save", async () => {
      const mockAccount = {
        id: 1,
        employeeId: 10,
        username: "user",
        updateUsername: jest.fn(),
      };
      const mockEmployee = {
        name: "Name",
        position: "Position",
        update: jest.fn(),
      };

      mockEmployeeAccountRepo.getById.mockResolvedValue(mockAccount);
      mockEmployeeAccountRepo.save.mockResolvedValue(mockAccount);
      mockEmployeeRepo.getById.mockResolvedValue(mockEmployee);
      mockEmployeeRepo.save.mockRejectedValue(new Error("Employee save failed"));

      await expect(
        usecase.execute({
          id: 1,
          name: "New Name",
        })
      ).rejects.toThrow("Employee save failed");
    });
  });
});
