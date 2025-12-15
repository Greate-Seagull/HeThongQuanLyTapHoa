import { Prisma } from "@prisma/client";
import { Product, ProductBarcode } from "../../../domain/entities/product";
import { buildSafePrismaSelect } from "../../../domain/services/query-builder.service";
import { ProductRepository } from "../../../application/repositories/product.repository";
import { ProductDto } from "../../../application/DTOs/product.dto";
import { PrismaRepository } from "./prisma.prisma.repository";

export class ProductPrismaRepository
	extends PrismaRepository<Product, ProductDto>
	implements ProductRepository
{
	private static baseSelect = buildSafePrismaSelect(Product);

	protected buildUpdateData(entity: Product): Partial<ProductDto> {
		return this.toPersistence(entity);
	}

	protected buildCreateData(entity: Product): Partial<ProductDto> {
		return this.toPersistence(entity);
	}

	protected getBaseQuery(): { select: object } {
		return ProductPrismaRepository.baseSelect;
	}

	protected getRepository(transaction?: Prisma.TransactionClient): any {
		if (transaction) return transaction.product;
		return this.client.product;
	}

	public async getByBarcode(
		barcode: ProductBarcode,
		transaction?: Prisma.TransactionClient
	): Promise<Product | null> {
		const raw = await this.getRepository(transaction).findUnique({
			where: { barcode },
			select: this.getBaseQuery().select,
		});

		return this.fromPersistence(raw);
	}

	public async getByBarcodes(
		barcodes: ProductBarcode[],
		transaction?: Prisma.TransactionClient
	): Promise<Product[] | null> {
		const raws = await this.getRepository(transaction).findMany({
			where: {
				barcode: {
					in: barcodes,
				},
			},
			select: this.getBaseQuery().select,
		});

		return raws.map((raw) => this.fromPersistence(raw));
	}

	public async addMany(
		entities: Product[],
		transaction?: Prisma.TransactionClient
	): Promise<Product[]> {
		await super.addMany(entities, transaction);

		// Prisma does not return created entities
		const barcodes = entities.map((entity) => entity.barcode);
		return this.getByBarcodes(barcodes, transaction);
	}
}
