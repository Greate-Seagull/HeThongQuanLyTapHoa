import {
  Employee,
  EmployeePosition,
} from "../../../src/domain/entities/employee";

describe("Employee Entity Unit Tests", () => {
  describe("create", () => {
    it("should create employee with SALES position", () => {
      const employee = Employee.create("Nguyễn Văn A", "SALES");

      expect(employee.name).toBe("Nguyễn Văn A");
      expect(employee.position).toBe(EmployeePosition.SALES);
    });

    it("should create employee with INVENTORY position", () => {
      const employee = Employee.create("Trần Thị B", "INVENTORY");

      expect(employee.name).toBe("Trần Thị B");
      expect(employee.position).toBe(EmployeePosition.INVENTORY);
    });

    it("should create employee with RECEIVING position", () => {
      const employee = Employee.create("Lê Văn C", "RECEIVING");

      expect(employee.position).toBe(EmployeePosition.RECEIVING);
    });

    it("should create employee with MANAGER position", () => {
      const employee = Employee.create("Phạm Văn D", "MANAGER");

      expect(employee.position).toBe(EmployeePosition.MANAGER);
    });

    it("should throw error with invalid position", () => {
      expect(() =>
        Employee.create("Test Employee", "INVALID_POSITION")
      ).toThrow("Invalid position");
    });

    it("should handle Vietnamese names correctly", () => {
      const employee = Employee.create("Nguyễn Thị Hồng Nhung", "SALES");

      expect(employee.name).toBe("Nguyễn Thị Hồng Nhung");
    });
  });

  describe("update", () => {
    it("should update employee name", () => {
      const employee = Employee.create("Old Name", "SALES");
      employee.update("New Name");

      expect(employee.name).toBe("New Name");
      expect(employee.position).toBe(EmployeePosition.SALES);
    });

    it("should update employee position", () => {
      const employee = Employee.create("Test Employee", "SALES");
      employee.update(undefined, "MANAGER");

      expect(employee.name).toBe("Test Employee");
      expect(employee.position).toBe(EmployeePosition.MANAGER);
    });

    it("should update both name and position", () => {
      const employee = Employee.create("Old Name", "SALES");
      employee.update("New Name", "INVENTORY");

      expect(employee.name).toBe("New Name");
      expect(employee.position).toBe(EmployeePosition.INVENTORY);
    });

    it("should not update if parameters are undefined", () => {
      const employee = Employee.create("Original Name", "SALES");
      employee.update(undefined, undefined);

      expect(employee.name).toBe("Original Name");
      expect(employee.position).toBe(EmployeePosition.SALES);
    });

    it("should throw error when updating to invalid position", () => {
      const employee = Employee.create("Test", "SALES");

      expect(() => employee.update(undefined, "INVALID")).toThrow(
        "Invalid position"
      );
    });
  });

  describe("business scenarios", () => {
    it("should handle sales employee scenario", () => {
      const salesEmployee = Employee.create("Nguyễn Văn A", "SALES");

      expect(salesEmployee.position).toBe(EmployeePosition.SALES);
    });

    it("should handle inventory employee scenario", () => {
      const inventoryEmployee = Employee.create("Trần Thị B", "INVENTORY");

      expect(inventoryEmployee.position).toBe(EmployeePosition.INVENTORY);
    });

    it("should handle receiving employee scenario", () => {
      const receivingEmployee = Employee.create("Lê Văn C", "RECEIVING");

      expect(receivingEmployee.position).toBe(EmployeePosition.RECEIVING);
    });

    it("should handle manager scenario", () => {
      const manager = Employee.create("Phạm Văn D", "MANAGER");

      expect(manager.position).toBe(EmployeePosition.MANAGER);
    });

    it("should handle promotion scenario", () => {
      const employee = Employee.create("Nguyễn Văn E", "SALES");

      // Promoted to manager
      employee.update(undefined, "MANAGER");

      expect(employee.position).toBe(EmployeePosition.MANAGER);
    });

    it("should handle name change scenario (marriage)", () => {
      const employee = Employee.create("Nguyễn Thị A", "SALES");

      employee.update("Trần Thị A");

      expect(employee.name).toBe("Trần Thị A");
    });
  });

  describe("data integrity", () => {
    it("should maintain data consistency", () => {
      const employee = Employee.create("Test Employee", "INVENTORY");

      expect(employee.name).toBe("Test Employee");
      expect(employee.position).toBe(EmployeePosition.INVENTORY);
    });
  });
});
