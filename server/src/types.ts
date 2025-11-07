export const TYPES = {
	// Core
	PrismaClient: Symbol.for("PrismaClient"),
	TransactionManager: Symbol.for("TransactionManager"),

	// Repositories
	ProductReadAccessor: Symbol.for("ProductReadAccessor"),
	PromotionRepository: Symbol.for("PromotionRepository"),
	EmployeeRepository: Symbol.for("EmployeeRepository"),
	UserRepository: Symbol.for("UserRepository"),
	ProductRepositoryPostgree: Symbol.for("ProductRepositoryPostgree"),
	InvoiceRepository: Symbol.for("InvoiceRepository"),

	// Services
	PromotionPricingService: Symbol.for("PromotionPricingService"),
	SalesTransactionService: Symbol.for("SalesTransactionService"),

	// Usecases
	SearchProductsUsecase: Symbol.for("SearchProductsUsecase"),
	CreatePromotionUsecase: Symbol.for("CreatePromotionUsecase"),
	CreateInvoiceUsecase: Symbol.for("CreateInvoiceUsecase"),
};
