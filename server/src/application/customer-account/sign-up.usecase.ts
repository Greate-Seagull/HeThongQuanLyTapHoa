import z from "zod";
import { Account } from "../../domain/account";
import {
	PasswordService,
	TokenService,
} from "../../domain/services/encrypt.service";
import { User } from "../../domain/user";
import { AccountReadAccessor } from "../../infrastructure/read-accessors/account.read-accessor";
import { AccountRepository } from "../../infrastructure/repositories/account.repository";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { TransactionManager } from "../../infrastructure/transaction";
import { logger, maskPhone } from "../../domain/services/logger.service";
import { create } from "../../domain/services/factory.service";

const inputSchema = z.object({
	name: z.string(),
	phoneNumber: z.string(),
	password: z.string(),
});

const outputSchema = z.object({
	token: z.string(),
});

type SignUpOutput = z.infer<typeof outputSchema>;

export class SignUpUsecase {
	constructor(
		private readonly accountRead: AccountReadAccessor,
		private readonly userRepo: UserRepository,
		private readonly accountRepo: AccountRepository,
		private readonly transactionMag: TransactionManager,
		private readonly passwordService: PasswordService,
		private readonly tokenService: TokenService
	) {}

	async execute(input: any): Promise<SignUpOutput> {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Signing up",
			phoneNumber: maskPhone(parsedInput.phoneNumber),
		});
		log.info("Task started");

		const exist = await this.accountRead.existPhoneNumber(
			parsedInput.phoneNumber
		);
		if (exist) {
			log.warn("Task failed: registered phone number");
			throw Error(`The phone number has already existed`);
		}
		log.debug("Task validated");

		const salt = this.passwordService.generateSalt();
		const passwordHash = this.passwordService.hashPassword(
			parsedInput.password,
			salt
		);

		const save = await this.transactionMag.transaction(async (tx) => {
			const user = create(User, parsedInput);
			const savedUser = await this.userRepo.add(tx, user);
			const account = create(Account, {
				userId: savedUser.id,
				phoneNumber: parsedInput.phoneNumber,
				passwordHash,
				salt,
			});
			const savedAccount = await this.accountRepo.add(tx, account);
			return { savedUser, savedAccount };
		});
		log.debug("Task saved", {
			userId: save.savedUser.id,
			accountId: save.savedAccount.id,
		});

		const token = this.tokenService.generateJwt({
			id: save.savedAccount.id,
			position: null,
		});

		log.info("Task completed");
		return outputSchema.parse({ token });
	}
}
