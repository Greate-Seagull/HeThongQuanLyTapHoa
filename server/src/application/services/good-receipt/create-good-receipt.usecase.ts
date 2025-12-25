import z from "zod";
import { GoodReceipt } from "../../../domain/entities/good-receipt";
import { logger } from "../../../domain/services/logger.service";
import { ProductRepository } from "../../repositories/product.repository";
import { TransactionManager } from "../../transactions/base.transaction";
import { GoodReceiptRepository } from "../../repositories/good-receipt.repository";
import { EmployeeReadAccessor } from "../read-accessors/employee.read-accessor";

const inputSchema = z.object({
  authId: z.number(),
  items: z.array(
    z.object({
      productId: z.number(),
      quantity: z.number(),
      price: z.number(),
    })
  ),
});

const outputSchema = z.object({
  goodReceiptId: z.number(),
  employeeName: z.string(),
  createdAt: z.date(),
  products: z.array(
    z.object({
      productId: z.number(),
      name: z.string(),
      amount: z.number(),
    })
  ),
});

type CreateGoodReceiptOutput = z.infer<typeof outputSchema>;

export class CreateGoodReceiptUsecase {
  constructor(
    private readonly employeeRead: EmployeeReadAccessor,
    private readonly productRepo: ProductRepository,
    private readonly goodReceiptRepo: GoodReceiptRepository,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(input: any): Promise<CreateGoodReceiptOutput> {

    const parsedInput = inputSchema.parse(input);
    const log = logger.child({
      task: "Creating good receipt",
      employeeId: parsedInput.authId,
    });
    log.info("Task started");

    // Lấy danh sách ID duy nhất để query, tránh lỗi khi input có duplicate
    // Ép kiểu về number để tránh lỗi lệch kiểu giữa input và DB
    const uniqueProductIds = [...new Set(parsedInput.items.map((i) => Number(i.productId)))];
    log.debug("Querying products", { uniqueProductIds });
    const products = await this.productRepo.getByIds(uniqueProductIds);
    log.debug("Products fetched", { productIds: products.map(p => p.id) });
    console.log("products test");
    
    // Map theo id dạng number để so sánh đúng kiểu
    const productMap = new Map(products.map((p) => [Number(p.id), p]));

    // Kiểm tra chính xác ID nào bị thiếu
    const missingIds = uniqueProductIds.filter((id) => !productMap.has(Number(id)));
    if (missingIds.length > 0) {
      log.warn("Task failed: invalid product id", { missingIds });
      throw Error(`Products not found: ${missingIds.join(", ")}`);
    }
    log.debug("Task validated");

    const employee = await this.employeeRead.getNameById(parsedInput.authId);
    log.debug("Task loaded", {
      employeeId: employee.id,
    });

    for (const item of parsedInput.items) {
      const product = productMap.get(Number(item.productId));
      if (product) {
        product.receiveStock(item.quantity);
      }
    }

    const goodReceipt = GoodReceipt.create(
      parsedInput.authId,
      parsedInput.items
    );

    const save = await this.transactionManager.transaction(async (tx) => {
      const [savedGoodReceipt, savedProducts] = await Promise.all([
        this.goodReceiptRepo.add(goodReceipt, tx),
        this.productRepo.saveMany(products, tx),
      ]);
      return { goodReceipt: savedGoodReceipt, products: savedProducts };
    });
    log.debug("Task saved", {
      goodReceiptId: save.goodReceipt.id,
      productIds: save.products.map((p: any) => p.id),
    });

    log.info("Task completed");
    return outputSchema.parse({
      goodReceiptId: save.goodReceipt.id,
      employeeName: employee.name,
      createdAt: save.goodReceipt.createdAt,
      products: save.products.map((p: any) => ({
        productId: p.id,
        name: p.name,
        amount: p.amount,
      })),
    });
  }
}
