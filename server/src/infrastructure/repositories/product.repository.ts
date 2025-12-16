import { Prisma } from "@prisma/client";
import { Product } from "../../domain/entities/product";

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
