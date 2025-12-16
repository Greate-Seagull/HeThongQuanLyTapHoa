import z from "zod";
import { EntitySchema } from "./base.dto";
import { Invoice } from "../../domain/entities/invoice";

const schema = z.object({
	id: z.number().nullable().optional(),
	total: z.number(),
	employeeId: z.number(),
	userId: z.number().optional().nullable(),
	usedPoint: z.number(),
	invoiceDetails: z.array(
		z.object({
			quantity: z.number(),
			invoiceId: z.number().nullable().optional(),
			productId: z.number(),
			promotionId: z.number().optional().nullable(),
		})
	),
});

export type InvoiceDto = z.infer<typeof schema>;

export const invoiceDtoSchema: EntitySchema<Invoice, InvoiceDto> = {
	constructor: Invoice,
	schema,
};
