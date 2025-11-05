import { Prisma, PrismaClient } from "@prisma/client";
import { ProductMapper } from "../mappers/product.mapper";
import { ProductRepository } from "./product.repository";

export class ProductRepositoryPostgree implements ProductRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async getById(transaction: Prisma.TransactionClient, id: number) {
		console.log("Enter find by Id = ", id);
		const repository = transaction ? transaction.post : this.prisma.post;
		const row = await repository.findUnique({
			where: { id: id },
			select: { id: true, price: true, amount: true },
		});
		return ProductMapper.toDomain(row);
	}
}
