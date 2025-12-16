import z from "zod";
import { EntitySchema } from "./base.dto";
import { Stocktaking } from "../../domain/entities/stocktaking";

const stocktakingDetailSchema = z.object({
	id: z.number().optional(),
	productId: z.number(),
	slotId: z.number(),
	status: z.string(),
	quantity: z.number(),
});

const schema = z.object({
	id: z.number().nullable().optional(),
	employeeId: z.number(),
	createdAt: z.date(),
	stocktakingDetails: z.array(stocktakingDetailSchema),
});

export type StocktakingDto = z.infer<typeof schema>;

export const stocktakingDtoSchema: EntitySchema<Stocktaking, StocktakingDto> = {
	constructor: Stocktaking,
	schema,
};
