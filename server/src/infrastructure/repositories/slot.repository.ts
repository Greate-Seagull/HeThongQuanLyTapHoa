import { PrismaClient } from "@prisma/client";
import { Slot, SlotId } from "../../domain/slot";
import { ChangeTracker } from "../cache/change-tracker";
import {
	fromPersistence,
	toPersistenceObject,
} from "../../domain/services/mapper.service";
import { buildSafePrismaSelect } from "../../domain/services/query-builder.service";

export class SlotRepository {
	private tracker = new ChangeTracker<any>();

	constructor(private readonly prisma: PrismaClient) {}

	async add(slot: Slot): Promise<Slot> {
		const data = toPersistenceObject(slot);
		const raw = await this.prisma.slot.create({
			data: this.tracker.diff(slot.id, data),
			...SlotRepository.baseQuery,
		});
		const entity = fromPersistence(Slot, raw);
		this.tracker.track(entity.id, raw);
		return entity;
	}

	async update(slot: Slot): Promise<Slot> {
		const data = toPersistenceObject(slot);
		const raw = await this.prisma.slot.update({
			where: { id: slot.id },
			data: this.tracker.diff(slot.id, data),
			...SlotRepository.baseQuery,
		});
		const entity = fromPersistence(Slot, raw);
		this.tracker.track(entity.id, raw);
		return entity;
	}

	async delete(id: number): Promise<void> {
		await this.prisma.slot.delete({ where: { id } });
	}

	async getByIds(ids: SlotId[]): Promise<Slot[]> {
		const raws = await this.prisma.slot.findMany({
			where: { id: { in: ids } },
			...SlotRepository.baseQuery,
		});
		const entities: Slot[] = [];
		for (const raw of raws) {
			const entity = fromPersistence(Slot, raw);
			this.tracker.track(entity.id, raw);
			entities.push(entity);
		}
		return entities;
	}
	static baseQuery = buildSafePrismaSelect(Slot);
}