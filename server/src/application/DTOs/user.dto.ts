import z from "zod";
import { Dto, EntitySchema } from "./base.dto";
import { User } from "../../domain/entities/user";

const schema = z.object({
	id: z.number().nullable().optional(),
	name: z.string(),
	point: z.number(),
});

export type UserDto = z.infer<typeof schema> & Dto<User>;

export const userDtoSchema: EntitySchema<User, UserDto> = {
	constructor: User,
	schema: schema,
};
