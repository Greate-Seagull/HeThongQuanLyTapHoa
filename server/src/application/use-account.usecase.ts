import {
	PasswordService,
	TokenService,
} from "../domain/services/encrypt.service";
import { EmployeeReadAccess } from "../infrastructure/read-accessors/employee.read-accessor";
import { EmployeeAccountRepository } from "../infrastructure/repositories/employee-account.repository";

export interface UseAccountUsecaseInput {
	username: string;
	password: string;
}

export interface UseAccountUsecaseOutput {}

export class UseAccountUsecase {
	constructor(
		private readonly employeeAccountRepo: EmployeeAccountRepository,
		private readonly employeeRead: EmployeeReadAccess,
		private readonly passwordService: PasswordService,
		private readonly tokenService: TokenService
	) {}

	async execute(
		input: UseAccountUsecaseInput
	): Promise<UseAccountUsecaseOutput> {
		const account = await this.employeeAccountRepo.getByUsername(
			input.username
		);
		if (!account) throw Error(`Invalid username or password`);

		const passwordHash = this.passwordService.hashPassword(
			input.password,
			account.salt
		);
		const isValid = account.validate(passwordHash);
		if (!isValid) throw Error(`Invalid username or password`);

		const employee = await this.employeeRead.getPositionById(
			account.employeeId
		);

		account.signIn();
		const savedAccount = await this.employeeAccountRepo.save(null, account);

		const token = this.tokenService.generateJwt({
			id: employee.id,
			position: employee.position,
		});

		return { token: token };
	}
}
