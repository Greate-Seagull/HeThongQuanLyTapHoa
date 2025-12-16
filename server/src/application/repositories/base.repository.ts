import { BaseEntity, Id } from "../../domain/abstracts/entity";
import { Transaction } from "../transactions/base.transaction";

export interface BaseRepository<EntityType extends BaseEntity<Id>> {
	getById(id: Id, transaction?: Transaction): Promise<EntityType | null>;
	getByIds(
		ids: Id[],
		transaction?: Transaction
	): Promise<EntityType[] | null>;
	add(entity: EntityType, transaction?: Transaction): Promise<EntityType>;
	addMany(
		entity: EntityType[],
		transaction?: Transaction
	): Promise<EntityType[]>;
	save(entity: EntityType, transaction?: Transaction): Promise<EntityType>;
	saveMany(
		entities: EntityType[],
		transaction?: Transaction
	): Promise<EntityType[]>;
}

