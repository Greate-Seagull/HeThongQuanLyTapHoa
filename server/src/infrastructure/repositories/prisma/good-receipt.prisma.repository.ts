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

  async update(
    entity: GoodReceipt,
    transaction?: Prisma.TransactionClient
  ): Promise<GoodReceipt> {
    const repo = transaction ? transaction : this.client;

    // Xóa hết chi tiết cũ
    await repo.goodReceiptDetail.deleteMany({
      where: { goodReceiptId: entity.id },
    });

    // Tạo lại chi tiết mới
    const data = this.buildUpdateData(entity);
    const raw = await repo.goodReceipt.update({
      where: { id: entity.id },
      data,
      select: GoodReceiptPrismaRepository.baseSelect.select,
    });

    return this.fromPersistence(raw);
  }

  protected buildUpdateData(entity: GoodReceipt): Partial<GoodReceiptDto> {
    let persitence = this.toPersistence(entity) as any;

    // ✅ SỬA: Loại bỏ goodReceiptId và dùng create
    if (persitence.goodReceiptDetails && Array.isArray(persitence.goodReceiptDetails)) {
      persitence.goodReceiptDetails = {
        create: persitence.goodReceiptDetails.map((detail: any) => ({
          productId: detail.productId,
          quantity: detail.quantity,
          price: detail.price,
          // Không cần goodReceiptId - Prisma tự thêm
        })),
      };
    }

    return persitence;
  }

  protected buildCreateData(entity: GoodReceipt): Partial<GoodReceiptDto> {
    let persitence = this.toPersistence(entity) as any;

    // ✅ Tương tự cho create
    if (persitence.goodReceiptDetails && Array.isArray(persitence.goodReceiptDetails)) {
      persitence.goodReceiptDetails = {
        create: persitence.goodReceiptDetails.map((detail: any) => ({
          productId: detail.productId,
          quantity: detail.quantity,
          price: detail.price,
        })),
      };
    }

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
      orderBy: { createdAt: "desc" },
      include: {
        employee: true,
        goodReceiptDetails: {
          include: {
            product: true,
          },
        },
      },
    });
    return raws;
  }

  // ✅ Alias cho usecase
  public async getById(id: number): Promise<any | null> {
    return this.findById(id);
  }

  // Lấy phiếu nhập kho theo id
  public async findById(id: number): Promise<any | null> {
    const raw = await this.client.goodReceipt.findUnique({
      where: { id },
      include: {
        employee: true,
        goodReceiptDetails: {
          include: {
            product: true,
          },
        },
      },
    });

    // ✅ Filter out null items
    if (raw && raw.goodReceiptDetails) {
      raw.goodReceiptDetails = raw.goodReceiptDetails.filter(
        (detail: any) => detail && detail.productId !== null
      );
    }

    return raw;
  }

  // ✅ Tính tổng số lượng nhập từ các phiếu nhập (trừ 1 phiếu chỉ định)
  async getTotalQuantityByProduct(
    productId: number,
    excludeReceiptId?: number
  ): Promise<number> {
    const whereCondition: any = {
      productId: productId,
    };

    if (excludeReceiptId) {
      whereCondition.goodReceiptId = { not: excludeReceiptId };
    }

    const result = await this.client.goodReceiptDetail.aggregate({
      where: whereCondition,
      _sum: {
        quantity: true,
      },
    });

    return Number(result._sum.quantity || 0);
  }
}