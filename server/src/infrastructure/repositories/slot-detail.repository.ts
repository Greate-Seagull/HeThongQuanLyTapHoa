import { PrismaClient } from "@prisma/client";

export class SlotDetailRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async add(slotId: number, productId: number) {
    return this.prisma.slotDetail.create({
      data: { slotId, productId },
    });
  }

  async update(slotId: number, productId: number) {
    // Xóa hết slotDetail cũ của slot, chỉ giữ 1 sản phẩm/slot
    await this.prisma.slotDetail.deleteMany({ where: { slotId } });
    return this.prisma.slotDetail.create({
      data: { slotId, productId },
    });
  }

  async getBySlotId(slotId: number) {
    return this.prisma.slotDetail.findMany({
      where: { slotId },
      include: { product: true },
    });
  }

  async getAllWithProduct() {
    return this.prisma.slotDetail.findMany({
      include: { slot: true, product: true },
    });
  }
}
