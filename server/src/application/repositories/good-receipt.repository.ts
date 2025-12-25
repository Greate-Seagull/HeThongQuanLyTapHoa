import { GoodReceipt } from "../../domain/entities/good-receipt";
import { BaseRepository } from "./base.repository";

export interface GoodReceiptRepository extends BaseRepository<GoodReceipt> {
	update(entity: GoodReceipt, transaction?: any): Promise<GoodReceipt>;
}
