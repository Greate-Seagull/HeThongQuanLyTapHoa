
import { EmployeeRepository } from "../../../application/repositories/employee.repository";
import { EmployeeAccountRepository } from "../../../application/repositories/employee-account.repository";
import { PasswordService } from "../../../domain/services/encrypt.service";
import { Employee } from "../../../domain/entities/employee";
import { EmployeeAccount } from "../../../domain/entities/employee-account";
import { CreateEmployeeWithAccountUsecase } from "../../../application/services/employee/create-employee-with-account.usecase";

export function buildCreateEmployeeWithAccountUsecase(
  employeeRepo: EmployeeRepository,
  employeeAccountRepo: EmployeeAccountRepository,
  passwordService: PasswordService
) {
  return {
    async execute({ name, username, password, position }: { name: string; username: string; password: string; position: string }) {
      // Check username uniqueness
      const existingAccount = await employeeAccountRepo.getByUsername(username);
      if (existingAccount) throw new Error("Username already exists");

      // Create employee entity
      const employeeEntity = Employee.create(name, position);
      const employee = await employeeRepo.add(employeeEntity);

      // Hash password
      const salt = passwordService.generateSalt();
      const hash = passwordService.hashPassword(password, salt);

      // Create employee account entity
      const accountEntity = EmployeeAccount.create(
        username,
        hash,
        salt,
        employee.id
      );
      await employeeAccountRepo.add(accountEntity);

      return employee;
    }
  };
}
