import { PrismaReadAccessor } from "./prisma.read-accessor";
import { ProductReadAccessor } from "../../../application/services/read-accessors/product.read-accessor";
import { ProductBarcode, ProductId } from "../../../domain/entities/product";
import { PromotionId } from "../../../domain/entities/promotion";

export class ProductPrismaReadAccessor
  extends PrismaReadAccessor
  implements ProductReadAccessor
{
  async getProductIncludePromotionId(id: ProductId): Promise<{
    id: ProductId;
    name: string;
    price: number;
    unit: string;
    promotionDetails: {
      promotionId: PromotionId;
    }[];
  }> {
    return await this.client.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        unit: true,
        promotionDetails: {
          select: {
            promotionId: true,
          },
        },
      },
    });
  }

  async existByIds(ids: ProductId[]): Promise<boolean> {
    const count = await this.client.product.count({
      where: { id: { in: ids } },
    });

    return count === ids.length;
  }

  async getProducts(): Promise<any[]> {
    return await this.client.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        amount: true,
        unit: true,
        barcode: true,
        status: true,
        categoryId: true,
        supplierId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
        slotDetails: {
          select: {
            slotId: true,
            slot: {
              select: {
                id: true,
                name: true,
                rack: {
                  select: {
                    id: true,
                    name: true,
                    shelf: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getIdsByBarcodes(
    barcodes: ProductBarcode[]
  ): Promise<{ id: ProductId; barcode: ProductBarcode }[]> {
    const count = await this.client.product.findMany({
      where: { barcode: { in: barcodes } },
      select: {
        id: true,
        barcode: true,
      },
    });

    return count;
  }
}
