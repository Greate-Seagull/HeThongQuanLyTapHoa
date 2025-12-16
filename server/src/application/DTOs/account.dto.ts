import z from "zod";
import { Dto, EntitySchema } from "./base.dto";
import { Account } from "../../domain/entities/account";

const schema = z.object({
	id: z.number().nullable().optional(),
	phoneNumber: z.string(),
	passwordHash: z.string(),
	salt: z.string(),
	loggedAt: z.date(),
	userId: z.number(),
});

export type AccountDto = z.infer<typeof schema> & Dto<Account>;

export const accountDtoSchema: EntitySchema<Account, AccountDto> = {
	constructor: Account,
	schema: schema,
};
