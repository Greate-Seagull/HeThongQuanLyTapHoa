import { config } from "./config/config";
import { SearchProductsUsecase } from "./application/search-products.usecase";
import { PrismaClient } from "./generated/client";
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
import { StocktakingRepository } from "./infrastructure/repositories/stocktaking.repository";
import { EmployeeReadAccess } from "./infrastructure/read-accessors/employee.read-accessor";
import { ShelfReadAccessor } from "./infrastructure/read-accessors/shelf.read-accessor";
import { ProductReadAccessor } from "./infrastructure/read-accessors/product.read-accessor";
import { AccountRepository } from "./infrastructure/repositories/account.repository";
import { AccountReadAccessor } from "./infrastructure/read-accessors/account.read-accessor";
import { SignUpUsecase } from "./application/sign-up.usecase";
import { Expiry, PasswordService, TokenService } from "./utils/encrypt";
import { SignInUsecase } from "./application/sign-in.usecase";
import { EmployeeAccountRepository } from "./infrastructure/repositories/employee-account.repository";
import { EmployeeAccountReadAccessor } from "./infrastructure/read-accessors/employee-account.read-accessor";
import { CreateAccountUsecase } from "./application/create-account.usecase";

config;
export const prisma = new PrismaClient({
	log: [
		{ level: "query", emit: "event" },
		{ level: "error", emit: "stdout" },
	],
});

const transactionManager = new TransactionManager(prisma);
//Repositories
const employeeRepo = new EmployeeRepository(prisma);
export const employeeAccountRepo = new EmployeeAccountRepository(prisma);
const userRepo = new UserRepository(prisma);
export const accountRepo = new AccountRepository(prisma);
//Read accessors
export const employeeAccountRead = new EmployeeAccountReadAccessor(prisma);
export const accountRead = new AccountReadAccessor(prisma);
//Domain services
export const passwordService = new PasswordService(config.bcrypt.saltRound);
export const tokenService = new TokenService(
	config.jwt.secret,
	config.jwt.expiry as Expiry
);
//Usecases
export const createAccountUsecase = new CreateAccountUsecase(
	employeeAccountRead,
	passwordService,
	employeeAccountRepo,
	employeeRepo,
	transactionManager
);
export const signInUsecase = new SignInUsecase(
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
