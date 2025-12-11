import { Prisma, PrismaClient } from "@prisma/client";
import { Invoice } from "../../domain/invoice";
import {
	fromPersistence,
	toPersistenceObject,
} from "../../domain/services/mapper.service";
import { ChangeTracker } from "../cache/change-tracker";
import { buildSafePrismaSelect } from "../../domain/services/query-builder.service";

export class InvoiceRepository implements InvoiceRepository {
	private tracker = new ChangeTracker<any>();

	constructor(private readonly prisma: PrismaClient) {}

	async add(transaction: Prisma.TransactionClient, invoice: Invoice) {
		let data = toPersistenceObject(invoice);
		data.invoiceDetails = {
			create: invoice.invoiceDetails.map(toPersistenceObject),
		};
		const raw = await transaction.invoice.create({
			data: this.tracker.diff(invoice.id, data),
			...InvoiceRepository.baseQuery,
		});

		let entity = fromPersistence(Invoice, raw);
		this.tracker.track(entity.id, raw);
		return entity;
	}

	static baseQuery = buildSafePrismaSelect(Invoice);
}
