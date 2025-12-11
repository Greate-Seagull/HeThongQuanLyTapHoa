import { Prisma, PrismaClient } from "@prisma/client";
import { EmployeeAccount } from "../../domain/employee-account";
import {
	fromPersistence,
	toPersistenceObject,
} from "../../domain/services/mapper.service";
import { ChangeTracker } from "../cache/change-tracker";
import { buildSafePrismaSelect } from "../../domain/services/query-builder.service";

export class EmployeeAccountRepository implements EmployeeAccountRepository {
	private tracker = new ChangeTracker<any>();

	constructor(private readonly prisma: PrismaClient) {}

	async add(transaction: Prisma.TransactionClient, account: EmployeeAccount) {
		const repo = transaction ? transaction : this.prisma;
		const raw = await repo.employeeAccount.create({
			data: this.tracker.diff(account.id, toPersistenceObject(account)),
			...EmployeeAccountRepository.baseQuery,
		});

		const savedEntity = fromPersistence(EmployeeAccount, raw);
		this.tracker.track(savedEntity.id, raw);
		return savedEntity;
	}

	async getByUsername(username: string) {
		const raw = await this.prisma.employeeAccount.findUnique({
			where: {
				username,
			},
			...EmployeeAccountRepository.baseQuery,
		});

		if (!raw) return null;

		const savedEntity = fromPersistence(EmployeeAccount, raw);
		this.tracker.track(savedEntity.id, raw);
		return savedEntity;
	}

	async save(
		transaction: Prisma.TransactionClient,
		account: EmployeeAccount
	) {
		const repo = transaction ? transaction : this.prisma;
		const raw = await repo.employeeAccount.update({
			where: { id: account.id },
			data: this.tracker.diff(account.id, toPersistenceObject(account)),
			...EmployeeAccountRepository.baseQuery,
		});

		const savedEntity = fromPersistence(EmployeeAccount, raw);
		this.tracker.track(savedEntity.id, raw);
		return savedEntity;
	}

	static baseQuery = buildSafePrismaSelect(EmployeeAccount);
}
