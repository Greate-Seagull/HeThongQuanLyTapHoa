import z from "zod";
import { Invoice } from "../../../domain/entities/invoice";
import { Product } from "../../../domain/entities/product";
import { Promotion } from "../../../domain/entities/promotion";
import { SalesTransactionService } from "../../../domain/services/sales-transaction.service";
import { EmployeePrismaRepository } from "../../../infrastructure/repositories/prisma/employee.prisma.repository";
import { logger } from "../../../domain/services/logger.service";
import { UserRepository } from "../../repositories/user.repository";
import { TransactionManager } from "../../transactions/base.transaction";
import { PromotionRepository } from "../../repositories/promotion.repository";
import { ProductRepository } from "../../repositories/product.repository";
import { InvoiceRepository } from "../../repositories/invoice.repository";

const inputSchema = z.object({
	authId: z.number(),
	userId: z.number().optional().nullable(),
	usedPoint: z.number().optional().nullable(),
	items: z.array(
		z.object({
			productId: z.number(),
			quantity: z.number(),
			promotionId: z.number().optional().nullable(),
		})
	),
});

export const processedLineItemSchema = z.object({
	productId: z.number(),
	productName: z.string(),
	quantity: z.number(),
	originalPrice: z.number(),
	discountedPrice: z.number(),
	promotionId: z.number().optional().nullable(),
	promotionName: z.string().optional().nullable(),
	subTotal: z.number(),
});

const outputSchema = z.object({
	invoiceId: z.number(),
	employee: z.object({
		employeeId: z.number(),
		name: z.string(),
	}),
	user: z
		.object({
			userId: z.number(),
			name: z.string(),
		})
		.optional()
		.nullable(),
	usedPoint: z.number(),
	products: z.array(processedLineItemSchema),
	total: z.number(),
});

type CreateInvoiceInput = z.infer<typeof inputSchema>;
export type LineItems = CreateInvoiceInput["items"];
type CreateInvoiceOutput = z.infer<typeof outputSchema>;
export type ProcessedLineItem = z.infer<typeof processedLineItemSchema>;

export class CreateInvoiceUsecase {
	constructor(
		private readonly employeeRepo: EmployeePrismaRepository,
		private readonly userRepo: UserRepository,
		private readonly productRepo: ProductRepository,
		private readonly promotionRepo: PromotionRepository,
		private readonly invoiceRepo: InvoiceRepository,
		private readonly salesTransactionService: SalesTransactionService,
		private readonly transactionManager: TransactionManager
	) {}

	async execute(input: any): Promise<CreateInvoiceOutput> {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Creating invoice",
			employeeId: parsedInput.authId,
			userId: parsedInput.userId,
		});
		log.info("Task started");
		console.log("parsedInput", parsedInput);
		

		// Fetch employee
		const employee = await this.employeeRepo.getById(parsedInput.authId);
		if (!employee) {
			log.error(`Task failed: invalid employee id`);
			throw Error(`Expect employee to be valid`);
		}

		// Fetch user
		let user = null;
		if (parsedInput.userId) {
			user = await this.userRepo.getById(parsedInput.userId);
			if (!user) {
				log.warn(`Task failed: invalid user id`);
				throw Error(`Expect user to be valid`);
			}
		}

		// Fetch products
		const productIds = parsedInput.items.map((p) => p.productId);
		const products: Product[] = await this.productRepo.getByIds(productIds);
		if (products.length !== productIds.length) {
			log.warn(`Task failed: invalid product ids`);
			throw Error(`Expect all products to be valid`);
		}

		// Fetch promotion
		const promotionIds = this.getDistinctPromotionIds(input.items);
		const promotions: Promotion[] = await this.promotionRepo.getByIds(
			promotionIds
		);
		if (promotions.length !== promotionIds.length) {
			log.warn(`Task failed: invalid promotion ids`);
			throw Error(`Expect all promotions to be valid`);
		}
		log.debug("Task validated", {
			employeeId: parsedInput.authId,
			productIds: productIds,
			promotionIds: promotionIds,
		});

		// Compute totals
		const serviceResult = this.salesTransactionService.processSale({
			user,
			usedPoint: parsedInput.usedPoint,
			products,
			promotions,
			items: parsedInput.items,
		});

		// Construct invoice
		const invoice = Invoice.create(
			serviceResult.total,
			serviceResult.items,
			employee.id,
			parsedInput.userId,
			parsedInput.usedPoint
		);

		// Save transaction
		const save = await this.transactionManager.transaction(async (tx) => {
			const promisedUser = user ? this.userRepo.save(user, tx) : null;
			const promisedProducts = this.productRepo.saveMany(products, tx);
			const promisedInvoice = this.invoiceRepo.add(invoice, tx);
			const [savedUser, savedProducts, savedInvoice] = await Promise.all([
				promisedUser,
				promisedProducts,
				promisedInvoice,
			]);

			return {
				user: savedUser,
				products: savedProducts,
				invoice: savedInvoice,
			};
		});
		log.debug("Task saved", {
			userId: save.user ? save.user.id : null,
			productIds: save.products.map((p) => p.id),
			invoiceId: save.invoice.id,
		});

		log.info("Task completed");
		return outputSchema.parse({
			invoiceId: save.invoice.id,
			employee: {
				employeeId: employee.id,
				name: employee.name,
			},
			user: save.user
				? {
						userId: save.user.id,
						name: save.user.name,
				  }
				: null,
			products: serviceResult.items,
			usedPoint: save.invoice.usedPoint,
			total: serviceResult.total,
		});
	}

	private getDistinctPromotionIds(items: LineItems): number[] {
		const promotionIds = new Set<number>();
		for (const item of items) {
			if (item.promotionId != null) promotionIds.add(item.promotionId);
		}
		return [...promotionIds];
	}
}
