import { PrismaClient } from "@prisma/client";
import { Shelf, ShelfId } from "../../domain/shelf";
import { ChangeTracker } from "../cache/change-tracker";
import {
	fromPersistence,
	toPersistenceObject,
} from "../../domain/services/mapper.service";
import { buildSafePrismaSelect } from "../../domain/services/query-builder.service";

export class ShelfRepository {
	private tracker = new ChangeTracker<any>();

	constructor(private readonly prisma: PrismaClient) {}

	async add(shelf: Shelf): Promise<Shelf> {
		const data = toPersistenceObject(shelf);
		const raw = await this.prisma.shelf.create({
			data: this.tracker.diff(shelf.id, data),
			...ShelfRepository.baseQuery,
		});
		const entity = fromPersistence(Shelf, raw);
		this.tracker.track(entity.id, raw);
		return entity;
	}

	async update(shelf: Shelf): Promise<Shelf> {
		const data = toPersistenceObject(shelf);
		const raw = await this.prisma.shelf.update({
			where: { id: shelf.id },
			data: this.tracker.diff(shelf.id, data),
			...ShelfRepository.baseQuery,
		});
		const entity = fromPersistence(Shelf, raw);
		this.tracker.track(entity.id, raw);
		return entity;
	}

	async delete(id: number): Promise<void> {
		await this.prisma.shelf.delete({ where: { id } });
	}

	async getByIds(ids: ShelfId[]): Promise<Shelf[]> {
		const raws = await this.prisma.shelf.findMany({
			where: {
				id: {
					in: ids,
				},
			},
			...ShelfRepository.baseQuery,
		});

		const entities: Shelf[] = [];
		for (const raw of raws) {
			const entity = fromPersistence(Shelf, raw);
			this.tracker.track(entity.id, raw);
			entities.push(entity);
		}
		return entities;
	}

	static baseQuery = buildSafePrismaSelect(Shelf);
}