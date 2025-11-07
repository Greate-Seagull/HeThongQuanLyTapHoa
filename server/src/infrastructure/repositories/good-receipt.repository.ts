import { Prisma, PrismaClient } from "@prisma/client";
import { GoodReceiptMapper } from "../mappers/good-receipt.mapper";
import { GoodReceipt } from "../../domain/good-receipt";

export class GoodReceiptRepository implements GoodReceiptRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async add(transaction: Prisma.TransactionClient, entity: GoodReceipt) {
		const raw = await transaction.GoodReceipt.create({
			data: GoodReceiptMapper.toPersistence(entity),
			select: GoodReceiptRepository.baseQuery,
		});

		return GoodReceiptMapper.toDomain(raw);
	}

	static baseQuery = {
		id: true,
		employeeId: true,
		createdAt: true,
		goodReceiptDetails: true,
	};
}
