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

  async getProducts() {
    console.log('📦 ProductReadAccessor.getProducts() - fetching with slotDetails');
    
    const products = await this.client.product.findMany({
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
        // ✅ CRITICAL: Include slotDetails with full relation tree
        slotDetails: {
          select: {
            slotId: true,
            productId: true,
            slot: {
              select: {
                id: true,
                name: true,
                rackId: true,
                rack: {
                  select: {
                    id: true,
                    name: true,
                    shelfId: true,
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
    
    console.log(`📦 Fetched ${products.length} products`);
    
    // Log sample with slotDetails
    if (products.length > 0) {
      const sample = products[0];
      console.log('📦 Sample product with slotDetails:', {
        id: sample.id,
        name: sample.name,
        barcode: sample.barcode,
        slotDetailsCount: (sample.slotDetails as any)?.length || 0,
      });
    }
    
    return products;
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
