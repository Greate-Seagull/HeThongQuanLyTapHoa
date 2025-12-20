import z from "zod";
import { logger } from "../../../domain/services/logger.service";
import { GoodReceiptRepository } from "../../repositories/good-receipt.repository";
import { ProductReadAccessor } from "../read-accessors/product.read-accessor";
import { EmployeeReadAccessor } from "../read-accessors/employee.read-accessor";

const inputSchema = z.object({
	id: z.number(),
	authId: z.number(),
	items: z.array(
		z.object({
			productId: z.number(),
			quantity: z.number(),
			price: z.number(),
		})
	),
});

const outputSchema = z.object({});

export class UpdateGoodReceiptUsecase {
	constructor(
		private readonly employeeReadAccessor: EmployeeReadAccessor,
		private readonly productReadAccessor: ProductReadAccessor,
		private readonly goodReceiptRepo: GoodReceiptRepository
	) {}

	async execute(input: any) {
		const parsedInput = inputSchema.parse(input);
		const log = logger.child({
			task: "Updating good receipt",
			goodReceiptId: parsedInput.id,
			employeeId: parsedInput.authId,
		});
		log.info("Task started");

		// Verify good receipt exists
		const existing = await this.goodReceiptRepo.getById(parsedInput.id);
		if (!existing) {
			log.warn("Task failed: good receipt not found");
			throw Error(`Good receipt with id ${parsedInput.id} not found`);
		}

		// Verify employee
		const employee = await this.employeeReadAccessor.getById(parsedInput.authId);
		
		// ✅ CRITICAL FIX: Allow both RECEIVING and MANAGER
		if (!employee || (employee.position !== 'RECEIVING' && employee.position !== 'MANAGER')) {
			log.warn("Task failed: employee not authorized");
			throw Error(`Employee not authorized for receiving goods. Required: RECEIVING or MANAGER position`);
		}

		// Validate products
		const productIds = parsedInput.items.map((i) => i.productId);
		const areProductsValid = await this.productReadAccessor.existByIds(productIds);
		if (!areProductsValid) {
			log.warn("Task failed: invalid product id");
			throw Error(`Expect all products to be valid`);
		}

		// Validate quantities and prices
		for (const item of parsedInput.items) {
			if (item.quantity <= 0) {
				throw Error(`Invalid received quantity, ${item.quantity}`);
			}
			if (item.price <= 0) {
				throw Error(`Invalid price, ${item.price}`);
			}
		}

		log.debug("Task validated");

		// Update good receipt
		const updated = await this.goodReceiptRepo.update(
			parsedInput.id,
			parsedInput.authId,
			parsedInput.items
		);

		log.info("Task completed", { goodReceiptId: updated.id });
		return outputSchema.parse({});
	}
}
