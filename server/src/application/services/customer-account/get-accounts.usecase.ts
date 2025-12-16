import { AccountReadAccessor } from "../../../infrastructure/read-accessors/prisma/account.read-accessor";
import { logger } from "../../../domain/services/logger.service";

export class GetAccountsUsecase {
  constructor(private readonly accountRead: AccountReadAccessor) {}

  async execute(): Promise<any[]> {
    const log = logger.child({ task: "Get all customer accounts" });
    log.info("Task started");

    const accounts = await this.accountRead.getAll();

    log.info("Task completed");
    return accounts.map((acc) => ({
      id: acc.id,
      phoneNumber: acc.phoneNumber,
      user: acc.user
        ? {
            id: acc.user.id,
            name: acc.user.name,
            point: acc.user.point,
          }
        : null,
    }));
  }
}
