import { AccountRepository } from "../infrastructure/repositories/account.repository";
import { PasswordService, TokenService } from "../utils/encrypt";

export interface SignInUsecaseInput {
	phoneNumber: string;
	password: string;
}

export interface SignInUsecaseOutput {}

export class SignInUsecase {
	constructor(
		private readonly accountRepo: AccountRepository,
		private readonly passwordService: PasswordService,
		private readonly tokenService: TokenService
	) {}

	async execute(input: SignInUsecaseInput): Promise<SignInUsecaseOutput> {
		const account = await this.accountRepo.getByPhoneNumber(
			input.phoneNumber
		);
		if (!account) throw Error(`Invalid phone number or password`);

		const passwordHash = this.passwordService.hashPassword(
			input.password,
			account.salt
		);
		const isValid = account.validate(passwordHash);
		if (!isValid) throw Error(`Invalid phone number or password`);

		account.signIn();
		const savedAccount = await this.accountRepo.save(null, account);

		const token = this.tokenService.generateJWT(account.id);

		return { token: token };
	}
}
