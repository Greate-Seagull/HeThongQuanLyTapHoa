import { SlotDetailRepository } from "../../../infrastructure/repositories/slot-detail.repository";

export class SlotDetailUsecase {
  constructor(private readonly slotDetailRepo: SlotDetailRepository) {}

  async add(slotId: number, productId: number, quantity: number = 0) {
    return this.slotDetailRepo.add(slotId, productId, quantity);
  }

  async update(slotId: number, productId: number, quantity?: number) {
    return this.slotDetailRepo.update(slotId, productId, quantity);
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

  /**
   * Chuyển sản phẩm từ ô này sang ô khác
   * @param fromSlotId ID của ô nguồn
   * @param toSlotId ID của ô đích
   * @param productId ID của sản phẩm cần chuyển
   * @param quantity Số lượng cần chuyển (phải ≤ số lượng trong ô nguồn)
   */
  async transferProduct(
    fromSlotId: number,
    toSlotId: number,
    productId: number,
    quantity: number
  ) {
    return this.slotDetailRepo.transferProduct(
      fromSlotId,
      toSlotId,
      productId,
      quantity
    );
  }

  /**
   * Cập nhật số lượng sản phẩm trong một ô
   */
  async updateQuantity(slotId: number, productId: number, quantity: number) {
    return this.slotDetailRepo.updateQuantity(slotId, productId, quantity);
  }
}

