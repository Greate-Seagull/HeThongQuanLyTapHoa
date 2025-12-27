import { GoodReceipt } from "../../domain/entities/good-receipt";
import { BaseRepository } from "./base.repository";

export interface GoodReceiptRepository extends BaseRepository<GoodReceipt> {
  update(entity: GoodReceipt, transaction?: any): Promise<GoodReceipt>;
  getTotalQuantityByProduct(
    productId: number,
    excludeReceiptId?: number
  ): Promise<number>;
  findById(id: number): Promise<any | null>;
  findAll(): Promise<any[]>;
}
