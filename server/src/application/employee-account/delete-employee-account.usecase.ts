import { EmployeeAccountRepository } from "../../infrastructure/repositories/employee-account.repository";
import { EmployeeRepository } from "../../infrastructure/repositories/employee.repository";
import { PrismaTransactionManager } from "../../infrastructure/transaction";
import { logger } from "../../domain/services/logger.service";
import z from "zod";

const inputSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(Number),
});

export class DeleteEmployeeAccountUsecase {
  constructor(
    private readonly employeeAccountRepo: EmployeeAccountRepository,
    private readonly employeeRepo: EmployeeRepository,
    private readonly transactionManager: PrismaTransactionManager
  ) {}

  async execute(input: any) {
    const parsed = inputSchema.parse(input);
    const log = logger.child({
      task: "Delete employee account",
      id: parsed.id,
    });
    log.info("Task started");

    await this.transactionManager.transaction(async (tx) => {
      await tx.employeeAccount.deleteMany({
        where: { employeeId: parsed.id },
      });
      await tx.employee.delete({
        where: { id: parsed.id },
      });
    });

    log.info("Task completed");
    return { message: "Deleted successfully" };
  }
}
