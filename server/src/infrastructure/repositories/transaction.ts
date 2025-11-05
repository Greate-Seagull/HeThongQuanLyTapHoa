import { Prisma, PrismaClient } from "@prisma/client";

export class PrismaTransactionManager {
	constructor(private readonly prisma: PrismaClient) {}

	async transaction(
		callback: (tx: Prisma.TransactionClient) => Promise<any>
	): Promise<any> {
		return await this.prisma.$transaction(callback);
	}
}
