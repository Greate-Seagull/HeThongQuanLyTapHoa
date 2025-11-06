import "dotenv/config";
import { SearchProductsUsecase } from "./application/search-products.usecase";
import { PrismaClient } from "./generated/client";
import { ProductReadAccessor } from "./infrastructure/read_accessors/product.read-accessor";
import { CreatePromotionUsecase } from "./application/create-promotion.usecase";
import { PromotionRepository } from "./infrastructure/repositories/promotion.repository";

export const prisma = new PrismaClient();

const productReadAccessor = new ProductReadAccessor(prisma);
const promotionRepo = new PromotionRepository(prisma);

export const searchProductsUsecase = new SearchProductsUsecase(
	productReadAccessor
);
export const createPromotionUsecase = new CreatePromotionUsecase(
	productReadAccessor,
	promotionRepo
);
