import { PrismaClient } from "@prisma/client";

export class SlotDetailRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async add(slotId: number, productId: number) {
    return this.prisma.slotDetail.create({
      data: { slotId, productId },
    });
  }

  async update(slotId: number, productId: number | null) {
    // ✅ FIX: Delete all existing SlotDetails for this slot
    await this.prisma.slotDetail.deleteMany({ where: { slotId } });
    
    // ✅ CRITICAL: Only create new SlotDetail if productId is provided
    if (productId !== null && productId > 0) {
      return this.prisma.slotDetail.create({
        data: { slotId, productId },
      });
    }
    
    // Return null if slot now has no product
    return null;
  }

  // ✅ Method to remove ALL SlotDetails for a slot (make slot empty)
  async removeAll(slotId: number) {
    console.log(`🗑️ Repository: Deleting all SlotDetails for slot ${slotId}`);
    
    const deletedCount = await this.prisma.slotDetail.deleteMany({
      where: { slotId },
    });
    
    console.log(`✅ Deleted ${deletedCount.count} SlotDetail records for slot ${slotId}`);
    return deletedCount;
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
