import { SlotDetailRepository } from "../../../infrastructure/repositories/slot-detail.repository";

export class SlotDetailUsecase {
  constructor(private readonly slotDetailRepo: SlotDetailRepository) {}

  async add(slotId: number, productId: number) {
    return this.slotDetailRepo.add(slotId, productId);
  }

  async update(slotId: number, productId: number) {
    return this.slotDetailRepo.update(slotId, productId);
  }

  async getBySlotId(slotId: number) {
    return this.slotDetailRepo.getBySlotId(slotId);
  }

  async getAllWithProduct() {
    return this.slotDetailRepo.getAllWithProduct();
  }
  async deleteBySlotId(slotId: number) {
    return this.slotDetailRepo.deleteBySlotId(slotId);
  }
}
