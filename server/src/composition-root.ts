import { config } from "./config/config";
import { SearchProductsUsecase } from "./application/product/search-products.usecase";
import { PrismaClient } from "./generated/client";
import { CreatePromotionUsecase } from "./application/promotion/create-promotion.usecase";
import { PromotionRepository } from "./infrastructure/repositories/promotion.repository";
import { PromotionPricingService } from "./domain/services/promotion-pricing.service";
import { EmployeeRepository } from "./infrastructure/repositories/employee.repository";
import { UserRepository } from "./infrastructure/repositories/user.repository";
import { ProductRepositoryPrisma } from "./infrastructure/repositories/product.repository.prisma";
import { InvoiceRepository } from "./infrastructure/repositories/invoice.repository";
import { PrismaTransactionManager } from "./infrastructure/transaction";
import { SalesTransactionService } from "./domain/services/sales-transaction.service";
import { GoodReceiptRepository } from "./infrastructure/repositories/good-receipt.repository";
import { UpdateProdutsUsecase } from "./application/product/update-products.usecase";
import { GetProductsUsecase } from "./application/product/get-products.usecase";
import { StocktakingRepository } from "./infrastructure/repositories/stocktaking.repository";
import { ShelfReadAccessor } from "./infrastructure/read-accessors/shelf.read-accessor";
import { ProductReadAccessor } from "./infrastructure/read-accessors/product.read-accessor";
import { AccountRepository } from "./infrastructure/repositories/account.repository";
import { AccountReadAccessor } from "./infrastructure/read-accessors/account.read-accessor";
import {
	Expiry,
	PasswordService,
	TokenService,
} from "./domain/services/encrypt.service";
import { EmployeeAccountRepository } from "./infrastructure/repositories/employee-account.repository";
import { EmployeeAccountReadAccessor } from "./infrastructure/read-accessors/employee-account.read-accessor";
import { CreateAccountUsecase } from "./application/employee-account/create-account.usecase";
import { UseAccountUsecase } from "./application/employee-account/use-account.usecase";
import { CreateInvoiceUsecase } from "./application/invoice/create-invoice.usecase";
import { SignInUsecase } from "./application/customer-account/sign-in.usecase";
import { SignUpUsecase } from "./application/customer-account/sign-up.usecase";
import { CreateGoodReceiptUsecase } from "./application/good-receipt/create-good-receipt.usecase";
import { CreateStocktakingUsecase } from "./application/stocktaking/create-stocktaking.usecase";
import { EmployeeReadAccess } from "./infrastructure/read-accessors/employee.read-accessor";

config;
export const prisma = new PrismaClient({
	log: [
		{ level: "query", emit: "event" },
		{ level: "error", emit: "stdout" },
	],
});

const transactionManager = new PrismaTransactionManager(prisma);
//Repositories
export const employeeRepo = new EmployeeRepository(prisma);
export const employeeAccountRepo = new EmployeeAccountRepository(prisma);
const userRepo = new UserRepository(prisma);
export const accountRepo = new AccountRepository(prisma);
//Read accessors
export const employeeReadAccessor = new EmployeeReadAccess(prisma);
export const employeeAccountRead = new EmployeeAccountReadAccessor(prisma);
export const accountRead = new AccountReadAccessor(prisma);
//Domain services
export const passwordService = new PasswordService(config.bcrypt.saltRound);
export const tokenService = new TokenService(
	config.jwt.secret,
	config.jwt.expiry as Expiry
);
//Usecases
export const useAccountUsecase = new UseAccountUsecase(
	employeeAccountRepo,
	employeeReadAccessor,
	passwordService,
	tokenService
);
export const createAccountUsecase = new CreateAccountUsecase(
	employeeAccountRead,
	passwordService,
	employeeAccountRepo,
	employeeRepo,
	transactionManager
);
export const signInUsecase = new SignInUsecase(
	userRepo,
	accountRepo,
	passwordService,
	tokenService
);
export const signUpUsecase = new SignUpUsecase(
	accountRead,
	userRepo,
	accountRepo,
	transactionManager,
	passwordService,
	tokenService
);
//---------------------------------------------------------
const productReadAccessor = new ProductReadAccessor(prisma);
const promotionRepo = new PromotionRepository(prisma);
export const productRepo = new ProductRepositoryPrisma(prisma);
export const invoiceRepo = new InvoiceRepository(prisma);
export const goodReceiptRepo = new GoodReceiptRepository(prisma);
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
	employeeReadAccessor,
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
	productReadAccessor,
	shelfReadAccessor,
	stocktakingRepo
);
