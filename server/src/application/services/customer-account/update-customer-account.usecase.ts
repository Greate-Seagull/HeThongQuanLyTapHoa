import { PrismaTransactionManager } from "../../../infrastructure/transaction";
import { AccountRepository } from "../../repositories/account.repository";
import { UserRepository } from "../../repositories/user.repository";
import { logger } from "../../../domain/services/logger.service";
import z from "zod";

const inputSchema = z.object({
  id: z.string().transform(Number),
  phoneNumber: z.string(),
  name: z.string(),
});

export class UpdateCustomerAccountUsecase {
  constructor(
    private readonly accountRepo: AccountRepository,
    private readonly userRepo: UserRepository,
    private readonly transactionManager: PrismaTransactionManager
  ) {}

  async execute(input: any) {
    const parsed = inputSchema.parse(input);
    const log = logger.child({
      task: "Update customer account",
      id: parsed.id,
    });
    log.info("Task started");

    await this.transactionManager.transaction(async (tx) => {
      await tx.user.update({
        where: { id: parsed.id },
        data: { name: parsed.name },
      });

      await tx.account.update({
        where: { id: parsed.id },
        data: { phoneNumber: parsed.phoneNumber },
      });
    });

    log.info("Task completed");
    return { message: "Updated successfully" };
  }
}
