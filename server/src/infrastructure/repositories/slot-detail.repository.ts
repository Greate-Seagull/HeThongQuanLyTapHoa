import { PrismaClient } from "@prisma/client";

export class SlotDetailRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async add(slotId: number, productId: number) {
    return this.prisma.slotDetail.create({
      data: { slotId, productId },
    });
  }

  async update(slotId: number, productId: number) {
    console.log("slotid, productid", slotId, productId);
    // Xóa TẤT CẢ SlotDetail cũ của slot này trước
    await this.prisma.slotDetail.deleteMany({
      where: { slotId: slotId },
    });

    // Tạo mới SlotDetail với productId mới
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
  async deleteBySlotId(slotId: number) {
    return this.prisma.slotDetail.deleteMany({
      where: { slotId },
    });
  }

  async getAllWithProduct() {
    return this.prisma.slotDetail.findMany({
      include: {
        product: true,
        slot: {
          include: {
            rack: {
              include: {
                shelf: true, // Lấy thông tin Kệ (Shelf) từ Rack
              },
            },
          },
        },
      },
    });
  }
}
