import { prisma } from './../../../composition-root';
import { logger } from "../../../domain/services/logger.service";
import { AccountReadAccessor } from "../../../infrastructure/read-accessors/prisma/account.read-accessor";
import z from "zod";

const inputSchema = z.object({
  authId: z.number(),
});

const outputSchema = z.object({
  id: z.number(),
  phoneNumber: z.string(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    point: z.number(),
  }),
});

type AccountOutput = z.infer<typeof outputSchema>;

export class GetMyAccountUsecase {
  constructor(
    private readonly accountRead: AccountReadAccessor
  ) {}

  async execute(input: any): Promise<AccountOutput> {
    const parsedInput = inputSchema.parse(input);
    const log = logger.child({
      task: "Get my account",
      id: parsedInput.authId,
    });
    log.info("Task started");
  // authId giờ là userId, nên phải lấy account theo userId
  const account = await this.accountRead.getByUserId(parsedInput.authId);
    if (!account) throw Error("Account not found");
    log.info("Task completed");
    return outputSchema.parse(account);
  }
}
