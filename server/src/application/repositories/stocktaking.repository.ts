import { Stocktaking } from "../../domain/entities/stocktaking";
import { BaseRepository } from "./base.repository";
import { Transaction } from "../transactions/base.transaction";

export interface StocktakingRepository extends BaseRepository<Stocktaking> {
	add(entity: Stocktaking, transaction?: Transaction): Promise<Stocktaking>;
	update(id: number, employeeId: number, details: any[], transaction?: Transaction): Promise<Stocktaking>;
	delete(id: number, transaction?: Transaction): Promise<void>;
	getById(id: number): Promise<Stocktaking | null>;
}
