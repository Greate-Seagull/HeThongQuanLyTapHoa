import { Account } from "../domain/account";
import { User } from "../domain/user";
import { AccountReadAccessor } from "../infrastructure/read-accessors/account.read-accessor";
import { AccountRepository } from "../infrastructure/repositories/account.repository";
import { TransactionManager } from "../infrastructure/repositories/transaction";
import { UserRepository } from "../infrastructure/repositories/user.repository";
import { PasswordService, TokenService } from "../utils/encrypt";

export interface SignUpUsecaseInput {
	name: string;
	phoneNumber: string;
	password: string;
}

export interface SignUpUsecaseOutput {}

export class SignUpUsecase {
	constructor(
		private readonly accountRead: AccountReadAccessor,
		private readonly userRepo: UserRepository,
		private readonly accountRepo: AccountRepository,
		private readonly transactionMag: TransactionManager,
		private readonly passwordService: PasswordService,
		private readonly tokenService: TokenService
	) {}

	async execute(input: SignUpUsecaseInput): Promise<SignUpUsecaseOutput> {
		const exist = await this.accountRead.existPhoneNumber(
			input.phoneNumber
		);
		if (exist) throw Error(`The phone number has already existed`);

		const salt = this.passwordService.generateSalt();
		const passwordHash = this.passwordService.hashPassword(
			input.password,
			salt
		);

		const save = await this.transactionMag.transaction(async (tx) => {
			const user = User.create(input.name);
			const savedUser = await this.userRepo.add(tx, user);
			const account = Account.create({
				userId: savedUser.id,
				phoneNumber: input.phoneNumber,
				passwordHash,
				salt,
			});
			const savedAccount = await this.accountRepo.add(tx, account);
			return { savedUser, savedAccount };
		});

		const token = this.tokenService.generateJWT(save.savedAccount.id);

		return { token };
	}
}
