import { z } from "zod";
import { PasswordService } from "../../../domain/services/encrypt.service";
import { Employee } from "../../../domain/entities/employee";
import { EmployeeAccount } from "../../../domain/entities/employee-account";
import { logger } from "../../../domain/services/logger.service";
import { TransactionManager } from "../../transactions/base.transaction";
import { EmployeeRepository } from "../../repositories/employee.repository";
import { EmployeeAccountRepository } from "../../repositories/employee-account.repository";
import { EmployeeAccountReadAccessor } from "../read-accessors/employee-account.read-accessor";
import { PrismaTransactionManager } from "../../../infrastructure/transaction";
import { create } from "../../../domain/services/factory.service";

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
    console.log("RAW INPUT:", input);
    const parsed = inputSchema.parse(input);
    const log = logger.child({ task: "Create employee account" });
    log.info("Task started");
    const salt = this.passwordService.generateSalt();
    console.log("payload", parsed);

    const hashedPassword = await this.passwordService.hashPassword("123", salt);

    await this.transactionManager.transaction(async (tx) => {
      const employee = create(Employee, {
        name: parsed.name,
        position: parsed.position || "STAFF",
      });
      const savedEmployee = await this.employeeRepo.add(employee, tx);
      console.log(savedEmployee);

      const account = create(EmployeeAccount, {
        employeeId: savedEmployee.id,
        username: parsed.username,
        passwordHash: hashedPassword,
        salt: salt,
      });
      await this.employeeAccountRepo.add(account, tx);
    });

    log.info("Task completed");
    return { message: "Created successfully" };
  }
}
