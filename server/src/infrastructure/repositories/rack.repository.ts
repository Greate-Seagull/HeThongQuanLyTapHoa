import { PrismaClient } from "@prisma/client";
import { Rack, RackId } from "../../domain/entities/rack";
import { ChangeTracker } from "../cache/change-tracker";
import {
	fromPersistence,
	toPersistenceObject,
} from "../../domain/services/mapper.service";
import { buildSafePrismaSelect } from "../../domain/services/query-builder.service";

export class RackRepository {
	private tracker = new ChangeTracker<any>();

	constructor(private readonly prisma: PrismaClient) {}

	async add(rack: Rack): Promise<Rack> {
		const data = toPersistenceObject(rack);
		const raw = await this.prisma.rack.create({
			data: this.tracker.diff(rack.id, data),
			...RackRepository.baseQuery,
		});
		const entity = fromPersistence(Rack, raw);
		this.tracker.track(entity.id, raw);
		return entity;
	}

	async update(rack: Rack): Promise<Rack> {
		const data = toPersistenceObject(rack);
		const raw = await this.prisma.rack.update({
			where: { id: rack.id },
			data: this.tracker.diff(rack.id, data),
			...RackRepository.baseQuery,
		});
		const entity = fromPersistence(Rack, raw);
		this.tracker.track(entity.id, raw);
		return entity;
	}

	async delete(id: number): Promise<void> {
		await this.prisma.rack.delete({ where: { id } });
	}

	async getByIds(ids: RackId[]): Promise<Rack[]> {
		const raws = await this.prisma.rack.findMany({
			where: { id: { in: ids } },
			...RackRepository.baseQuery,
		});
		const entities: Rack[] = [];
		for (const raw of raws) {
			const entity = fromPersistence(Rack, raw);
			this.tracker.track(entity.id, raw);
			entities.push(entity);
		}
		return entities;
	}
	static baseQuery = buildSafePrismaSelect(Rack);
}