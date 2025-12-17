import { BaseRepository } from "./base.repository";
import { Promotion } from "../../domain/entities/promotion";

export interface PromotionRepository extends BaseRepository<Promotion> {
  delete(id: number): Promise<void>;
  update(promotion: Promotion): Promise<Promotion>;
}
