import { logger } from "../../../domain/services/logger.service";
import { ProductReadAccessor } from "../read-accessors/product.read-accessor";

export class GetProductsUsecase {
  constructor(private readonly productReadAccessor: ProductReadAccessor) {}

  async execute() {
    console.log('\n📦 GetProductsUsecase.execute()');
    const log = logger.child({ task: "Get products" });
    log.info("Task started");
    
    const products = await this.productReadAccessor.getProducts();
    
    console.log(`✅ Returning ${products.length} products`);
    
    log.info("Task completed", { count: products.length });
    
    // ✅ CRITICAL: Return { products: [] } format (NOT { data: [] })
    return { products };
  }
}
