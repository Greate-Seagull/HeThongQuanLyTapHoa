import { Prisma, PrismaClient } from "@prisma/client";
import { User } from "../../domain/user";
import { ChangeTracker } from "../cache/change-tracker";
import {
	fromPersistence,
	toPersistenceObject,
} from "../../domain/services/mapper.service";
import { buildSafePrismaSelect } from "../../domain/services/query-builder.service";

export class UserRepository implements UserRepository {
	private tracker = new ChangeTracker<any>();

	constructor(private readonly prisma: PrismaClient) {}

	async getById(id: any) {
		const raw = await this.prisma.user.findUnique({
			where: {
				id,
			},
			...UserRepository.baseQuery,
		});

		if (!raw) return raw;

		let entity = fromPersistence(User, raw);
		this.tracker.track(entity.id, raw);
		return entity;
	}

	async save(transaction: Prisma.TransactionClient, user: User) {
		const repo = transaction ? transaction : this.prisma;
		const raw = await repo.user.update({
			where: { id: user.id },
			data: this.tracker.diff(user.id, toPersistenceObject(user)),
			...UserRepository.baseQuery,
		});

		let entity = fromPersistence(User, raw);
		this.tracker.track(entity.id, raw);
		return entity;
	}

	async add(transaction: Prisma.TransactionClient, user: User) {
		const repo = transaction ? transaction : this.prisma;
		const raw = await repo.user.create({
			data: this.tracker.diff(user.id, toPersistenceObject(user)),
			...UserRepository.baseQuery,
		});

		let entity = fromPersistence(User, raw);
		this.tracker.track(entity.id, raw);
		return entity;
	}

	static baseQuery = buildSafePrismaSelect(User);
}
