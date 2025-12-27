import z from "zod";
import { GoodReceipt } from "../../../domain/entities/good-receipt";
import { logger } from "../../../domain/services/logger.service";
import { ProductRepository } from "../../repositories/product.repository";
import { TransactionManager } from "../../transactions/base.transaction";
import { GoodReceiptRepository } from "../../repositories/good-receipt.repository";
import { EmployeeReadAccessor } from "../read-accessors/employee.read-accessor";

const inputSchema = z.object({
  id: z.coerce.number(),
  authId: z.number(),
  items: z.array(
    z.object({
      productId: z.number(),
      quantity: z.number(),
      price: z.number(),
    })
  ),
});

export class UpdateGoodReceiptUsecase {
  constructor(
    private readonly employeeRead: EmployeeReadAccessor,
    private readonly productRepo: ProductRepository,
    private readonly goodReceiptRepo: GoodReceiptRepository,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(input: any) {
    const parsedInput = inputSchema.parse(input);
    const log = logger.child({
      task: "Updating good receipt",
      employeeId: parsedInput.authId,
      id: parsedInput.id,
    });
    log.info("Task started");

    // Lấy phiếu nhập cũ
    const oldReceipt = await this.goodReceiptRepo.findById(parsedInput.id);
    if (!oldReceipt) throw Error("Good receipt not found");

    // ✅ Log để debug
    log.info("Old receipt data:", {
      id: oldReceipt.id,
      hasDetails: !!oldReceipt.goodReceiptDetails,
      detailsLength: oldReceipt.goodReceiptDetails?.length,
      details: oldReceipt.goodReceiptDetails,
    });

    // Lấy tất cả productIds (cả cũ và mới)
    const allProductIds = new Set<number>();
    
    // ✅ Thêm null checks và filter
    if (oldReceipt.goodReceiptDetails && Array.isArray(oldReceipt.goodReceiptDetails)) {
      for (const oldItem of oldReceipt.goodReceiptDetails) {
        // ✅ Skip nếu item null hoặc không có productId
        if (!oldItem || !oldItem.productId) {
          log.warn("Skipping invalid old item:", oldItem);
          continue;
        }
        allProductIds.add(Number(oldItem.productId));
      }
    }
    
    // ProductIds trong phiếu mới
    for (const newItem of parsedInput.items) {
      // ✅ Validate item mới
      if (!newItem || !newItem.productId) {
        log.warn("Skipping invalid new item:", newItem);
        continue;
      }
      allProductIds.add(Number(newItem.productId));
    }

    // ✅ Kiểm tra có productIds không
    if (allProductIds.size === 0) {
      throw Error("Không có sản phẩm hợp lệ để cập nhật");
    }

    const products = await this.productRepo.getByIds(Array.from(allProductIds));
    const productMap = new Map(products.map((p) => [Number(p.id), p]));

    // ✅ Map lưu thay đổi của từng sản phẩm
    const productUpdates = new Map<number, {
      product: any;
      oldQty: number;
      newQty: number;
      diff: number;
    }>();

    // Xử lý các sản phẩm mới/cập nhật
    for (const item of parsedInput.items) {
      // ✅ Skip invalid items
      if (!item || !item.productId) {
        log.warn("Skipping invalid item in processing:", item);
        continue;
      }

      const product = productMap.get(Number(item.productId));
      if (!product) {
        log.error(`Product not found: ${item.productId}`);
        throw Error(`Product not found: ${item.productId}`);
      }

      // ✅ Tìm oldItem với null checks
      const oldItem = oldReceipt.goodReceiptDetails?.find(
        (i: any) => i && i.productId && Number(i.productId) === Number(item.productId)
      );
      const oldQty = oldItem ? Number(oldItem.quantity) : 0;
      const newQty = Number(item.quantity);

      if (newQty < 0) {
        throw Error(`Số lượng nhập không được âm cho sản phẩm "${product.name}"`);
      }

      productUpdates.set(Number(item.productId), {
        product,
        oldQty,
        newQty,
        diff: newQty - oldQty
      });
    }

    // Xử lý các sản phẩm bị XÓA khỏi phiếu nhập
    if (oldReceipt.goodReceiptDetails && Array.isArray(oldReceipt.goodReceiptDetails)) {
      for (const oldItem of oldReceipt.goodReceiptDetails) {
        // ✅ Skip invalid items
        if (!oldItem || !oldItem.productId) {
          log.warn("Skipping invalid old item in deletion check:", oldItem);
          continue;
        }

        const productId = Number(oldItem.productId);
        if (!productUpdates.has(productId)) {
          const product = productMap.get(productId);
          if (product) {
            productUpdates.set(productId, {
              product,
              oldQty: Number(oldItem.quantity),
              newQty: 0,
              diff: -Number(oldItem.quantity)
            });
          }
        }
      }
    }

    // ✅ Validate và tính lại amount cho từng sản phẩm
    for (const [productId, update] of productUpdates) {
      // ✅ Bước 1: Tính TỔNG SỐ LƯỢNG NHẬP từ các phiếu khác
      const totalFromOtherReceipts = await this.goodReceiptRepo.getTotalQuantityByProduct(
        productId,
        parsedInput.id // Loại trừ phiếu đang sửa
      );

      // ✅ Bước 2: Tính TỔNG SỐ LƯỢNG NHẬP (bao gồm phiếu đang sửa)
      const totalReceived = totalFromOtherReceipts + update.newQty;

      // ✅ Bước 3: Tính TỔNG SỐ LƯỢNG ĐÃ BÁN
      const totalSold = await this.productRepo.getTotalSoldQuantity(productId);

      // ✅ Bước 4: Amount mới = Tổng nhập - Tổng bán
      const newAmount = totalReceived - totalSold;

      log.info(`Product ${update.product.name}:`, {
        oldQtyInReceipt: update.oldQty,
        newQtyInReceipt: update.newQty,
        totalFromOtherReceipts,
        totalReceived,
        totalSold,
        calculatedAmount: newAmount,
        currentAmount: update.product.amount,
      });

      // ✅ Kiểm tra: Amount không được âm
      if (newAmount < 0) {
        throw Error(
          `Không thể cập nhật sản phẩm "${update.product.name}". ` +
          `Tổng số lượng nhập (${totalReceived}) không đủ để trừ đi số lượng đã bán (${totalSold}). ` +
          `Thiếu ${Math.abs(newAmount)} sản phẩm.`
        );
      }

      // ✅ Cập nhật amount
      update.product.amount = newAmount;
    }

    // ✅ Cập nhật entity GoodReceipt với goodReceiptDetails mới
    const updatedReceipt = Object.assign(oldReceipt, {
      goodReceiptDetails: parsedInput.items
        .filter(item => item && item.productId) // ✅ Filter out null items
        .map((item: any) => ({
          goodReceiptId: parsedInput.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
    });

    // Lưu vào DB trong transaction
    await this.transactionManager.transaction(async (tx) => {
      await Promise.all([
        this.goodReceiptRepo.update(updatedReceipt, tx),
        this.productRepo.saveMany(Array.from(productMap.values()), tx),
      ]);
    });

    log.info("Task completed successfully");
    return { success: true };
  }
}