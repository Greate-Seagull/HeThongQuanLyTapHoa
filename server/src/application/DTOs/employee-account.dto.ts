import z from "zod";
import { EntitySchema } from "./base.dto";
import { EmployeeAccount } from "../../domain/entities/employee-account";

const schema = z.object({
	id: z.number().nullable().optional(),
	username: z.string(),
	passwordHash: z.string(),
	salt: z.string().nullable().optional(),
	loggedAt: z.date(),
	employeeId: z.number(),
});

export type EmployeeAccountDto = z.infer<typeof schema>;

export const employeeAccountDtoSchema: EntitySchema<
	EmployeeAccount,
	EmployeeAccountDto
> = {
	constructor: EmployeeAccount,
	schema,
};
