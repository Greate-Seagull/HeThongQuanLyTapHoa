import { Prisma } from "@prisma/client";
import { Invoice } from "../../../domain/entities/invoice";
import { buildSafePrismaSelect } from "../../../domain/services/query-builder.service";
import { PrismaRepository } from "./prisma.prisma.repository";
import { InvoiceDto } from "../../../application/DTOs/invoice.dto";
import { InvoiceRepository } from "../../../application/repositories/invoice.repository";

export class InvoicePrismaRepository
	extends PrismaRepository<Invoice, InvoiceDto>
	implements InvoiceRepository
{
	private static baseSelect = buildSafePrismaSelect(Invoice);

	protected buildUpdateData(entity: Invoice): Partial<InvoiceDto> {
		let persitence = this.toPersistence(entity) as any;
		persitence.invoiceDetails = {
			connect: persitence.invoiceDetails,
		};
		return persitence;
	}

	protected buildCreateData(entity: Invoice): Partial<InvoiceDto> {
		let persitence = this.toPersistence(entity) as any;
		persitence.invoiceDetails = {
			create: persitence.invoiceDetails,
		};
		return persitence;
	}

	protected getBaseQuery(): { select: object } {
		return InvoicePrismaRepository.baseSelect;
	}

	protected getRepository(transaction?: Prisma.TransactionClient): any {
		if (transaction) return transaction.invoice;
		return this.client.invoice;
	}
}
