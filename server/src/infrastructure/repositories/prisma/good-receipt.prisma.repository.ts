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
		let persitence = this.toPersistence(entity) as any;
		persitence.goodReceiptDetails = {
			connect: persitence.goodReceiptDetails,
		};
		return persitence;
	}

	protected buildCreateData(entity: GoodReceipt): Partial<GoodReceiptDto> {
		let persitence = this.toPersistence(entity) as any;
		persitence.goodReceiptDetails = {
			create: persitence.goodReceiptDetails,
		};
		return persitence;
	}

	protected getBaseQuery(): { select: object } {
		return GoodReceiptPrismaRepository.baseSelect;
	}

	protected getRepository(transaction?: Prisma.TransactionClient): any {
		if (transaction) return transaction.goodReceipt;
		return this.client.goodReceipt;
	}

	// Lấy tất cả phiếu nhập kho
	public async findAll(): Promise<any[]> {
		const raws = await this.client.goodReceipt.findMany({
			orderBy: { createdAt: 'desc' },
			include: {
				employee: true,
				goodReceiptDetails: {
					include: {
						product: true
					}
				}
			}
		});
		return raws;
	}

	// Lấy phiếu nhập kho theo id
	public async findById(id: number): Promise<any | null> {
		const raw = await this.client.goodReceipt.findUnique({
			where: { id },
			include: {
				employee: true,
				goodReceiptDetails: {
					include: {
						product: true
					}
				}
			}
		});
		return raw;
	}
}
