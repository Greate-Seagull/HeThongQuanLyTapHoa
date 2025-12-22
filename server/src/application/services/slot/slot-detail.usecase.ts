import { SlotDetailRepository } from '../../../infrastructure/repositories/slot-detail.repository';

export class SlotDetailUsecase {
  constructor(private readonly slotDetailRepo: SlotDetailRepository) {}

  async add(slotId: number, productId: number) {
    console.log(`➕ Adding product ${productId} to slot ${slotId}`);
    return this.slotDetailRepo.add(slotId, productId);
  }

  async update(slotId: number, productId: number | null) {
    // ✅ CRITICAL: Handle null/0 productId = remove product from slot
    if (!productId || productId === 0) {
      console.log(`🗑️ Removing all products from slot ${slotId}`);
      return this.slotDetailRepo.removeAll(slotId);
    }
    
    console.log(`🔄 Updating slot ${slotId} with product ${productId}`);
    return this.slotDetailRepo.update(slotId, productId);
  }

  // ✅ ADD: Public method to remove all products from slot
  async removeAll(slotId: number) {
    console.log(`🗑️ SlotDetailUsecase: Removing all products from slot ${slotId}`);
    return this.slotDetailRepo.removeAll(slotId);
  }

  async getBySlotId(slotId: number) {
    return this.slotDetailRepo.getBySlotId(slotId);
  }

  async getAllWithProduct() {
    return this.slotDetailRepo.getAllWithProduct();
  }
}
