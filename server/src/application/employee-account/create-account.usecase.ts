import { EmployeeAccountReadAccessor } from "../../infrastructure/read-accessors/employee-account.read-accessor";
import { PasswordService } from "../../domain/services/encrypt.service";
import { EmployeeRepository } from "../../infrastructure/repositories/employee.repository";
import { EmployeeAccountRepository } from "../../infrastructure/repositories/employee-account.repository";
import { TransactionManager } from "../../infrastructure/transaction";
import { Employee } from "../../domain/employee";
import { EmployeeAccount } from "../../domain/employee-account";
import { z } from "zod";
import { logger } from "../../domain/services/logger.service";
import { create } from "../../domain/services/factory.service";

const inputSchema = z.object({
	authId: z.number(),
	name: z.string(),
	username: z.string(),
	password: z.string(),
	position: z.string(),
});

const outputSchema = z.object();

type CreateAccountOutput = z.infer<typeof outputSchema>;

export class CreateAccountUsecase {
	constructor(
		private readonly employeeAccountRead: EmployeeAccountReadAccessor,
		private readonly passwordService: PasswordService,
		private readonly employeeAccountRepo: EmployeeAccountRepository,
		private readonly employeeRepo: EmployeeRepository,
		private readonly transactionMag: TransactionManager
	) {}

	async execute(input: any): Promise<CreateAccountOutput> {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Creating employee account",
			authId: parsedInput.authId,
			username: parsedInput.username,
		});
		log.info("Task started");

		const exist = await this.employeeAccountRead.existByUsername(
			parsedInput.username
		);
		if (exist) {
			log.warn("Task failed: registered username");
			throw Error(`The username has already existed`);
		}
		log.debug("Task validated");

		const salt = this.passwordService.generateSalt();
		const passwordHash = this.passwordService.hashPassword(
			parsedInput.password,
			salt
		);

		const save = await this.transactionMag.transaction(async (tx) => {
			const user = create(Employee, parsedInput);
			const savedEmployee = await this.employeeRepo.add(tx, user);
			const account = create(EmployeeAccount, {
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
		log.debug("Task saved", {
			userId: save.savedUser.id,
			employeeAccountId: save.savedAccount.id,
		});

		log.info("Task completed");
		return outputSchema.parse({});
	}
}
