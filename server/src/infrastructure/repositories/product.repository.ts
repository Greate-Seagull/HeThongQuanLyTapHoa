import { Prisma } from "@prisma/client";
import { Product } from "src/domain/product.js";

export interface ProductRepository {
	add(tx: any, insertProducts: Product[]): Promise<Product[]>;
	save(
		transaction: Prisma.TransactionClient,
		products: Product[]
	): Promise<Product[]>;
	getByIds(ids: any): Product[] | PromiseLike<Product[]>;
	getById(
		transaction: Prisma.TransactionClient | null,
		id: any
	): Promise<Product>;
}
