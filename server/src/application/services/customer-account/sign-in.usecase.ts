import z from "zod";
import {
	PasswordService,
	TokenService,
} from "../../../domain/services/encrypt.service";
import { AccountPrismaRepository } from "../../../infrastructure/repositories/prisma/account.prisma.repository";
import { logger, maskPhone } from "../../../domain/services/logger.service";
import { UserRepository } from "../../repositories/user.repository";

const inputSchema = z.object({
	phoneNumber: z.string(),
	password: z.string(),
});

const outputSchema = z.object({
	token: z.string(),
	user: z.object({ id: z.number(), name: z.string(), point: z.number() }),
});

type SignInOutput = z.infer<typeof outputSchema>;

export class SignInUsecase {
	constructor(
		private readonly userRepo: UserRepository,
		private readonly accountRepo: AccountPrismaRepository,
		private readonly passwordService: PasswordService,
		private readonly tokenService: TokenService
	) {}

	async execute(input: any): Promise<SignInOutput> {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Signing in",
			phone: maskPhone(parsedInput.phoneNumber),
		});
		log.info("Task started");

		const account = await this.accountRepo.getByPhoneNumber(
			parsedInput.phoneNumber
		);
		if (!account) {
			log.warn("Task failed: account not found");
			throw Error(`Invalid phone number or password`);
		}

		const user = await this.userRepo.getById(account.userId);

		const isPasswordValid = this.passwordService.comparePassword(
			parsedInput.password,
			account.passwordHash
		);
		if (!isPasswordValid) {
			log.warn("Login failed: invalid password");
			throw Error(`Invalid phone number or password`);
		}

		log.debug("Task validated", {
			accountId: account.id,
		});

		account.signIn();
		const savedAccount = await this.accountRepo.save(account);
		log.debug("Task saved", {
			accountId: savedAccount.id,
		});

		const token = this.tokenService.generateJwt({
			id: account.id,
			position: null,
		});

		log.info("Task completed");
		return outputSchema.parse({ token, user });
	}
}
