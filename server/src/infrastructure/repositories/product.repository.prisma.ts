import { Prisma, PrismaClient } from "@prisma/client";
import { ProductRepository } from "./product.repository";
import { Product, ProductBarcode, ProductId } from "../../domain/product";
import { buildSafePrismaSelect } from "../../domain/services/query-builder.service";
import { ChangeTracker } from "../cache/change-tracker";
import {
	fromPersistence,
	toPersistence,
	toPersistenceObject,
} from "../../domain/services/mapper.service";

export class ProductRepositoryPrisma implements ProductRepository {
	private tracker = new ChangeTracker<any>();

	constructor(private readonly prisma: PrismaClient) {}

	async getById(id: ProductId) {
		const raw = await this.prisma.product.findUnique({
			where: { id },
			...ProductRepositoryPrisma.baseQuery,
		});

		if (!raw) return null;

		const entity = fromPersistence(Product, raw);
		this.tracker.track(entity.id, raw);
		return entity;
	}

	async getByIds(ids: ProductId[]): Promise<Product[]> {
		const raws = await this.prisma.product.findMany({
			where: {
				id: {
					in: ids,
				},
			},
			...ProductRepositoryPrisma.baseQuery,
		});

		const entities: Product[] = [];
		for (const raw of raws) {
			const entity = fromPersistence(Product, raw);
			this.tracker.track(entity.id, raw);
			entities.push(entity);
		}
		return entities;
	}

	async getByBarcode(barcode: ProductBarcode) {
		const raw = await this.prisma.product.findUnique({
			where: { barcode },
			...ProductRepositoryPrisma.baseQuery,
		});

		if (!raw) return null;

		const entity = fromPersistence(Product, raw);
		this.tracker.track(entity.id, raw);
		return entity;
	}

	async getByBarcodes(
		tx: Prisma.TransactionClient,
		barcodes: ProductBarcode[]
	): Promise<Product[]> {
		const repo = tx ? tx : this.prisma;
		const raws = await repo.product.findMany({
			where: {
				barcode: {
					in: barcodes,
				},
			},
			...ProductRepositoryPrisma.baseQuery,
		});

		const entities: Product[] = [];
		for (const raw of raws) {
			const entity = fromPersistence(Product, raw);
			this.tracker.track(entity.id, raw);
			entities.push(entity);
		}
		return entities;
	}

	async save(
		transaction: Prisma.TransactionClient,
		products: Product[]
	): Promise<Product[]> {
		const promisedRaws = products.map((p) => {
			return transaction.product.update({
				where: {
					id: p.id,
				},
				data: this.tracker.diff(p.id, toPersistence(p)),
				...ProductRepositoryPrisma.baseQuery,
			});
		});

		const raws = await Promise.all(promisedRaws);
		const entities: Product[] = [];
		for (const raw of raws) {
			const entity = fromPersistence(Product, raw);
			this.tracker.track(entity.id, raw);
			entities.push(entity);
		}
		return entities;
	}

	async add(
		transaction: Prisma.TransactionClient,
		products: Product[]
	): Promise<Product[]> {
		const repo = transaction ? transaction : this.prisma;
		await repo.product.createMany({
			data: products.map((p) => toPersistenceObject(p)),
			// ...ProductRepositoryPrisma.baseQuery,
			// Cannot use select on prisma.createMany
		});

		// prisma.createMany does not return any records
		return await this.getByBarcodes(
			transaction,
			products.map((p) => p.barcode)
		);
	}

	static baseQuery = buildSafePrismaSelect(Product);
}
