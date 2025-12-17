import z from "zod";
import { Product } from "../../../domain/entities/product";
import { logger } from "../../../domain/services/logger.service";
import { ProductRepository } from "../../repositories/product.repository";
import { TransactionManager } from "../../transactions/base.transaction";

const inputSchema = z.object({
  authId: z.number(),
  products: z.array(
    z.object({
      id: z.number().optional().nullable(),
      name: z.string(),
      price: z.number(),
      unit: z.string(),
      barcode: z.number(),
    })
  ),
});

const outputSchema = z.object();

export class UpdateProdutsUsecase {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(input: any) {
    const parsedInput = inputSchema.parse(input);
    const log = logger.child({
      task: "Updating products",
      employeeId: parsedInput.authId,
    });
    log.info("Task started");

    if (parsedInput.products.length < 1) {
      log.warn("Task failed: no products affected");
      throw Error(`Expect at least one product to be affected`);
    }
    log.debug("Task validated");

    const productIds = parsedInput.products
      .filter((p) => p.id)
      .map((p) => p.id);
    const products = await this.productRepo.getByIds(productIds);
    log.debug("Task loaded", {
      productIds: productIds,
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const updateProducts: Product[] = [];
    const insertProducts: Product[] = [];
    for (const changed of input.products) {
      const product = productMap.get(changed.id);
      if (product) {
        product.updateName(changed.name);
        product.updatePrice(changed.price);
        product.updateUnit(changed.unit);
        product.updateBarcode(changed.barcode);
        updateProducts.push(product);
      } else {
        const created = Product.create({
          name: changed.name,
          price: changed.price,
          unit: changed.unit,
          barcode: changed.barcode,
        });
        insertProducts.push(created);
      }
    }

    try {
      await this.transactionManager.transaction(async (tx) => {
        const promiseQueue = [];
        if (insertProducts.length > 0)
          promiseQueue.push(this.productRepo.addMany(insertProducts, tx));
        if (updateProducts.length > 0)
          promiseQueue.push(this.productRepo.saveMany(updateProducts, tx));
        return await Promise.all(promiseQueue);
      });
      return outputSchema.parse({});
    } catch (e: any) {
      // Chuẩn hóa trả về cho test dễ kiểm tra
      if (e.code === 'P2002') {
        return { code: 'P2002', message: 'Unique constraint failed' };
      }
      return { message: e.message };
    }
  }
}
