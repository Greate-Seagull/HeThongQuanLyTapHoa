import { buildCreateEmployeeWithAccountUsecase } from "./application/services/employee/build-create-employee-with-account.usecase";

// Export sau khi đã khai báo các biến phụ thuộc

// Đặt export này xuống cuối file để tránh lỗi hoisting
import { ListSlotWithProductUsecase } from "./application/services/slot/list-slot-with-product.usecase";
import { SlotDetailRepository } from "./infrastructure/repositories/slot-detail.repository";
import { SlotDetailUsecase } from "./application/services/slot/slot-detail.usecase";
import { ChangeManagerPasswordUsecase } from "./application/services/employee-account/change-manager-password.usecase";
import { ChangeCustomerPasswordUsecase } from "./application/services/customer-account/change-customer-password.usecase";
import { config } from "./config/config";
import { PrismaClient } from "./generated/client";
import { PrismaTransactionManager } from "./infrastructure/transaction";
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

import { EmployeeReadAccess } from "./infrastructure/read-accessors/prisma/employee.read-accessor";
import { AccountReadAccessor } from "./infrastructure/read-accessors/prisma/account.read-accessor";
import { EmployeeAccountReadAccessor } from "./infrastructure/read-accessors/prisma/employee-account.read-accessor";
import { ProductCategoryReadAccessor } from "./infrastructure/read-accessors/prisma/product-category.read-accessor";
import { ProductPrismaReadAccessor } from "./infrastructure/read-accessors/prisma/product.read-accessor";
import { ReportReadAccessor } from "./infrastructure/read-accessors/prisma/report.read-accessor";
import { ShelfReadAccessor } from "./infrastructure/read-accessors/prisma/shelf.read-accessor";

import { SupplierReadAccessor } from "./infrastructure/read-accessors/prisma/supplier.read-accessor";

import {
  Expiry,
  PasswordService,
  TokenService,
} from "./domain/services/encrypt.service";
import { GetMyInvoicesUsecase } from "./application/services/invoice/get-my-invoices.usecase";

import { GetPromotionsUsecase } from "./application/services/promotion/get-promotions.usecase";
import { UpdatePromotionUsecase } from "./application/services/promotion/update-promotion.usecase";
import { DeletePromotionUsecase } from "./application/services/promotion/delete-promotion.usecase";
import { CreateSlotUsecase } from "./application/services/slot/create-slot.usecase";
import { UpdateSlotUsecase } from "./application/services/slot/update-slot.usecase";
import { DeleteSlotUsecase } from "./application/services/slot/delete-slot.usecase";
import { CreateRackUsecase } from "./application/services/rack/create-rack.usecase";
import { UpdateRackUsecase } from "./application/services/rack/update-rack.usecase";
import { DeleteRackUsecase } from "./application/services/rack/delete-rack.usecase";
import { CreateShelfUsecase } from "./application/services/shelf/create-shelf.usecase";
import { UpdateShelfUsecase } from "./application/services/shelf/update-shelf.usecase";
import { DeleteShelfUsecase } from "./application/services/shelf/delete-shelf.usecase";
import { GetShelvesUsecase } from "./application/services/shelf/get-shelves.usecase";
import { SalesTransactionService } from "./domain/services/sales-transaction.service";
import { PromotionPricingService } from "./domain/services/promotion-pricing.service";
import { CreateAccountUsecase } from "./application/services/employee-account/create-account.usecase";
import { UseAccountUsecase } from "./application/services/employee-account/use-account.usecase";
import { UpdateEmployeeAccountUsecase } from "./application/services/employee-account/update-employee-account.usecase";
import { DeleteEmployeeAccountUsecase } from "./application/services/employee-account/delete-employee-account.usecase";
import { GetEmployeeAccountsUsecase } from "./application/services/employee-account/get-employee-accounts.usecase";
import { SignUpUsecase } from "./application/services/customer-account/sign-up.usecase";
import { GetProductsUsecase } from "./application/services/product/get-products.usecase";
import { UpdateProdutsUsecase } from "./application/services/product/update-products.usecase";
import { SignInUsecase } from "./application/services/customer-account/sign-in.usecase";
import { GetMyAccountUsecase } from "./application/services/customer-account/get-my-account.usecase";
import { GetAccountsUsecase } from "./application/services/customer-account/get-accounts.usecase";
import { CreateCustomerAccountUsecase } from "./application/services/customer-account/create-customer-account.usecase";
import { UpdateCustomerAccountUsecase } from "./application/services/customer-account/update-customer-account.usecase";
import { DeleteCustomerAccountUsecase } from "./application/services/customer-account/delete-customer-account.usecase";
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
import { CreateProductUsecase } from "./application/services/product/create-product.usecase";
import { UpdateProductUsecase } from "./application/services/product/update-product.usecase";
import { DeleteProductUsecase } from "./application/services/product/delete-product.usecase";
import { ProductRepositoryPrisma } from "./infrastructure/repositories/product.repository.prisma";
import { GetEmployeeAccountProfileUsecase } from "./application/services/employee-account/get-employee-account-profile.usecase";
import { EmployeeAccountRepository } from "./infrastructure/repositories/employee-account.repository";
import { EmployeeRepository } from "./infrastructure/repositories/employee.repository";
import { ShelfRepository } from "./infrastructure/repositories/shelf.repository";
import { RackRepository } from "./infrastructure/repositories/rack.repository";
import { SlotRepository } from "./infrastructure/repositories/slot.repository";
import { PromotionReadAccessor } from "./infrastructure/read-accessors/prisma/promotion.read-accessor";
import { InvoiceReadAccessor } from "./infrastructure/read-accessors/prisma/invoice.read-accessor";
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

export const productRepo1 = new ProductRepositoryPrisma(prisma);

export const invoiceRepo = new InvoicePrismaRepository(
  prisma,
  invoiceDtoSchema
);
export const goodReceiptRepo = new GoodReceiptPrismaRepository(
  prisma,
  goodReceiptDtoSchema
);
export const employeeAccountRepo = new EmployeeAccountRepository(prisma);

const stocktakingRepo = new StocktakingPrismaRepository(
  prisma,
  stocktakingDtoSchema
);
const supplierRepo = new SupplierRepository(prisma);
const productCategoryRepo = new ProductCategoryRepository(prisma);
const promotionReadAccessor = new PromotionReadAccessor(prisma);

//Read accessors
export const employeeReadAccessor = new EmployeeReadAccess(prisma);
export const employeeAccountRead = new EmployeeAccountReadAccessor(prisma);

export const accountRead = new AccountReadAccessor(prisma);
const productReadAccessor = new ProductPrismaReadAccessor(prisma);
const shelfReadAccessor = new ShelfReadAccessor(prisma);
const productCategoryReadAccessor = new ProductCategoryReadAccessor(prisma);
const supplierReadAccessor = new SupplierReadAccessor(prisma);
const reportReadAccessor = new ReportReadAccessor(prisma);
const shelfRepo = new ShelfRepository(prisma);
const rackRepo = new RackRepository(prisma);
const slotRepo = new SlotRepository(prisma);
// Removed duplicate slotDetailRepo and slotDetailUsecase declarations (already declared above)
const invoiceReadAccessor = new InvoiceReadAccessor(prisma);

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
export const getPromotionsUsecase = new GetPromotionsUsecase(
  promotionReadAccessor
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
export const deleteEmployeeAccountUsecase = new DeleteEmployeeAccountUsecase(
  employeeAccountRepo,
  employeeRepo,
  transactionManager
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
export const createProductUsecase = new CreateProductUsecase(
  productRepo1,
  productCategoryReadAccessor,
  supplierReadAccessor
);
export const updateProductUsecase = new UpdateProductUsecase(
  productRepo1,
  productCategoryReadAccessor,
  supplierReadAccessor
);
export const deleteProductUsecase = new DeleteProductUsecase(productRepo1);
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
export const getMyAccountUsecase = new GetMyAccountUsecase(accountRead);
export const getAccountsUsecase = new GetAccountsUsecase(accountRead);
export const createCustomerAccountUsecase = new CreateCustomerAccountUsecase(
  accountRepo,
  userRepo,
  passwordService,
  transactionManager
);
export const updateCustomerAccountUsecase = new UpdateCustomerAccountUsecase(
  accountRepo,
  userRepo,
  transactionManager
);
export const deleteCustomerAccountUsecase = new DeleteCustomerAccountUsecase(
  accountRepo,
  userRepo,
  transactionManager
);
export const createShelfUsecase = new CreateShelfUsecase(shelfRepo);
export const updateShelfUsecase = new UpdateShelfUsecase(shelfRepo);
export const deleteShelfUsecase = new DeleteShelfUsecase(shelfRepo);
export const getShelvesUsecase = new GetShelvesUsecase(shelfReadAccessor);
export const createRackUsecase = new CreateRackUsecase(rackRepo, shelfRepo);
export const updateRackUsecase = new UpdateRackUsecase(rackRepo);
export const deleteRackUsecase = new DeleteRackUsecase(rackRepo);

const slotDetailRepo = new SlotDetailRepository(prisma);
const slotDetailUsecase = new SlotDetailUsecase(slotDetailRepo);
export const createSlotUsecase = new CreateSlotUsecase(slotRepo, rackRepo, slotDetailUsecase);
export const updateSlotUsecase = new UpdateSlotUsecase(slotRepo, slotDetailUsecase);
export const listSlotWithProductUsecase = new ListSlotWithProductUsecase(slotDetailUsecase);
export const deleteSlotUsecase = new DeleteSlotUsecase(slotRepo);
export const updatePromotionUsecase = new UpdatePromotionUsecase(
  productReadAccessor,
  promotionRepo
);
export const deletePromotionUsecase = new DeletePromotionUsecase(promotionRepo);

export const getMyInvoicesUsecase = new GetMyInvoicesUsecase(
  invoiceReadAccessor
);

export const changeCustomerPasswordUsecase = new ChangeCustomerPasswordUsecase(
  transactionManager,
  passwordService
);

export const changeManagerPasswordUsecase = new ChangeManagerPasswordUsecase(
  transactionManager,
  passwordService
);

// Export usecase tạo nhân viên kèm account (sau khi đã khai báo các biến phụ thuộc)
export const createEmployeeWithAccountUsecase = buildCreateEmployeeWithAccountUsecase(
  employeeRepo,
  employeeAccountRepo,
  passwordService
);

