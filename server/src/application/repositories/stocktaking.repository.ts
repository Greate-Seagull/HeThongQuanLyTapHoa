import { Stocktaking } from "../../domain/entities/stocktaking";
import { BaseRepository } from "./base.repository";

export interface StocktakingRepository extends BaseRepository<Stocktaking> {
	update(id: number, employeeId: number, details: any[]): Promise<Stocktaking>;
	delete(id: number): Promise<void>;
}
