import { Product } from "src/domain/product.js";
import type { TransactionType } from "./transaction.js";

export interface ProductRepository {
	getById(transaction: TransactionType | null, id: any): Promise<Product>;
}
