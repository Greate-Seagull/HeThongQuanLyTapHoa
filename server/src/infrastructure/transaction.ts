import { Prisma, PrismaClient } from "@prisma/client";
import { extendedDuration } from "zod/v4/core/regexes.cjs";

export interface TransactionManager {
	transaction(
		callback: (tx: Prisma.TransactionClient) => Promise<any>
	): Promise<any>;
}

export class PrismaTransactionManager implements TransactionManager {
	constructor(protected readonly prisma: PrismaClient) {}

	async transaction(
		callback: (tx: Prisma.TransactionClient) => Promise<any>
	): Promise<any> {
		return await this.prisma.$transaction(callback);
	}
}

export class TestTransactionManager {
	constructor(protected readonly transactionClient: PrismaClient) {}

	async transaction(
		callback: (tx: Prisma.TransactionClient) => Promise<any>
	): Promise<any> {
		console.log("go");
		return await callback(this.transactionClient);
	}
}
