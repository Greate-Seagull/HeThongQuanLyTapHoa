import z from "zod";
import { BaseEntity, Id } from "../../domain/abstracts/entity";
import { Constructor } from "../../types/entity.type";

export interface Dto<EntityType extends BaseEntity<Id>> {}

export interface EntitySchema<
	EntityType extends BaseEntity<Id>,
	DtoType extends Dto<EntityType>
> {
	constructor: Constructor<EntityType>;
	schema: z.ZodSchema<DtoType>;
}
