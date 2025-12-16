import { Transaction } from "./../../transactions/base.transaction";

import { z } from "zod";
import { PasswordService } from "../../../domain/services/encrypt.service";
import { Employee } from "../../../domain/entities/employee";
import { EmployeeAccount } from "../../../domain/entities/employee-account";
import { logger } from "../../../domain/services/logger.service";
import { TransactionManager } from "../../transactions/base.transaction";
import { EmployeeRepository } from "../../repositories/employee.repository";
import { EmployeeAccountRepository } from "../../repositories/employee-account.repository";
import { EmployeeAccountReadAccessor } from "../read-accessors/employee-account.read-accessor";
import { PrismaTransactionManager } from "../../../application/transactions/prisma.transaction";
import { create } from "../../../domain/services/factory.service";
const inputSchema = z.object({
  authId: z.number(),
  name: z.string(),
  username: z.string(),
  password: z.string(),
  position: z.string(),
});

const outputSchema = z.object();

type CreateAccountOutput = z.infer<typeof outputSchema>;

export class CreateAccountUsecase {
  constructor(
    private readonly employeeAccountRead: EmployeeAccountReadAccessor,
    private readonly passwordService: PasswordService,
    private readonly employeeAccountRepo: EmployeeAccountRepository,
    private readonly employeeRepo: EmployeeRepository,
    private readonly transactionMag: TransactionManager
  ) {}

  async execute(input: any): Promise<CreateAccountOutput> {
    const parsedInput = inputSchema.parse(input);
    const log = logger.child({
      task: "Creating employee account",
      authId: parsedInput.authId,
      username: parsedInput.username,
    });
    log.info("Task started");

    const exist = await this.employeeAccountRead.existByUsername(
      parsedInput.username
    );
    if (exist) {
      log.warn("Task failed: registered username");
      throw Error(`The username has already existed`);
    }
    log.debug("Task validated");

    const salt = this.passwordService.generateSalt();
    const passwordHash = this.passwordService.hashPassword(
      parsedInput.password,
      salt
    );

    const save = await this.transactionMag.transaction(async (tx) => {
      const user = Employee.create(parsedInput.name, parsedInput.position);
      const savedEmployee = await this.employeeRepo.add(user, tx);
      const account = EmployeeAccount.create(
        parsedInput.username,
        passwordHash,
        salt,
        savedEmployee.id
      );
      const savedAccount = await this.employeeAccountRepo.add(account, tx);
      return { savedUser: savedEmployee, savedAccount };
    });
    log.debug("Task saved", {
      userId: save.savedUser.id,
      employeeAccountId: save.savedAccount.id,
    });

    log.info("Task completed");
    return outputSchema.parse({});
  }
}
