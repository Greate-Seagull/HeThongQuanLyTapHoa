import { GoodReceiptDetailWhereInput } from './../../generated/models/GoodReceiptDetail';
import { Prisma, PrismaClient } from "@prisma/client";
import { GoodReceipt } from "../../domain/entities/good-receipt";
import {
  fromPersistence,
  toPersistenceObject,
} from "../../domain/services/mapper.service";
import { buildSafePrismaSelect } from "../../domain/services/query-builder.service";
import { ChangeTracker } from "../cache/change-tracker";

export class GoodReceiptRepository {
  constructor(private readonly prisma: PrismaClient) {}
  private tracker = new ChangeTracker<any>();

  async update(entity: GoodReceipt, transaction?: Prisma.TransactionClient) {
    const repo = transaction ? transaction : this.prisma;
    const data = toPersistenceObject(entity);
    
    // Xóa hết chi tiết cũ, tạo lại chi tiết mới
    await repo.goodReceiptDetail.deleteMany({
      where: { goodReceiptId: entity.id },
    });
    
    data.goodReceiptDetails = {
      create: entity.goodReceiptDetails.map(toPersistenceObject),
    };
    
    const raw = await repo.goodReceipt.update({
      where: { id: entity.id },
      data,
      ...GoodReceiptRepository.baseQuery,
    });
    
    const savedEntity = fromPersistence(GoodReceipt, raw);
    this.tracker.track(savedEntity.id, raw);
    return savedEntity;
  }

  async add(transaction: Prisma.TransactionClient, entity: GoodReceipt) {
    const repo = transaction ? transaction : this.prisma;
    const data = toPersistenceObject(entity);
    
    data.goodReceiptDetails = {
      create: entity.goodReceiptDetails.map(toPersistenceObject),
    };
    
    const raw = await repo.goodReceipt.create({
      data,
      ...GoodReceiptRepository.baseQuery,
    });

    const savedEntity = fromPersistence(GoodReceipt, raw);
    this.tracker.track(savedEntity.id, raw);
    return savedEntity;
  }

  /**
   * ✅ Tính tổng số lượng nhập của 1 sản phẩm từ TẤT CẢ phiếu nhập (trừ 1 phiếu chỉ định)
   */


  static baseQuery = buildSafePrismaSelect(GoodReceipt);
}