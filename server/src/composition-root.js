import { SearchProductsController } from './presentation_layer/controllers/search-products.controller.js';
import { SearchProductsUseCase } from './application_layer/search-products.usecase.js';
import { ProductRepositoryPostgree } from './infrastructure_layer/repositories/product.repository.postgree.js';

const productRepository = new ProductRepositoryPostgree({});
const searchProductsUsecase = new SearchProductsUseCase(productRepository);
export const searchProductsController = new SearchProductsController(searchProductsUsecase);