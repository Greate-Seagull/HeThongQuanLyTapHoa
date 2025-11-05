import { Prisma } from "@prisma/client";
import { Product } from "src/domain/product.js";

export interface ProductRepository {
	getById(
		transaction: Prisma.TransactionClient | null,
		id: any
	): Promise<Product>;
}
