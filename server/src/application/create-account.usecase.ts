import e from "express";
import { EmployeeAccountReadAccessor } from "../infrastructure/read-accessors/employee-account.read-accessor";
import { PasswordService } from "../utils/encrypt";
import { EmployeeRepository } from "../infrastructure/repositories/employee.repository";
import { EmployeeAccountRepository } from "../infrastructure/repositories/employee-account.repository";
import { TransactionManager } from "../infrastructure/repositories/transaction";
import { Employee } from "../domain/employee";
import { EmployeeAccount } from "../domain/employee-account";

export interface CreateAccountUsecaseInput {
	name: string;
	username: string;
	password: string;
	position: string;
}

export interface CreateAccountUsecaseOutput {}

export class CreateAccountUsecase {
	constructor(
		private readonly employeeAccountRead: EmployeeAccountReadAccessor,
		private readonly passwordService: PasswordService,
		private readonly employeeAccountRepo: EmployeeAccountRepository,
		private readonly employeeRepo: EmployeeRepository,
		private readonly transactionMag: TransactionManager
	) {}

	async execute(
		input: CreateAccountUsecaseInput
	): Promise<CreateAccountUsecaseOutput> {
		const exist = await this.employeeAccountRead.existByUsername(
			input.username
		);
		if (exist) throw Error(`The username has already existed`);

		const salt = this.passwordService.generateSalt();
		const passwordHash = this.passwordService.hashPassword(
			input.password,
			salt
		);

		const save = await this.transactionMag.transaction(async (tx) => {
			const user = Employee.create(input.name, input.position);
			const savedEmployee = await this.employeeRepo.add(tx, user);
			const account = EmployeeAccount.create({
				employeeId: savedEmployee.id,
				username: input.username,
				passwordHash,
				salt,
			});
			const savedAccount = await this.employeeAccountRepo.add(
				tx,
				account
			);
			return { savedUser: savedEmployee, savedAccount };
		});

		console.log(save);

		return { message: "Success" };
	}
}
