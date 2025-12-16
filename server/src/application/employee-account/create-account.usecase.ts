import { EmployeeAccountReadAccessor } from "../../infrastructure/read-accessors/employee-account.read-accessor";
import { PasswordService } from "../../domain/services/encrypt.service";
import { EmployeeAccountRepository } from "../../infrastructure/repositories/employee-account.repository";
import { EmployeeRepository } from "../../infrastructure/repositories/employee.repository";
import { PrismaTransactionManager } from "../../infrastructure/transaction";
import { logger } from "../../domain/services/logger.service";
import z from "zod";
import { Employee } from "../../domain/employee";
import { EmployeeAccount } from "../../domain/employee-account";
import { create } from "../../domain/services/factory.service";

const inputSchema = z.object({
  username: z.string(),
  name: z.string(),
  position: z.string().optional(),
});

export class CreateAccountUsecase {
  constructor(
    private readonly employeeAccountRead: EmployeeAccountReadAccessor,
    private readonly passwordService: PasswordService,
    private readonly employeeAccountRepo: EmployeeAccountRepository,
    private readonly employeeRepo: EmployeeRepository,
    private readonly transactionManager: PrismaTransactionManager
  ) {}

  async execute(input: any) {
    const parsed = inputSchema.parse(input);
    const log = logger.child({ task: "Create employee account" });
    log.info("Task started");
    const salt = this.passwordService.generateSalt();

    const hashedPassword = await this.passwordService.hashPassword("123", salt);

    await this.transactionManager.transaction(async (tx) => {
      const employee = create(Employee, {
        name: parsed.name,
        position: parsed.position || "STAFF",
      });
      const savedEmployee = await this.employeeRepo.add(tx, employee);
	  console.log(savedEmployee);
	  
      const account = create(EmployeeAccount, {
        employeeId: savedEmployee._id,
        username: parsed.username,
        passwordHash: hashedPassword,
        salt: salt,
      });
      await this.employeeAccountRepo.add(tx, account);
    });

    log.info("Task completed");
    return { message: "Created successfully" };
  }
}
