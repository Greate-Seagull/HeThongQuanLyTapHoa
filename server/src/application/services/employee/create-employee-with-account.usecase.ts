
import { EmployeeRepository } from "../../../application/repositories/employee.repository";
import { EmployeeAccountRepository } from "../../../application/repositories/employee-account.repository";
import { PasswordService } from "../../../domain/services/encrypt.service";
import { Employee } from "../../../domain/entities/employee";
import { EmployeeAccount } from "../../../domain/entities/employee-account";

export interface CreateEmployeeWithAccountRequest {
  name: string;
  username: string;
  password: string;
  position: string;
}

export class CreateEmployeeWithAccountUsecase {
  constructor(
    private employeeRepo: EmployeeRepository,
    private employeeAccountRepo: EmployeeAccountRepository,
    private passwordService: PasswordService
  ) {}

  async execute(request: CreateEmployeeWithAccountRequest) {
    // Check username uniqueness
    const existingAccount = await this.employeeAccountRepo.getByUsername(request.username);
    if (existingAccount) throw new Error("Username already exists");

    // Create employee entity
    const employeeEntity = Employee.create(request.name, request.position);
    const employee = await this.employeeRepo.add(employeeEntity);

    // Hash password
    const salt = this.passwordService.generateSalt();
    const hash = this.passwordService.hashPassword(request.password, salt);

    // Create employee account entity
    const accountEntity = EmployeeAccount.create(
      request.username,
      hash,
      salt,
      employee.id
    );
    await this.employeeAccountRepo.add(accountEntity);

    return employee;
  }
}
