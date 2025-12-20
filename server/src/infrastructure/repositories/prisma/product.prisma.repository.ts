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

	// ✅ CRITICAL FIX: getByIds for GoodReceipt
	public async getByIds(
		ids: number[],
		transaction?: Prisma.TransactionClient
	): Promise<Product[]> {
		console.log('\n🔍 ========== ProductRepo.getByIds START ==========');
		
		// ✅ Ensure all IDs are numbers
		const numericIds = ids.map(id => {
			const num = Number(id);
			if (isNaN(num)) {
				throw new Error(`Invalid product ID: ${id} is not a number`);
			}
			return num;
		});
		
		console.log('  🔍 Input validation:', {
			originalIds: ids,
			numericIds,
		});
		
		// ✅ Query database with RAW SQL for debugging
		const repo = this.getRepository(transaction);
		console.log('  🔍 Querying database with WHERE id IN:', numericIds);
		
		try {
			const raws = await repo.findMany({
				where: { id: { in: numericIds } },
			});

			console.log('  🔍 Database raw results:', {
				requestedCount: numericIds.length,
				foundCount: raws.length,
				foundIds: raws.map((r: any) => r.id),
				firstRaw: raws[0], // ✅ Show full raw object
			});

			// ✅ Check for missing products
			if (raws.length !== numericIds.length) {
				const foundIds = new Set(raws.map((r: any) => r.id));
				const missingIds = numericIds.filter(id => !foundIds.has(id));
				
				console.error('  ❌ MISSING PRODUCTS IN DATABASE:');
				console.error('     Requested IDs:', numericIds);
				console.error('     Found IDs:', Array.from(foundIds));
				console.error('     Missing IDs:', missingIds);
				
				// ✅ Check if missing products exist at all
				const allProducts = await repo.findMany({
					select: { id: true, name: true },
				});
				console.error('     All products in DB:', allProducts.map((p: any) => p.id));
				
				throw new Error(
					`Products not found in database: ${missingIds.join(', ')}. ` +
					`These products may have been deleted or never existed.`
				);
			}

			// ✅ Convert to entities with DEBUG
			const entities = raws.map((raw) => {
				console.log('  🔄 Converting raw to entity:', {
					rawId: raw.id,
					rawName: raw.name,
				});
				
				try {
					const entity = this.fromPersistence(raw);
					
					console.log('  ✅ Entity after conversion:', {
						entityId: entity.id,
						entityName: entity.name,
						entityBarcode: entity.barcode,
					});
					
					return entity;
				} catch (error) {
					console.error('  ❌ Failed to convert:', { raw, error });
					throw error;
				}
			});
			
			console.log('  ✅ Successfully converted to entities:', {
				count: entities.length,
				ids: entities.map(e => e.id),
			});
			console.log('🔍 ========== ProductRepo.getByIds END ==========\n');
			
			return entities;
		} catch (error: any) {
			console.error('  ❌ Database query failed:', {
				error: error.message,
				stack: error.stack?.split('\n').slice(0, 3).join('\n'),
			});
			throw error;
		}
	}
	
	// ...existing methods...

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

	// ✅ Implement saveMany for GoodReceipt usecase
	public async saveMany(
		entities: Product[],
		transaction?: Prisma.TransactionClient
	): Promise<Product[]> {
		console.log('📦 ProductRepo.saveMany called:', {
			count: entities.length,
			ids: entities.map(e => e.id),
			amounts: entities.map(e => ({ id: e.id, amount: e.amount }))
		});
		
		const repo = transaction || this.client;
		
		// ✅ Update each product individually
		const updatedProducts = await Promise.all(
			entities.map(async (entity) => {
				const updated = await repo.product.update({
					where: { id: entity.id },
					data: {
						amount: entity.amount,
						price: entity.price,
						name: entity.name,
						unit: entity.unit,
					}
				});
				return updated;
			})
		);
		
		console.log('✅ Products updated:', {
			count: updatedProducts.length,
			amounts: updatedProducts.map((p: any) => ({ id: p.id, amount: p.amount }))
		});
		
		// Convert back to entities
		return updatedProducts.map(raw => this.fromPersistence(raw));
	}

	public async getByBarcode(
		barcode: ProductBarcode,
		transaction?: Prisma.TransactionClient
	): Promise<Product | null> {
		const raw = await this.getRepository(transaction).findUnique({
			where: { barcode },
		});

		return raw ? this.fromPersistence(raw) : null;
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
