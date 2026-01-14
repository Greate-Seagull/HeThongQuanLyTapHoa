import { SlotDetailUsecase } from "./slot-detail.usecase";

export class ListSlotWithProductUsecase {
  constructor(private readonly slotDetailUsecase: SlotDetailUsecase) {}

  async execute() {
    const slotDetails = await this.slotDetailUsecase.getAllWithProduct();

    // Map ra danh sách slot kèm đầy đủ thông tin vị trí
    return slotDetails.map((sd: any) => ({
      slotId: sd.slotId,
      slotName: sd.slot?.name,

      // Lấy thông tin Rack
      rackId: sd.slot?.rackId,
      rackName: sd.slot?.rack?.name,

      // Lấy thông tin Shelf (Kệ)
      shelfId: sd.slot?.rack?.shelfId,
      shelfName: sd.slot?.rack?.shelf?.name,

      // Thông tin sản phẩm
      productId: sd.productId,
      productName: sd.product?.name,
      productPrice: sd.product?.price,
      productUnit: sd.product?.unit,
      
      // Số lượng sản phẩm trong ô
      quantity: sd.quantity || 0,
    }));
  }
}
