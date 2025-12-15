import z from "zod";
import { EntitySchema } from "./base.dto";
import { Employee } from "../../domain/entities/employee";

const schema = z.object({
	id: z.number().nullable().optional(),
	name: z.string(),
	position: z.string(),
});

export type EmployeeDto = z.infer<typeof schema>;

export const employeeDtoSchema: EntitySchema<Employee, EmployeeDto> = {
	constructor: Employee,
	schema: schema,
};
