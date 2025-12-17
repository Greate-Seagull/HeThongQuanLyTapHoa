import { AccountRepository } from "../../repositories/account.repository";
import { UserRepository } from "../../repositories/user.repository";
import { PrismaTransactionManager } from "../../../infrastructure/transaction";
import { logger } from "../../../domain/services/logger.service";
import z from "zod";

const inputSchema = z.object({
	id: z.string().transform(Number),
});

export class DeleteCustomerAccountUsecase {
	constructor(
		private readonly accountRepo: AccountRepository,
		private readonly userRepo: UserRepository,
		private readonly transactionManager: PrismaTransactionManager
	) {}

	async execute(input: any) {
		const parsed = inputSchema.parse(input);
		const log = logger.child({ task: "Delete customer account", id: parsed.id });
		log.info("Task started");

		await this.transactionManager.transaction(async (tx) => {
			await tx.account.delete({
				where: { id: parsed.id },
			});
			await tx.user.delete({
				where: { id: parsed.id },
			});
		});

		log.info("Task completed");
		return { message: "Deleted successfully" };
	}
}