import { GoodReceipt } from "../../domain/entities/good-receipt";
import { BaseRepository } from "./base.repository";
import { Transaction } from "../transactions/base.transaction";

export interface GoodReceiptRepository extends BaseRepository<GoodReceipt> {
	add(entity: GoodReceipt, transaction?: Transaction): Promise<GoodReceipt>;
	update(id: number, employeeId: number, items: any[], transaction?: Transaction): Promise<GoodReceipt>;
	delete(id: number, transaction?: Transaction): Promise<void>;
	getById(id: number): Promise<GoodReceipt | null>;
}
