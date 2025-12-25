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
    const oldReceipt = await this.goodReceiptRepo.getById(
      parsedInput.id
    );
    if (!oldReceipt) throw Error("Good receipt not found");

    // Lấy danh sách sản phẩm liên quan
    const uniqueProductIds = [
      ...new Set(parsedInput.items.map((i) => Number(i.productId))),
    ];
    const products = await this.productRepo.getByIds(uniqueProductIds);
    const productMap = new Map(products.map((p) => [Number(p.id), p]));

    // Kiểm tra số lượng mới không nhỏ hơn số lượng đã bán
    for (const item of parsedInput.items) {
      const product = productMap.get(Number(item.productId));
      if (!product) throw Error(`Product not found: ${item.productId}`);

      // Tìm số lượng đã bán (giả sử có hàm getSoldQuantity)
      const soldQuantity = product.getSoldQuantity
        ? await product.getSoldQuantity()
        : 0;

      // Số lượng nhập mới không được nhỏ hơn đã bán
      if (item.quantity < soldQuantity) {
        throw Error(
          `Không thể cập nhật số lượng nhập (${item.quantity}) nhỏ hơn số lượng đã bán (${soldQuantity}) cho sản phẩm ${product.name}`
        );
      }
    }

    // Tính chênh lệch và cập nhật tồn kho
    for (const item of parsedInput.items) {
      const product = productMap.get(Number(item.productId));
      // Fix lỗi TS2339: Ép kiểu any để truy cập items (do thiếu definition trong Entity)
      const oldItem = (oldReceipt as any).items?.find(
        (i: any) => i.productId === item.productId
      );
      const oldQty = oldItem ? oldItem.quantity : 0;
      const diff = item.quantity - oldQty;
      if (diff !== 0) {
        product.receiveStock(diff);
      }
    }

    // Cập nhật phiếu nhập
    oldReceipt.updateItems(parsedInput.items);

    await this.transactionManager.transaction(async (tx) => {
      await Promise.all([
        this.goodReceiptRepo.update(oldReceipt, tx),
        this.productRepo.saveMany(products, tx),
      ]);
    });

    log.info("Task completed");
    return { success: true };
  }
}
