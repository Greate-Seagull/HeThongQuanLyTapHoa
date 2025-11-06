import { config } from "./config/config";
import { SearchProductsUsecase } from "./application/search-products.usecase";
import { PrismaClient } from "./generated/client";
import { ProductReadAccessor } from "./infrastructure/read_accessors/product.read-accessor";
import { CreatePromotionUsecase } from "./application/create-promotion.usecase";
import { PromotionRepository } from "./infrastructure/repositories/promotion.repository";
import { PromotionPricingService } from "./domain/promotion-pricing.service";

config;
export const prisma = new PrismaClient();

const productReadAccessor = new ProductReadAccessor(prisma);
const promotionRepo = new PromotionRepository(prisma);

const promoPricing = new PromotionPricingService();

export const searchProductsUsecase = new SearchProductsUsecase(
	productReadAccessor,
	promotionRepo,
	promoPricing
);
export const createPromotionUsecase = new CreatePromotionUsecase(
	productReadAccessor,
	promotionRepo
);
