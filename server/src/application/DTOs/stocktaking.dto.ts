import z from "zod";
import { EntitySchema } from "./base.dto";
import { Stocktaking } from "../../domain/entities/stocktaking";

const schema = z.object({
	id: z.number().nullable().optional(),
	employeeId: z.number(),
	createdAt: z.date(),
	stocktakingDetails: z.array(
		z.object({
			id: z.number().nullable().optional(),
			status: z.string(),
			quantity: z.number(),
			productId: z.number(),
			slotId: z.number(),
		})
	),
});

export type StocktakingDto = z.infer<typeof schema>;

export const stocktakingDtoSchema: EntitySchema<Stocktaking, StocktakingDto> = {
	constructor: Stocktaking,
	schema,
};
