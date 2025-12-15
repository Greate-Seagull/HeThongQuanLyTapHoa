import { AccountRepository } from "../../infrastructure/repositories/account.repository";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { PasswordService } from "../../domain/services/encrypt.service";
import { PrismaTransactionManager } from "../../infrastructure/transaction";
import { logger } from "../../domain/services/logger.service";
import z from "zod";
import { User } from "../../domain/user";
import { Account } from "../../domain/account";
import { create } from "../../domain/services/factory.service";

const inputSchema = z.object({
	phoneNumber: z.string(),
	name: z.string(),
});

export class CreateCustomerAccountUsecase {
	constructor(
		private readonly accountRepo: AccountRepository,
		private readonly userRepo: UserRepository,
		private readonly passwordService: PasswordService,
		private readonly transactionManager: PrismaTransactionManager
	) {}

	async execute(input: any) {
		const parsed = inputSchema.parse(input);
		const log = logger.child({ task: "Create customer account" });
		log.info("Task started");

		const hashedPassword = await this.passwordService.hashPassword("123", "10");

		await this.transactionManager.transaction(async (tx) => {
			const user = create(User, { name: parsed.name, point: 0 });
			const savedUser = await this.userRepo.add(tx, user);

			const account = create(Account, {
				id: savedUser.id,
				phoneNumber: parsed.phoneNumber,
				password: hashedPassword,
			});
			await this.accountRepo.add(tx, account);
		});

		log.info("Task completed");
		return { message: "Created successfully" };
	}
}