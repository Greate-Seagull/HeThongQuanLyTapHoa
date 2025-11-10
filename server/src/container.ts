import "reflect-metadata";
import { Container } from "inversify";
import { PrismaClient } from "./generated/client";
import { TYPES } from "./types";

import { TransactionManager } from "./infrastructure/repositories/transaction";
import { ProductReadAccessor } from "./infrastructure/read-accessors/product.read-accessor";
import { PromotionRepository } from "./infrastructure/repositories/promotion.repository";
import { CreateInvoiceUsecase } from "./application/create-invoice.usecase";
import { CreatePromotionUsecase } from "./application/create-promotion.usecase";
import { SearchProductsUsecase } from "./application/search-products.usecase";
import { PromotionPricingService } from "./domain/services/promotion-pricing.service";
import { SalesTransactionService } from "./domain/services/sales-transaction.service";
import { EmployeeRepository } from "./infrastructure/repositories/employee.repository";
import { InvoiceRepository } from "./infrastructure/repositories/invoice.repository";
import { ProductRepositoryPostgree } from "./infrastructure/repositories/product.repository.postgree";
import { UserRepository } from "./infrastructure/repositories/user.repository";

const container = new Container({ defaultScope: "Singleton" });

// Core singletons
container.bind(TYPES.PrismaClient).toConstantValue(new PrismaClient());
container
	.bind(TYPES.TransactionManager)
	.to(TransactionManager)
	.inSingletonScope();

// Repositories
container.bind(TYPES.ProductReadAccessor).to(ProductReadAccessor);
container.bind(TYPES.PromotionRepository).to(PromotionRepository);
container.bind(TYPES.EmployeeRepository).to(EmployeeRepository);
container.bind(TYPES.UserRepository).to(UserRepository);
container.bind(TYPES.ProductRepositoryPostgree).to(ProductRepositoryPostgree);
container.bind(TYPES.InvoiceRepository).to(InvoiceRepository);

// Domain services
container.bind(TYPES.PromotionPricingService).to(PromotionPricingService);
container.bind(TYPES.SalesTransactionService).to(SalesTransactionService);

// Usecases
container.bind(TYPES.SearchProductsUsecase).to(SearchProductsUsecase);
container.bind(TYPES.CreatePromotionUsecase).to(CreatePromotionUsecase);
container.bind(TYPES.CreateInvoiceUsecase).to(CreateInvoiceUsecase);

export { container };
