import z from "zod";
import { EntitySchema } from "./base.dto";
import { GoodReceipt } from "../../domain/entities/good-receipt";

const schema = z.object({
	id: z.number().nullable().optional(),
	employeeId: z.number(),
	createdAt: z.date(),
	goodReceiptDetails: z.array(
		z.object({
			goodReceiptId: z.number().nullable().optional(),
			productId: z.number(),
			quantity: z.number(),
			price: z.number(),
			product: z.any().optional(), // ✅ Allow product relation
		})
	),
});

export type GoodReceiptDto = z.infer<typeof schema>;

export const goodReceiptDtoSchema: EntitySchema<GoodReceipt, GoodReceiptDto> = {
	constructor: GoodReceipt,
	schema,
};
