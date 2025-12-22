import { prisma } from './../../../composition-root';
import { logger } from "../../../domain/services/logger.service";
import { AccountReadAccessor } from "../../../infrastructure/read-accessors/prisma/account.read-accessor";
import z from "zod";

const inputSchema = z.object({
  authId: z.number(),  // This is userId from middleware
});

const outputSchema = z.object({
  id: z.number(),
  userId: z.number(),
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
      userId: parsedInput.authId,
    });
    log.info("Task started");

    // ✅ Get account by userId (from middleware)
    const account = await this.accountRead.getByUserId(parsedInput.authId);
    
    if (!account) {
      log.warn("Account not found");
      throw Error("Account not found");
    }
    
    console.log('✅ Found customer account:', {
      accountId: account.id,
      userId: account.user.id,
      name: account.user.name,
      point: account.user.point,
      phoneNumber: account.phoneNumber,
    });

    log.info("Task completed", {
      accountId: account.id,
      point: account.user.point,
    });
    
    return outputSchema.parse({
      id: account.id,
      userId: account.user.id,
      phoneNumber: account.phoneNumber,
      user: {
        id: account.user.id,
        name: account.user.name,
        point: account.user.point,
      },
    });
  }
}
