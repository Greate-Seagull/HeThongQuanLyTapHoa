import { Prisma } from "@prisma/client";
import { Product } from "../../domain/entities/product";
import { Transaction } from "../transactions/base.transaction";
import { BaseRepository } from "./base.repository";
import { ProductBarcode } from "../../domain/entities/product";

export interface ProductRepository extends BaseRepository<Product> {
	getByBarcode(
		barcode: ProductBarcode,
		transaction?: Transaction
	): Promise<Product | null>;
	getByBarcodes(
		barcodes: ProductBarcode[],
		transaction?: Transaction
	): Promise<Product[] | null>;
	getByIds(
		ids: number[],
		transaction?: Prisma.TransactionClient
	): Promise<Product[]>;
	saveMany(
		entities: Product[],
		transaction?: Prisma.TransactionClient
	): Promise<Product[]>;
	add(
		entity: Product,
		transaction?: Prisma.TransactionClient
	): Promise<Product>;
}
