import { Stocktaking } from "../../../domain/entities/stocktaking";
import z from "zod";
import { logger } from "../../../domain/services/logger.service";
import { ProductBarcode, ProductId } from "../../../domain/entities/product";
import { StocktakingRepository } from "../../repositories/stocktaking.repository";
import { ProductReadAccessor } from "../read-accessors/product.read-accessor";
import { ShelfReadAccessor } from "../read-accessors/shelf.read-accessor";

const updateInputSchema = z.object({
  authId: z.number(),
  id: z.number(),
  products: z.array(
    z.object({
      barcode: z.number(),
      slotId: z.number(),
      status: z.string(),
      quantity: z.number().positive("Số lượng phải lớn hơn 0"),
    })
  ),
});

const updateOutputSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export class UpdateStocktakingUsecase {
  constructor(
    private readonly productReadAccess: ProductReadAccessor,
    private readonly shelfReadAccess: ShelfReadAccessor,
    private readonly stocktakingRepo: StocktakingRepository
  ) {}

  async execute(input: any) {
    const parsedInput = updateInputSchema.parse(input);
    console.log("parsedInput", parsedInput);

    const log = logger.child({
      task: "Updating stock-taking",
      employeeId: parsedInput.authId,
      stocktakingId: parsedInput.id,
    });
    log.info("Task started");

    // 1. Kiểm tra stocktaking có tồn tại không
    const existingStocktaking = await this.stocktakingRepo.getById(
      parsedInput.id
    );
    if (!existingStocktaking) {
      log.warn("Task failed: stocktaking not found");
      throw Error(`Stocktaking with id ${parsedInput.id} not found`);
    }

    // 2. Validate products và slots giống create
    const barcodes = parsedInput.products.map((p) => p.barcode);
    const idAndBarcodes = await this.productReadAccess.getIdsByBarcodes(
      barcodes
    );
    console.log("getIdsByBarcodes ", idAndBarcodes);

    const uniqueBarcodes = new Set(barcodes);
    if (idAndBarcodes.length != uniqueBarcodes.size) {
      log.warn("Task failed: invalid product barcode");
      throw Error(`Expect all products to be valid`);
    }

    const slotIds = this.getDistinctSlotIds(parsedInput.products);
    const areSlotsValid = await this.shelfReadAccess.existSlotByIds(slotIds);
    if (!areSlotsValid) {
      log.warn("Task failed: invalid slot id");
      throw Error(`Expect all slots to be valid`);
    }

    // 3. Kiểm tra business rule: không cho sửa số lượng khiến tồn kho bị âm
    const barcodeMap = new Map<ProductBarcode, ProductId>(
      idAndBarcodes.map((i) => [i.barcode, i.id])
    );

    console.log("barcodeMap:", barcodeMap);
    console.log("Looking for barcode:", parsedInput.products[0].barcode);
    console.log(
      "Found productId:",
      barcodeMap.get(parsedInput.products[0].barcode)
    );

    // Group products by productId để tính tổng quantity thay đổi cho mỗi sản phẩm
    const productChanges = new Map<ProductId, number>();

    for (const product of parsedInput.products) {
      const productId = barcodeMap.get(product.barcode);
      if (!productId) continue;

      // Tìm chi tiết cũ của sản phẩm này trong phiếu kiểm kê
      const oldDetail = existingStocktaking.details?.find(
        (d) => d && d.productId === productId && d.slotId === product.slotId
      );

      if (oldDetail) {
        const quantityDiff = product.quantity - oldDetail.quantity;

        // Cộng dồn thay đổi cho từng sản phẩm
        const currentChange = productChanges.get(productId) || 0;
        productChanges.set(productId, currentChange + quantityDiff);
      }
    }

    // Kiểm tra từng sản phẩm có đủ số lượng không
    for (const [productId, quantityDiff] of productChanges.entries()) {
      // Chỉ kiểm tra nếu GIẢM số lượng
      if (quantityDiff < 0) {
        const currentAmount = await this.productReadAccess.getProductAmount(
          productId
        );

        // Số lượng hiện tại + thay đổi phải >= 0
        if (currentAmount + quantityDiff < 0) {
          const product = idAndBarcodes.find((p) => p.id === productId);
          log.warn("Task failed: insufficient stock", {
            productId,
            barcode: product?.barcode,
            currentAmount,
            attemptedReduction: Math.abs(quantityDiff),
          });
          throw Error(
            `Không thể giảm số lượng sản phẩm (barcode: ${product?.barcode}). ` +
              `Tồn kho hiện tại: ${currentAmount}, ` +
              `số lượng muốn giảm: ${Math.abs(quantityDiff)}`
          );
        }
      }
    }

    log.debug("Task validated", {
      barcodes: barcodes,
      slotIds: slotIds,
    });

    // 4. Cập nhật stocktaking
    const updatedDetails = parsedInput.products.map((p) => ({
      status: p.status,
      quantity: p.quantity,
      productId: barcodeMap.get(p.barcode),
      slotId: p.slotId,
    }));

    existingStocktaking.updateDetails(updatedDetails, parsedInput.authId);
    console.log("existingStocktaking", existingStocktaking);

    await this.stocktakingRepo.save(existingStocktaking);

    log.info("Task completed");
    return updateOutputSchema.parse({
      success: true,
      message: "Cập nhật phiếu kiểm kê thành công",
    });
  }

  getDistinctSlotIds(items: any[]) {
    const ids = new Set<number>();
    for (const item of items) {
      if (item.slotId) ids.add(item.slotId);
    }
    return [...ids];
  }
}
