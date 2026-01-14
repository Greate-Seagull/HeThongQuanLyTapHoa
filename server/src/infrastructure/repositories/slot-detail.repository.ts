import { PrismaClient } from "@prisma/client";

export class SlotDetailRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async add(slotId: number, productId: number, quantity: number = 0) {
    return this.prisma.slotDetail.create({
      data: { slotId, productId, quantity },
    });
  }

  async update(slotId: number, productId: number, quantity?: number) {
    console.log("slotid, productid", slotId, productId);
    // Xóa TẤT CẢ SlotDetail cũ của slot này trước
    await this.prisma.slotDetail.deleteMany({
      where: { slotId: slotId },
    });

    // Tạo mới SlotDetail với productId mới
    const data: any = { slotId, productId };
    if (quantity !== undefined) data.quantity = quantity;
    
    return this.prisma.slotDetail.create({
      data,
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

  /**
   * Chuyển sản phẩm từ ô nguồn sang ô đích với validation số lượng
   * @param fromSlotId ID của ô nguồn
   * @param toSlotId ID của ô đích
   * @param productId ID của sản phẩm cần chuyển
   * @param quantity Số lượng cần chuyển
   * @returns Object chứa thông tin ô nguồn và ô đích sau khi chuyển
   * @throws Error nếu không đủ số lượng hoặc validation fail
   */
  async transferProduct(
    fromSlotId: number,
    toSlotId: number,
    productId: number,
    quantity: number
  ) {
    // Validation: Số lượng phải > 0
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    // Lấy thông tin ô nguồn
    const sourceSlot = await this.prisma.slotDetail.findUnique({
      where: {
        slotId_productId: {
          slotId: fromSlotId,
          productId: productId,
        },
      },
    });

    // Validation: Ô nguồn phải tồn tại
    if (!sourceSlot) {
      throw new Error("Source slot does not contain this product");
    }

    // Validation: Ô nguồn phải có đủ số lượng
    if (sourceSlot.quantity < quantity) {
      throw new Error(
        `Not enough quantity in source slot. Available: ${sourceSlot.quantity}, Requested: ${quantity}`
      );
    }

    // Lấy thông tin ô đích (nếu đã có sản phẩm này)
    const targetSlot = await this.prisma.slotDetail.findUnique({
      where: {
        slotId_productId: {
          slotId: toSlotId,
          productId: productId,
        },
      },
    });

    // Thực hiện transaction để đảm bảo tính toàn vẹn
    return await this.prisma.$transaction(async (tx) => {
      // Trừ số lượng từ ô nguồn
      const newSourceQuantity = sourceSlot.quantity - quantity;

      let updatedSource;
      if (newSourceQuantity === 0) {
        // Nếu ô nguồn hết sản phẩm, xóa luôn
        await tx.slotDetail.delete({
          where: {
            slotId_productId: {
              slotId: fromSlotId,
              productId: productId,
            },
          },
        });
        updatedSource = null;
      } else {
        // Cập nhật số lượng mới
        updatedSource = await tx.slotDetail.update({
          where: {
            slotId_productId: {
              slotId: fromSlotId,
              productId: productId,
            },
          },
          data: {
            quantity: newSourceQuantity,
          },
        });
      }

      // Cộng số lượng vào ô đích
      let updatedTarget;
      if (targetSlot) {
        // Nếu ô đích đã có sản phẩm, cộng thêm
        updatedTarget = await tx.slotDetail.update({
          where: {
            slotId_productId: {
              slotId: toSlotId,
              productId: productId,
            },
          },
          data: {
            quantity: targetSlot.quantity + quantity,
          },
        });
      } else {
        // Nếu ô đích chưa có sản phẩm, tạo mới
        updatedTarget = await tx.slotDetail.create({
          data: {
            slotId: toSlotId,
            productId: productId,
            quantity: quantity,
          },
        });
      }

      return {
        source: updatedSource,
        target: updatedTarget,
        transferredQuantity: quantity,
      };
    });
  }

  /**
   * Cập nhật số lượng sản phẩm trong một ô
   */
  async updateQuantity(slotId: number, productId: number, quantity: number) {
    if (quantity < 0) {
      throw new Error("Quantity cannot be negative");
    }

    if (quantity === 0) {
      // Nếu quantity = 0, xóa SlotDetail
      await this.prisma.slotDetail.delete({
        where: {
          slotId_productId: {
            slotId,
            productId,
          },
        },
      });
      return null;
    }

    // Upsert: Update nếu có, create nếu chưa có
    return this.prisma.slotDetail.upsert({
      where: {
        slotId_productId: {
          slotId,
          productId,
        },
      },
      update: {
        quantity,
      },
      create: {
        slotId,
        productId,
        quantity,
      },
    });
  }
}
