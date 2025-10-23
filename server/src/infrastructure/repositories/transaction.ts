import { Prisma, PrismaClient } from "@prisma/client";

export type TransactionType = Omit<
	Prisma.TransactionClient,
	"$connect" | "$disconnect"
>;

export class PrismaTransactionManager {
	constructor(private readonly prisma: PrismaClient) {}

	async transaction(
		callback: (t: TransactionType) => Promise<any>
	): Promise<any> {
		return this.prisma.$transaction(callback);
	}
}
