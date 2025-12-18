import { SlotDetailUsecase } from './slot-detail.usecase';

export class ListSlotWithProductUsecase {
  constructor(private readonly slotDetailUsecase: SlotDetailUsecase) {}

  async execute() {
    // Lấy tất cả SlotDetail kèm slot và product
    const slotDetails = await this.slotDetailUsecase.getAllWithProduct();
    // Map ra danh sách slot kèm tên sản phẩm
    return slotDetails.map((sd: any) => ({
      slotId: sd.slotId,
      slotName: sd.slot?.name,
      rackId: sd.slot?.rackId,
      productId: sd.productId,
      productName: sd.product?.name,
    }));
  }
}
