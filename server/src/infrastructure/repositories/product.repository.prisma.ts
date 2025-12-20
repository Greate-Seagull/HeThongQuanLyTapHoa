import { Prisma, PrismaClient } from "@prisma/client";
import { ProductRepository } from "./product.repository";
import { Product, ProductBarcode, ProductId } from "../../domain/entities/product";
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

	async create(product: Product): Promise<Product> {
		console.log('\n📦 ProductRepo.create called');
		console.log('  Input product:', {
			name: product.name,
			barcode: product.barcode,
			price: product.price,
			unit: product.unit,
		});

		// Check if barcode exists
		const existing = await this.prisma.product.findUnique({
			where: { barcode: product.barcode },
		});

		if (existing) {
			console.error('  ❌ Barcode already exists:', product.barcode);
			throw new Error(`Product with barcode ${product.barcode} already exists`);
		}

		// Create product
		const created = await this.prisma.product.create({
			data: {
				name: product.name,
				price: product.price,
				amount: product.amount || 0,
				unit: product.unit as any,
				barcode: product.barcode,
				categoryId: product.categoryId || null,
				supplierId: product.supplierId || null,
				status: 'GOOD',
			},
		});

		console.log('  ✅ Product created:', {
			id: created.id,
			name: created.name,
			barcode: created.barcode,
		});

		// Convert back to entity
		const entity = Product.create({
			...created,
			authId: 1, // Not used for created products
		});
		(entity as any)._id = created.id;

		return entity;
	}

	async update(product: Product): Promise<Product> {
		const data = toPersistenceObject(product);
		const raw = await this.prisma.product.update({
			where: { id: product.id },
			data: this.tracker.diff(product.id, data),
			...ProductRepositoryPrisma.baseQuery,
		});
		const entity = fromPersistence(Product, raw);
		this.tracker.track(entity.id, raw);
		return entity;
	}

	async delete(id: number): Promise<void> {
		await this.prisma.product.delete({ where: { id } });
	}

	static baseQuery = buildSafePrismaSelect(Product);
}
