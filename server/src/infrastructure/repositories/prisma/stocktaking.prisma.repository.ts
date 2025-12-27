import { Prisma, PrismaClient } from "@prisma/client";
import { Stocktaking } from "../../../domain/entities/stocktaking";
import { ChangeTracker } from "../../cache/change-tracker";
import {
  fromPersistence,
  toPersistenceObject,
} from "../../../domain/services/mapper.service";
import { buildSafePrismaSelect } from "../../../domain/services/query-builder.service";
import { PrismaRepository } from "./prisma.prisma.repository";
import { StocktakingDto } from "../../../application/DTOs/stocktaking.dto";
import { StocktakingRepository } from "../../../application/repositories/stocktaking.repository";

export class StocktakingPrismaRepository
  extends PrismaRepository<Stocktaking, StocktakingDto>
  implements StocktakingRepository
{
  private static baseSelect = buildSafePrismaSelect(Stocktaking);

  protected buildUpdateData(entity: Stocktaking): Partial<StocktakingDto> {
    let persistence = this.toPersistence(entity) as any;

    // XÓA tất cả details cũ, sau đó TẠO MỚI
    persistence.stocktakingDetails = {
      deleteMany: {}, // Xóa tất cả details cũ
      create: persistence.stocktakingDetails, // Tạo mới với data mới
    };

    return persistence;
  }

  protected buildCreateData(entity: Stocktaking): Partial<StocktakingDto> {
    let persistence = this.toPersistence(entity) as any;
    persistence.stocktakingDetails = {
      create: persistence.stocktakingDetails,
    };
    return persistence;
  }

  protected getBaseQuery(): { select: object } {
    return StocktakingPrismaRepository.baseSelect;
  }

  protected getRepository(transaction?: Prisma.TransactionClient): any {
    if (transaction) return transaction.stocktaking;
    return this.client.stocktaking;
  }

  // Lấy tất cả phiếu kiểm kê kèm chi tiết, employee, product, slot, rack, shelf
  async findAllWithDetails() {
    return this.client.stocktaking.findMany({
      include: {
        employee: true,
        stocktakingDetails: {
          include: {
            product: true,
            slot: {
              include: {
                rack: {
                  include: {
                    shelf: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
  // Lấy chi tiết phiếu kiểm kê theo id, bao gồm employee, stocktakingDetails, product, slot, rack, shelf
  async findByIdWithDetails(id: number) {
    return this.client.stocktaking.findUnique({
      where: { id },
      include: {
        employee: true,
        stocktakingDetails: {
          include: {
            product: true,
            slot: {
              include: {
                rack: {
                  include: {
                    shelf: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findById(id: number): Promise<Stocktaking | null> {
    const stocktaking = await this.client.stocktaking.findUnique({
      where: { id },
      include: {
        stocktakingDetails: true,
      },
    });

    if (!stocktaking) return null;

    return fromPersistence(Stocktaking, stocktaking);
  }

  // Cập nhật phiếu kiểm kê
  async update(entity: Stocktaking): Promise<Stocktaking> {
    const persistence = this.toPersistence(entity) as any;

    // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
    const updated = await this.client.$transaction(async (tx) => {
      // 1. Xóa tất cả chi tiết cũ
      await tx.stocktakingDetail.deleteMany({
        where: { stocktakingId: entity.id },
      });

      // 2. Cập nhật phiếu kiểm kê và tạo chi tiết mới
      return tx.stocktaking.update({
        where: { id: entity.id },
        data: {
          employeeId: persistence.employeeId,
          stocktakingDetails: {
            create: persistence.stocktakingDetails,
          },
        },
        include: {
          stocktakingDetails: true,
        },
      });
    });

    return fromPersistence(Stocktaking, updated);
  }
}
