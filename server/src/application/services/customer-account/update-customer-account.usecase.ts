import { PrismaTransactionManager } from "../../../infrastructure/transaction";
import { AccountRepository } from "../../repositories/account.repository";
import { UserRepository } from "../../repositories/user.repository";
import { logger } from "../../../domain/services/logger.service";
import z from "zod";

const inputSchema = z.object({
  id: z.union([z.string(), z.number()])
    .refine((val) => {
      const num = typeof val === 'string' ? Number(val) : val;
      return Number.isInteger(num) && num > 0;
    }, { message: 'Invalid or missing id' })
    .transform((val) => typeof val === 'string' ? Number(val) : val),
  phoneNumber: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
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

    let updatedAccountWithUser;
    await this.transactionManager.transaction(async (tx) => {
      // Lấy account theo userId
      const account = await tx.account.findFirst({
        where: { userId: parsed.id },
        select: { id: true, userId: true },
      });
      if (!account) {
        throw new Error("Account not found");
      }

      // Update account (phoneNumber)
      await tx.account.update({
        where: { id: account.id },
        data: { phoneNumber: parsed.phoneNumber },
      });

      // Update user (name and avatar)
      await tx.user.update({
        where: { id: account.userId },
        data: { 
          name: parsed.name,
          ...(parsed.avatar !== undefined && { avatar: parsed.avatar }),
        },
      });

      // Lấy lại account kèm user (giống API profile)
      updatedAccountWithUser = await tx.account.findUnique({
        where: { id: account.id },
        select: {
          id: true,
          phoneNumber: true,
          user: {
            select: {
              id: true,
              name: true,
              point: true,
              avatar: true,
            },
          },
        },
      });
    });

    log.info("Task completed");
    return updatedAccountWithUser;
  }
}
