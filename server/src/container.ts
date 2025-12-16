import "reflect-metadata";
import { Container } from "inversify";
import { PrismaClient } from "./generated/client";
import { TYPES } from "./types";

import { PrismaTransactionManager } from "./application/transactions/prisma.transaction";
import { CreatePromotionUsecase } from "./application/services/promotion/create-promotion.usecase";
import { SearchProductsUsecase } from "./application/services/product/search-products.usecase";
import { PromotionPricingService } from "./domain/services/promotion-pricing.service";
import { SalesTransactionService } from "./domain/services/sales-transaction.service";
import { EmployeePrismaRepository } from "./infrastructure/repositories/prisma/employee.prisma.repository";
import { ProductPrismaRepository } from "./infrastructure/repositories/prisma/product.prisma.repository";
import { CreateInvoiceUsecase } from "./application/services/invoice/create-invoice.usecase";
import { ProductPrismaReadAccessor } from "./infrastructure/read-accessors/prisma/product.read-accessor";
import { InvoicePrismaRepository } from "./infrastructure/repositories/prisma/invoice.prisma.repository";
import { PromotionPrismaRepository } from "./infrastructure/repositories/prisma/promotion.prisma.repository";
import { UserPrismaRepository } from "./infrastructure/repositories/prisma/user.prisma.repository";

const container = new Container({ defaultScope: "Singleton" });

// Core singletons
container.bind(TYPES.PrismaClient).toConstantValue(new PrismaClient());
container
	.bind(TYPES.TransactionManager)
	.to(PrismaTransactionManager)
	.inSingletonScope();

// Repositories
container.bind(TYPES.ProductReadAccessor).to(ProductPrismaReadAccessor);
container.bind(TYPES.PromotionRepository).to(PromotionPrismaRepository);
container.bind(TYPES.EmployeeRepository).to(EmployeePrismaRepository);
container.bind(TYPES.UserRepository).to(UserPrismaRepository);
container.bind(TYPES.ProductRepositoryPostgree).to(ProductPrismaRepository);
container.bind(TYPES.InvoiceRepository).to(InvoicePrismaRepository);

// Domain services
container.bind(TYPES.PromotionPricingService).to(PromotionPricingService);
container.bind(TYPES.SalesTransactionService).to(SalesTransactionService);

// Usecases
container.bind(TYPES.SearchProductsUsecase).to(SearchProductsUsecase);
container.bind(TYPES.CreatePromotionUsecase).to(CreatePromotionUsecase);
container.bind(TYPES.CreateInvoiceUsecase).to(CreateInvoiceUsecase);

export { container };
