import { SearchProductsUsecase } from "./application/search-products.usecase";
import { ProductRepositoryPostgree } from "./infrastructure/repositories/product.repository.postgree";
import { SearchProductsController } from "./presentation/controllers/search-products.controller";

const productRepository = new ProductRepositoryPostgree();
const searchProductsUsecase = new SearchProductsUsecase(productRepository);
export const searchProductsController = new SearchProductsController(
	searchProductsUsecase
);
