import z from "zod";
import { EntitySchema } from "./base.dto";
import { Promotion } from "../../domain/entities/promotion";

const schema = z.object({
	id: z.number().nullable().optional(),
	name: z.string(),
	value: z.number(),
	promotionType: z.string(),
	startedAt: z.date(),
	endedAt: z.date(),
	description: z.string().nullable().optional(),
	condition: z.string().nullable().optional(),
	promotionDetails: z
		.array(
			z.object({
				promotionId: z.number().nullable().optional(),
				productId: z.number(),
			})
		)
		.optional(),
});

export type PromotionDto = z.infer<typeof schema>;

export const promotionDtoSchema: EntitySchema<Promotion, PromotionDto> = {
	constructor: Promotion,
	schema,
};
