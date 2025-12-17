import { Prisma, PrismaClient } from "../../generated/client";
import { TransactionManager } from "./base.transaction";

export class PrismaTransactionManager implements TransactionManager {
	constructor(protected readonly prisma: PrismaClient) {}

	async transaction<T>(
		callback: (tx: Prisma.TransactionClient) => Promise<T>
	): Promise<T> {
		return await this.prisma.$transaction(callback);
	}
}
