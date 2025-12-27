import { ProductBarcode, ProductId } from "../../../domain/entities/product";
import { PromotionId } from "../../../domain/entities/promotion";

export interface ProductReadAccessor {
  getProductIncludePromotionId(id: ProductId): Promise<{
    id: ProductId;
    name: string;
    price: number;
    unit: string;
    promotionDetails: {
      promotionId: PromotionId;
    }[];
  }>;
  existByIds(ids: ProductId[]): Promise<boolean>;
  getProducts(
    page: number,
    limit: number
  ): Promise<
    {
      id: ProductId;
      name: string;
      price: number;
      unit: string;
      barcode: ProductBarcode;
    }[]
  >;
  getIdsByBarcodes(
    barcodes: ProductBarcode[]
  ): Promise<{ id: ProductId; barcode: ProductBarcode }[]>;
  getProductAmount(productId: number): Promise<number>;
}
