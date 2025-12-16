import { Prisma, PrismaClient } from "@prisma/client";
import { Account } from "../../domain/account";
import { buildSafePrismaSelect } from "../../domain/services/query-builder.service";
import { ChangeTracker } from "../cache/change-tracker";
import {
	fromPersistence,
	toPersistenceObject,
} from "../../domain/services/mapper.service";

export class AccountRepository implements AccountRepository {
	private changeTracker = new ChangeTracker<any>();

	constructor(private readonly prisma: PrismaClient) {}

	async add(transaction: Prisma.TransactionClient, entity: Account) {
		const repo = transaction ? transaction : this.prisma;
		const raw = await repo.account.create({
			data: this.changeTracker.diff(
				entity.id,
				toPersistenceObject(entity)
			),
			...AccountRepository.baseQuery,
		});

		const savedEntity = fromPersistence(Account, raw);
		this.changeTracker.track(savedEntity.id, raw);
		return savedEntity;
	}

	async getByPhoneNumber(phoneNumber: string) {
		const raw = await this.prisma.account.findUnique({
			where: {
				phoneNumber,
			},
			...AccountRepository.baseQuery,
		});

		if (!raw) return null;

		const savedEntity = fromPersistence(Account, raw);
		this.changeTracker.track(savedEntity.id, raw);

		return savedEntity;
	}

	async save(transaction: Prisma.TransactionClient, entity: Account) {
		const repo = transaction ? transaction : this.prisma;
		const raw = await repo.account.update({
			where: { id: entity.id },
			data: this.changeTracker.diff(
				entity.id,
				toPersistenceObject(entity)
			),
			...AccountRepository.baseQuery,
		});

		const savedEntity = fromPersistence(Account, raw);
		this.changeTracker.track(savedEntity.id, raw);
		return savedEntity;
	}

	



	static baseQuery = buildSafePrismaSelect(Account);
}
