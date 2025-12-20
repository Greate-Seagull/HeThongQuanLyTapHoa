import z from "zod";
import { EntitySchema } from "./base.dto";
import { Product } from "../../domain/entities/product";

const schema = z.object({
	id: z.number().nullable().optional(), // ✅ Changed from _id to id
	name: z.string(),
	unit: z.string(),
	price: z.number(),
	barcode: z.number(),
	amount: z.number(),
	categoryId: z.number().nullable().optional(),
	supplierId: z.number().nullable().optional(),
});

export type ProductDto = z.infer<typeof schema>;

export const productDtoSchema: EntitySchema<Product, ProductDto> = {
	constructor: Product,
	schema,
};
