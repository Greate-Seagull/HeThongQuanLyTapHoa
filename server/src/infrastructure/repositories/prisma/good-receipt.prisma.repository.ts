import { Prisma } from "@prisma/client";
import { GoodReceipt } from "../../../domain/entities/good-receipt";
import { buildSafePrismaSelect } from "../../../domain/services/query-builder.service";
import { GoodReceiptRepository } from "../../../application/repositories/good-receipt.repository";
import { GoodReceiptDto } from "../../../application/DTOs/good-receipt.dto";
import { PrismaRepository } from "./prisma.prisma.repository";

export class GoodReceiptPrismaRepository
	extends PrismaRepository<GoodReceipt, GoodReceiptDto>
	implements GoodReceiptRepository
{
	private static baseSelect = buildSafePrismaSelect(GoodReceipt);

	protected buildUpdateData(entity: GoodReceipt): Partial<GoodReceiptDto> {
		const persistence = this.toPersistence(entity) as any;
		if (Array.isArray(persistence.goodReceiptDetails)) {
			persistence.goodReceiptDetails = {
				deleteMany: {},
				create: persistence.goodReceiptDetails,
			};
		}
		return persistence;
	}

	protected buildCreateData(entity: GoodReceipt): Partial<GoodReceiptDto> {
		const persistence = this.toPersistence(entity) as any;
		persistence.goodReceiptDetails = {
			create: persistence.goodReceiptDetails,
		};
		return persistence;
	}

	protected getBaseQuery(): { select: object } {
		return GoodReceiptPrismaRepository.baseSelect;
	}

	protected getRepository(transaction?: Prisma.TransactionClient): any {
		if (transaction) return transaction.goodReceipt;
		return this.client.goodReceipt;
	}

	// ✅ FIX: Add method
	async add(entity: GoodReceipt, transaction?: Prisma.TransactionClient): Promise<GoodReceipt> {
		console.log('📦 GoodReceiptRepo.add called');
		const repo = transaction ? transaction : this.client;
		const data = this.buildCreateData(entity);
		
		const raw = await repo.goodReceipt.create({
			data: data as any,
			include: {
				goodReceiptDetails: true,
			},
		});

		console.log('  ✅ Good receipt created:', { id: raw.id });
		return this.manuallyConstructEntity(raw);
	}

	// ✅ FIX: getById with proper entity construction
	async getById(id: number): Promise<GoodReceipt | null> {
		console.log(`🔍 GoodReceiptRepo.getById(${id})`);
		
		const raw = await this.client.goodReceipt.findUnique({
			where: { id },
			include: {
				goodReceiptDetails: true,
			},
		});

		if (!raw) {
			console.log('  ❌ Not found');
			return null;
		}

		console.log('  📦 Raw data from DB:', {
			id: raw.id,
			employeeId: raw.employeeId,
			createdAt: raw.createdAt,
			detailsCount: (raw as any).goodReceiptDetails?.length || 0,
		});

		const entity = this.manuallyConstructEntity(raw as any);
		
		console.log('  ✅ Entity constructed:', {
			id: entity.id,
			employeeId: entity.employeeId,
			detailsCount: entity.goodReceiptDetails?.length || 0,
		});

		return entity;
	}

	// ✅ FIX: Manual entity construction with proper getters
	private manuallyConstructEntity(raw: any): GoodReceipt {
		const entity = Object.create(GoodReceipt.prototype);
		
		// ✅ Set private properties directly
		(entity as any)._id = raw.id;
		(entity as any)._employeeId = raw.employeeId;
		(entity as any)._createdAt = raw.createdAt;
		
		// ✅ CRITICAL FIX: Construct details with proper getters
		const details = (raw.goodReceiptDetails || []).map((detailRaw: any) => {
			// Create detail object with proper prototype
			const detail: any = {};
			detail._goodReceiptId = detailRaw.goodReceiptId;
			detail._productId = detailRaw.productId;
			detail._quantity = detailRaw.quantity;
			detail._price = detailRaw.price;
			
			// ✅ Add getters manually
			Object.defineProperty(detail, 'goodReceiptId', {
				get() { return this._goodReceiptId; },
				enumerable: true,
			});
			Object.defineProperty(detail, 'productId', {
				get() { return this._productId; },
				enumerable: true,
			});
			Object.defineProperty(detail, 'quantity', {
				get() { return this._quantity; },
				enumerable: true,
			});
			Object.defineProperty(detail, 'price', {
				get() { return this._price; },
				enumerable: true,
			});
			
			return detail;
		});
		
		(entity as any)._goodReceiptDetails = details;
		
		console.log('  ✅ Details constructed:', {
			count: details.length,
			sample: details[0] ? {
				productId: details[0].productId,
				quantity: details[0].quantity,
				price: details[0].price,
			} : null,
		});
		
		return entity;
	}

	// ✅ FIX: Update with proper transaction handling
	async update(
		id: number,
		employeeId: number,
		items: any[],
		transaction?: Prisma.TransactionClient
	): Promise<GoodReceipt> {
		console.log('📦 GoodReceiptRepo.update:', { id, employeeId, itemsCount: items.length });
		
		// ✅ CRITICAL FIX: Use transaction if provided, otherwise use client
		const prismaClient = transaction || this.client;
		
		// ✅ STEP 1: Delete old details using correct client
		console.log('  🗑️ Deleting old details...');
		const deleteResult = await prismaClient.goodReceiptDetail.deleteMany({
			where: { goodReceiptId: id },
		});
		console.log(`  ✅ Deleted ${deleteResult.count} old details`);

		// ✅ STEP 2: Update with new details
		console.log('  💾 Creating new details...');
		const updated = await prismaClient.goodReceipt.update({
			where: { id },
			data: {
				employeeId,
				goodReceiptDetails: {
					create: items.map((item) => ({
						productId: item.productId,
						quantity: item.quantity,
						price: item.price,
					})),
				},
			},
			include: {
				goodReceiptDetails: true,
			},
		});
		console.log('  ✅ Good receipt updated:', {
			id: updated.id,
			detailsCount: (updated as any).goodReceiptDetails?.length,
		});

		return this.manuallyConstructEntity(updated);
	}

	// ✅ FIX: Delete with proper transaction handling
	async delete(id: number, transaction?: Prisma.TransactionClient): Promise<void> {
		console.log('📦 GoodReceiptRepo.delete:', id);
		
		// ✅ CRITICAL FIX: Use transaction if provided, otherwise use client
		const prismaClient = transaction || this.client;
		
		// Details will be cascade deleted due to FK onDelete: Cascade
		await prismaClient.goodReceipt.delete({
			where: { id },
		});
		
		console.log('  ✅ Good receipt deleted');
	}
}