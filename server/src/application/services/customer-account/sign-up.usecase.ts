import z from "zod";
import { Account } from "../../../domain/entities/account";
import {
	PasswordService,
	TokenService,
} from "../../../domain/services/encrypt.service";
import { User } from "../../../domain/entities/user";
import { logger, maskPhone } from "../../../domain/services/logger.service";
import { UserRepository } from "../../repositories/user.repository";
import { TransactionManager } from "../../transactions/base.transaction";
import { AccountRepository } from "../../repositories/account.repository";
import { AccountReadAccessor } from "../../../infrastructure/read-accessors/prisma/account.read-accessor";

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

		const exist = await this.accountRead.existsByPhoneNumber(
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
			const user = User.create(parsedInput.name);
			const savedUser = await this.userRepo.add(user, tx);
			const account = Account.create(
				parsedInput.phoneNumber,
				passwordHash,
				salt,
				savedUser.id
			);
			const savedAccount = await this.accountRepo.add(account, tx);
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
