import { Prisma, PrismaClient } from "@prisma/client";
import { Invoice } from "../../domain/invoice";
import { InvoiceMapper } from "../mappers/invoice.mapper";

export class InvoiceRepository implements InvoiceRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async add(transaction: Prisma.TransactionClient, invoice: Invoice) {
		const raw = await transaction.invoice.create({
			data: InvoiceMapper.toPersistence(invoice),
			select: InvoiceRepository.baseQuery,
		});

		return InvoiceMapper.toDomain(raw);
	}

	static baseQuery = {
		id: true,
		employeeId: true,
		userId: true,
		usedPoint: true,
		total: true,
		invoiceDetails: true,
	};
}
