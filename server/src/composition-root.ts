import { config } from "./config/config";
import { PrismaClient } from "./generated/client";

import { PrismaTransactionManager } from "./application/transactions/prisma.transaction";

import { userDtoSchema } from "./application/DTOs/user.dto";
import { accountDtoSchema } from "./application/DTOs/account.dto";
import { employeeDtoSchema } from "./application/DTOs/employee.dto";
import { employeeAccountDtoSchema } from "./application/DTOs/employee-account.dto";
import { promotionDtoSchema } from "./application/DTOs/promotion.dto";
import { goodReceiptDtoSchema } from "./application/DTOs/good-receipt.dto";
import { stocktakingDtoSchema } from "./application/DTOs/stocktaking.dto";
import { productDtoSchema } from "./application/DTOs/product.dto";
import { invoiceDtoSchema } from "./application/DTOs/invoice.dto";

import { PromotionPrismaRepository } from "./infrastructure/repositories/prisma/promotion.prisma.repository";
import { ProductPrismaRepository } from "./infrastructure/repositories/prisma/product.prisma.repository";
import { InvoicePrismaRepository } from "./infrastructure/repositories/prisma/invoice.prisma.repository";
import { GoodReceiptPrismaRepository } from "./infrastructure/repositories/prisma/good-receipt.prisma.repository";
import { StocktakingPrismaRepository } from "./infrastructure/repositories/prisma/stocktaking.prisma.repository";
import { SupplierRepository } from "./infrastructure/repositories/supplier.repository";
import { ProductCategoryRepository } from "./infrastructure/repositories/product-category.repository";
import { UserPrismaRepository } from "./infrastructure/repositories/prisma/user.prisma.repository";
import { AccountPrismaRepository } from "./infrastructure/repositories/prisma/account.prisma.repository";
import { EmployeeAccountPrismaRepository } from "./infrastructure/repositories/prisma/employee-account.prisma.repository";
import { EmployeePrismaRepository } from "./infrastructure/repositories/prisma/employee.prisma.repository";

import { EmployeePrismaReadAccessor } from "./infrastructure/read-accessors/prisma/employee.read-accessor";
import { AccountPrismaReadAccessor } from "./infrastructure/read-accessors/prisma/account.read-accessor";
import { EmployeeAccountPrismaReadAccessor } from "./infrastructure/read-accessors/prisma/employee-account.read-accessor";
import { ProductCategoryReadAccessor } from "./infrastructure/read-accessors/prisma/product-category.read-accessor";
import { ProductPrismaReadAccessor } from "./infrastructure/read-accessors/prisma/product.read-accessor";
import { ReportReadAccessor } from "./infrastructure/read-accessors/prisma/report.read-accessor";
import { ShelfPrismaReadAccessor } from "./infrastructure/read-accessors/prisma/shelf.read-accessor";
import { SupplierReadAccessor } from "./infrastructure/read-accessors/prisma/supplier.read-accessor";

import {
	Expiry,
	PasswordService,
	TokenService,
} from "./domain/services/encrypt.service";
import { SalesTransactionService } from "./domain/services/sales-transaction.service";
import { PromotionPricingService } from "./domain/services/promotion-pricing.service";

import { SignUpUsecase } from "./application/services/customer-account/sign-up.usecase";
import { GetProductsUsecase } from "./application/services/product/get-products.usecase";
import { UpdateProdutsUsecase } from "./application/services/product/update-products.usecase";
import { SignInUsecase } from "./application/services/customer-account/sign-in.usecase";
import { CreateAccountUsecase } from "./application/services/employee-account/create-account.usecase";
import { UseAccountUsecase } from "./application/services/employee-account/use-account.usecase";
import { CreateInvoiceUsecase } from "./application/services/invoice/create-invoice.usecase";
import { CreateGoodReceiptUsecase } from "./application/services/good-receipt/create-good-receipt.usecase";
import { CreateStocktakingUsecase } from "./application/services/stocktaking/create-stocktaking.usecase";
import { GetSuppliersUsecase } from "./application/services/supplier/get-suppliers.usecase";
import { CreateSupplierUsecase } from "./application/services/supplier/create-supplier.usecase";
import { UpdateSupplierUsecase } from "./application/services/supplier/update-supplier.usecase";
import { DeleteSupplierUsecase } from "./application/services/supplier/delete-supplier.usecase";
import { GetProductCategoriesUsecase } from "./application/services/product-category/get-product-categories.usecase";
import { CreateProductCategoryUsecase } from "./application/services/product-category/create-product-category.usecase";
import { UpdateProductCategoryUsecase } from "./application/services/product-category/update-product-category.usecase";
import { DeleteProductCategoryUsecase } from "./application/services/product-category/delete-product-category.usecase";
import { GetInventoryReportUsecase } from "./application/services/report/get-inventory-report.usecase";
import { GetGoodsReceiptReportUsecase } from "./application/services/report/get-goods-receipt-report.usecase";
import { GetSalesReportUsecase } from "./application/services/report/get-sales-report.usecase";
import { GetCustomerReportUsecase } from "./application/services/report/get-customer-report.usecase";
import { GetStocktakingReportUsecase } from "./application/services/report/get-stocktaking-report.usecase";
import { GetRevenueProfitReportUsecase } from "./application/services/report/get-revenue-profit-report.usecase";
import { SearchProductsUsecase } from "./application/services/product/search-products.usecase";
import { CreatePromotionUsecase } from "./application/services/promotion/create-promotion.usecase";
import { GetStocktakingsUsecase } from "./application/services/stocktaking/get-stocktakings.usecase";
import { ApplyStocktakingUsecase } from "./application/services/stocktaking/apply-stocktaking.usecase";
import { GetShelvesUsecase } from "./application/services/shelf/get-shelves.usecase";

config;
export const prisma = new PrismaClient({
	log: [
		{ level: "query", emit: "event" },
		{ level: "error", emit: "stdout" },
	],
});

const transactionManager = new PrismaTransactionManager(prisma);

//Repositories
export const employeeRepo = new EmployeePrismaRepository(
	prisma,
	employeeDtoSchema
);
export const employeeAccountRepo = new EmployeeAccountPrismaRepository(
	prisma,
	employeeAccountDtoSchema
);
export const userRepo = new UserPrismaRepository(prisma, userDtoSchema);
export const accountRepo = new AccountPrismaRepository(
	prisma,
	accountDtoSchema
);
const promotionRepo = new PromotionPrismaRepository(prisma, promotionDtoSchema);
export const productRepo = new ProductPrismaRepository(
	prisma,
	productDtoSchema
);
export const invoiceRepo = new InvoicePrismaRepository(
	prisma,
	invoiceDtoSchema
);
export const goodReceiptRepo = new GoodReceiptPrismaRepository(
	prisma,
	goodReceiptDtoSchema
);
const stocktakingRepo = new StocktakingPrismaRepository(
	prisma,
	stocktakingDtoSchema
);
const supplierRepo = new SupplierRepository(prisma);
const productCategoryRepo = new ProductCategoryRepository(prisma);

//Read accessors
export const employeeReadAccessor = new EmployeePrismaReadAccessor(prisma);
export const employeeAccountRead = new EmployeeAccountPrismaReadAccessor(
	prisma
);
export const accountRead = new AccountPrismaReadAccessor(prisma);
const productReadAccessor = new ProductPrismaReadAccessor(prisma);
const shelfReadAccessor = new ShelfPrismaReadAccessor(prisma);
const productCategoryReadAccessor = new ProductCategoryReadAccessor(prisma);
const supplierReadAccessor = new SupplierReadAccessor(prisma);
const reportReadAccessor = new ReportReadAccessor(prisma);

//Domain services
export const passwordService = new PasswordService(config.bcrypt.saltRound);
export const tokenService = new TokenService(
	config.jwt.secret,
	config.jwt.expiry as Expiry
);
const promoPricing = new PromotionPricingService();
const processSales = new SalesTransactionService();

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

export const searchProductsUsecase = new SearchProductsUsecase(
	productReadAccessor,
	promotionRepo,
	promoPricing
);
export const updateProductsUsecase = new UpdateProdutsUsecase(
	productRepo,
	transactionManager
);
export const getProductsUsecase = new GetProductsUsecase(productReadAccessor);

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
export const createStocktakingUsecase = new CreateStocktakingUsecase(
	productReadAccessor,
	shelfReadAccessor,
	stocktakingRepo
);

// Supplier usecases
export const getSuppliersUsecase = new GetSuppliersUsecase(
	supplierReadAccessor
);
export const createSupplierUsecase = new CreateSupplierUsecase(supplierRepo);
export const updateSupplierUsecase = new UpdateSupplierUsecase(supplierRepo);
export const deleteSupplierUsecase = new DeleteSupplierUsecase(supplierRepo);

// Product Category usecases
export const getProductCategoriesUsecase = new GetProductCategoriesUsecase(
	productCategoryReadAccessor
);
export const createProductCategoryUsecase = new CreateProductCategoryUsecase(
	productCategoryRepo
);
export const updateProductCategoryUsecase = new UpdateProductCategoryUsecase(
	productCategoryRepo
);
export const deleteProductCategoryUsecase = new DeleteProductCategoryUsecase(
	productCategoryRepo
);

// Report usecases
export const getInventoryReportUsecase = new GetInventoryReportUsecase(
	reportReadAccessor
);
export const getGoodsReceiptReportUsecase = new GetGoodsReceiptReportUsecase(
	reportReadAccessor
);
export const getSalesReportUsecase = new GetSalesReportUsecase(
	reportReadAccessor
);
export const getCustomerReportUsecase = new GetCustomerReportUsecase(
	reportReadAccessor
);
export const getStocktakingReportUsecase = new GetStocktakingReportUsecase(
	reportReadAccessor
);
export const getRevenueProfitReportUsecase = new GetRevenueProfitReportUsecase(
	reportReadAccessor
);

// Stocktaking use cases
const stocktakingRepository = new StocktakingPrismaRepository(
	prisma,
	stocktakingDtoSchema
);

export const getStocktakingsUsecase = new GetStocktakingsUsecase(
	stocktakingRepository
);

export const applyStocktakingUsecase = new ApplyStocktakingUsecase(
	stocktakingRepository,
	productRepo
);

export const getShelvesUsecase = new GetShelvesUsecase(shelfReadAccessor);
