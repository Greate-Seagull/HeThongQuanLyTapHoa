import { GetEmployeeAccountProfileUsecase } from "./application/employee-account/get-employee-account-profile.usecase";
import { GetMyAccountUsecase } from "./application/customer-account/get-my-account.usecase";

import { config } from "./config/config";
import { SearchProductsUsecase } from "./application/product/search-products.usecase";
import { PrismaClient } from "./generated/client";
import { CreatePromotionUsecase } from "./application/promotion/create-promotion.usecase";
import { PromotionRepository } from "./infrastructure/repositories/promotion.repository";
import { PromotionPricingService } from "./domain/services/promotion-pricing.service";
import { GetPromotionsUsecase } from "./application/promotion/get-promotions.usecase";
import { PromotionReadAccessor } from "./infrastructure/read-accessors/promotion.read-accessor";
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
import { UpdateEmployeeAccountUsecase } from "./application/employee-account/update-employee-account.usecase";
import { GetEmployeeAccountsUsecase } from "./application/employee-account/get-employee-accounts.usecase";
import { CreateInvoiceUsecase } from "./application/invoice/create-invoice.usecase";
import { SignInUsecase } from "./application/customer-account/sign-in.usecase";
import { SignUpUsecase } from "./application/customer-account/sign-up.usecase";
import { CreateGoodReceiptUsecase } from "./application/good-receipt/create-good-receipt.usecase";
import { CreateStocktakingUsecase } from "./application/stocktaking/create-stocktaking.usecase";
import { EmployeeReadAccess } from "./infrastructure/read-accessors/employee.read-accessor";
import { SupplierRepository } from "./infrastructure/repositories/supplier.repository";
import { GetAccountsUsecase } from "./application/customer-account/get-accounts.usecase";
import { SupplierReadAccessor } from "./infrastructure/read-accessors/supplier.read-accessor";
import { ProductCategoryRepository } from "./infrastructure/repositories/product-category.repository";
import { ProductCategoryReadAccessor } from "./infrastructure/read-accessors/product-category.read-accessor";
import { GetSuppliersUsecase } from "./application/supplier/get-suppliers.usecase";
import { CreateSupplierUsecase } from "./application/supplier/create-supplier.usecase";
import { UpdateSupplierUsecase } from "./application/supplier/update-supplier.usecase";
import { DeleteSupplierUsecase } from "./application/supplier/delete-supplier.usecase";
import { GetProductCategoriesUsecase } from "./application/product-category/get-product-categories.usecase";
import { CreateProductCategoryUsecase } from "./application/product-category/create-product-category.usecase";
import { UpdateProductCategoryUsecase } from "./application/product-category/update-product-category.usecase";
import { DeleteProductCategoryUsecase } from "./application/product-category/delete-product-category.usecase";
import { ReportReadAccessor } from "./infrastructure/read-accessors/report.read-accessor";
import { GetInventoryReportUsecase } from "./application/get-inventory-report.usecase";
import { GetGoodsReceiptReportUsecase } from "./application/get-goods-receipt-report.usecase";
import { GetSalesReportUsecase } from "./application/get-sales-report.usecase";
import { GetCustomerReportUsecase } from "./application/get-customer-report.usecase";
import { GetStocktakingReportUsecase } from "./application/get-stocktaking-report.usecase";
import { GetRevenueProfitReportUsecase } from "./application/get-revenue-profit-report.usecase";
import { GetShelvesUsecase } from "./application/shelf/get-shelves.usecase";
import { InvoiceReadAccessor } from "./infrastructure/read-accessors/invoice.read-accessor";
import { GetMyInvoicesUsecase } from "./application/invoice/get-my-invoices.usecase";

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
export const updateEmployeeAccountUsecase = new UpdateEmployeeAccountUsecase(
  employeeAccountRepo,
  employeeAccountRead,
  employeeRepo,
  employeeReadAccessor
);

export const getEmployeeAccountProfileUsecase =
  new GetEmployeeAccountProfileUsecase(
    employeeAccountRepo,
    employeeRepo,
    employeeReadAccessor
  );
export const getEmployeeAccountsUsecase = new GetEmployeeAccountsUsecase(
  employeeAccountRead
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
export const getAccountsUsecase = new GetAccountsUsecase(accountRead);
//---------------------------------------------------------
const productReadAccessor = new ProductReadAccessor(prisma);
const promotionRepo = new PromotionRepository(prisma);
const promotionReadAccessor = new PromotionReadAccessor(prisma);
export const productRepo = new ProductRepositoryPrisma(prisma);
export const invoiceRepo = new InvoiceRepository(prisma);
export const goodReceiptRepo = new GoodReceiptRepository(prisma);
const shelfReadAccessor = new ShelfReadAccessor(prisma);
const stocktakingRepo = new StocktakingRepository(prisma);
const supplierRepo = new SupplierRepository(prisma);
const supplierReadAccessor = new SupplierReadAccessor(prisma);
const productCategoryRepo = new ProductCategoryRepository(prisma);
const productCategoryReadAccessor = new ProductCategoryReadAccessor(prisma);
const reportReadAccessor = new ReportReadAccessor(prisma);
const invoiceReadAccessor = new InvoiceReadAccessor(prisma);

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
export const getPromotionsUsecase = new GetPromotionsUsecase(
  promotionReadAccessor
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
export const getShelvesUsecase = new GetShelvesUsecase(shelfReadAccessor);
export const getMyInvoicesUsecase = new GetMyInvoicesUsecase(invoiceReadAccessor);

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
export const getMyAccountUsecase = new GetMyAccountUsecase(accountRead);
