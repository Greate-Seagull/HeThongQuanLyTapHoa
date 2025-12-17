import { prisma } from './../../../composition-root';
import { InvoiceReadAccessor } from "../../../infrastructure/read-accessors/prisma/invoice.read-accessor";
import { logger } from "../../../domain/services/logger.service";

export class GetMyInvoicesUsecase {
	constructor(private readonly invoiceRead: InvoiceReadAccessor) {}

	async execute(input: any) {
		const userId =
			input.authId || input.user?.id || input.body?.authId || input.query?.authId;

		if (!userId) {
			throw new Error("User ID is required to fetch invoices");
		}

		const log = logger.child({ task: "Get my invoices", userId });
		log.info("Task started");

		const invoices = await this.invoiceRead.getByUserId(Number(userId));

		log.info("Task completed");
		return invoices;
	}
}