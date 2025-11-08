import { config } from "./config/config";
import { SearchProductsUsecase } from "./application/search-products.usecase";
import { PrismaClient } from "./generated/client";
import { ProductReadAccessor } from "./infrastructure/read_accessors/product.read-accessor";
import { CreatePromotionUsecase } from "./application/create-promotion.usecase";
import { PromotionRepository } from "./infrastructure/repositories/promotion.repository";
import { PromotionPricingService } from "./domain/promotion-pricing.service";
import { EmployeeRepository } from "./infrastructure/repositories/employee.repository";
import { CreateInvoiceUsecase } from "./application/create-invoice.usecase";
import { UserRepository } from "./infrastructure/repositories/user.repository";
import { ProductRepositoryPostgree } from "./infrastructure/repositories/product.repository.postgree";
import { InvoiceRepository } from "./infrastructure/repositories/invoice.repository";
import { TransactionManager } from "./infrastructure/repositories/transaction";
import { SalesTransactionService } from "./domain/sales-transaction.service";
import { CreateGoodReceiptUsecase } from "./application/create-good-receipt.usecase";
import { GoodReceiptRepository } from "./infrastructure/repositories/good-receipt.repository";
import { UpdateProdutsUsecase } from "./application/update-products.usecase";
import { GetProductsUsecase } from "./application/get-products.usecase";
import { CreateStocktakingUsecase } from "./application/create-stocktaking.usecase";
import { EmployeeReadAccess } from "./infrastructure/read_accessors/employee.read-accessor";
import { ShelfReadAccessor } from "./infrastructure/read_accessors/shelf.read-accessor";
import { StocktakingRepository } from "./infrastructure/repositories/stocktaking.repository";

config;
export const prisma = new PrismaClient({
	log: [
		{ level: "query", emit: "event" },
		{ level: "error", emit: "stdout" },
	],
});

const transactionManager = new TransactionManager(prisma);

const productReadAccessor = new ProductReadAccessor(prisma);
const promotionRepo = new PromotionRepository(prisma);
const employeeRepo = new EmployeeRepository(prisma);
const userRepo = new UserRepository(prisma);
const productRepo = new ProductRepositoryPostgree(prisma);
export const invoiceRepo = new InvoiceRepository(prisma);
const goodReceiptRepo = new GoodReceiptRepository(prisma);
const employeeReadAccessor = new EmployeeReadAccess(prisma);
const shelfReadAccessor = new ShelfReadAccessor(prisma);
const stocktakingRepo = new StocktakingRepository(prisma);

const promoPricing = new PromotionPricingService();
const processSales = new SalesTransactionService();

export const searchProductsUsecase = new SearchProductsUsecase(
	productReadAccessor,
	promotionRepo,
	promoPricing
);
export const createPromotionUsecase = new CreatePromotionUsecase(
	productReadAccessor,
	promotionRepo
);
export const createInvoiceUsecase = new CreateInvoiceUsecase(
	employeeRepo,
	userRepo,
	productRepo,
	promotionRepo,
	invoiceRepo,
	processSales,
	transactionManager
);
export const createGoodReceiptUsecase = new CreateGoodReceiptUsecase(
	employeeRepo,
	productRepo,
	goodReceiptRepo,
	transactionManager
);
export const updateProductsUsecase = new UpdateProdutsUsecase(
	productRepo,
	transactionManager
);
export const getProductsUsecase = new GetProductsUsecase(productReadAccessor);
export const createStocktakingUsecase = new CreateStocktakingUsecase(
	employeeReadAccessor,
	productReadAccessor,
	shelfReadAccessor,
	stocktakingRepo
);
