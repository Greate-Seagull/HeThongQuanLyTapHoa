import { Stocktaking } from "../../../domain/entities/stocktaking";
import z from "zod";
import { logger } from "../../../domain/services/logger.service";
import { ProductBarcode, ProductId } from "../../../domain/entities/product";
import { StocktakingRepository } from "../../repositories/stocktaking.repository";
import { ProductReadAccessor } from "../read-accessors/product.read-accessor";
import { ShelfReadAccessor } from "../read-accessors/shelf.read-accessor";
import { InventoryReadAccessor } from "../read-accessors/InventoryReadAccessor";

// ============= UPDATE STOCKTAKING USECASE =============
const updateInputSchema = z.object({
  authId: z.number(),
  stocktakingId: z.number(),
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
    private readonly stocktakingRepo: StocktakingRepository,
    private readonly inventoryReadAccess: InventoryReadAccessor
  ) {}

  async execute(input: any) {
    const parsedInput = updateInputSchema.parse(input);
    const log = logger.child({
      task: "Updating stock-taking",
      employeeId: parsedInput.authId,
      stocktakingId: parsedInput.stocktakingId,
    });
    log.info("Task started");

    // 1. Kiểm tra stocktaking có tồn tại không
    const existingStocktaking = await this.stocktakingRepo.getById(
      parsedInput.stocktakingId
    );
    if (!existingStocktaking) {
      log.warn("Task failed: stocktaking not found");
      throw Error(`Stocktaking with id ${parsedInput.stocktakingId} not found`);
    }

    // 2. Validate products và slots giống create
    const barcodes = parsedInput.products.map((p) => p.barcode);
    const idAndBarcodes = await this.productReadAccess.getIdsByBarcodes(
      barcodes
    );
    if (idAndBarcodes.length != barcodes.length) {
      log.warn("Task failed: invalid product barcode");
      throw Error(`Expect all products to be valid`);
    }

    const slotIds = this.getDistinctSlotIds(parsedInput.products);
    const areSlotsValid = await this.shelfReadAccess.existSlotByIds(slotIds);
    if (!areSlotsValid) {
      log.warn("Task failed: invalid slot id");
      throw Error(`Expect all slots to be valid`);
    }

    // 3. Kiểm tra business rule: không cho sửa số lượng khiến inventory bị âm
    const barcodeMap = new Map<ProductBarcode, ProductId>(
      idAndBarcodes.map((i) => [i.barcode, i.id])
    );

    for (const product of parsedInput.products) {
      const productId = barcodeMap.get(product.barcode);
      const oldDetail = existingStocktaking.details.find(
        (d) => d.productId === productId && d.slotId === product.slotId
      );

      if (oldDetail) {
        const quantityDiff = product.quantity - oldDetail.quantity;

        // Nếu giảm số lượng (quantityDiff < 0), kiểm tra có đủ hàng để giảm không
        if (quantityDiff < 0) {
          const currentInventory = await this.inventoryReadAccess.getQuantity(
            productId,
            product.slotId
          );

          // Số lượng hiện tại - số lượng muốn giảm phải >= 0
          if (currentInventory + quantityDiff < 0) {
            log.warn("Task failed: insufficient inventory", {
              productId,
              slotId: product.slotId,
              currentInventory,
              attemptedReduction: Math.abs(quantityDiff),
            });
            throw Error(
              `Không thể giảm số lượng sản phẩm ${product.barcode} tại slot ${product.slotId}. ` +
                `Tồn kho hiện tại: ${currentInventory}, số lượng muốn giảm: ${Math.abs(
                  quantityDiff
                )}`
            );
          }
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
    await this.stocktakingRepo.update(existingStocktaking);

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
