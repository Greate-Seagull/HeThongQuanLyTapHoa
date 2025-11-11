import { Prisma, PrismaClient } from "@prisma/client";
import { ProductMapper } from "../mappers/product.mapper";
import { ProductRepository } from "./product.repository";
import { Product } from "../../domain/product";

export class ProductRepositoryPostgree implements ProductRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async getById(transaction: Prisma.TransactionClient, id: number) {
		const repository = transaction ? transaction.post : this.prisma.post;
		const row = await repository.findUnique({
			where: { id: id },
			select: { id: true, price: true, amount: true },
		});
		return ProductMapper.toDomain(row);
	}

	async getByIds(ids: any): Promise<Product[]> {
		const raws = await this.prisma.product.findMany({
			where: {
				id: {
					in: ids,
				},
			},
		});

		return raws.map(ProductMapper.toDomain);
	}

	async save(
		transaction: Prisma.TransactionClient,
		products: Product[]
	): Promise<Product[]> {
		const promisedRaws = products.map((p) => {
			return transaction.product.update({
				where: {
					id: p.id,
				},
				data: ProductMapper.toPersistence(p),
			});
		});

		const savedProducts = await Promise.all(promisedRaws);

		return savedProducts.map(ProductMapper.toDomain);
	}

	async add(
		transaction: Prisma.TransactionClient,
		insertProducts: Product[]
	): Promise<Product[]> {
		const raws = await transaction.product.createMany({
			data: insertProducts.map(ProductMapper.toPersistence),
		});

		return raws; //{count: number}
	}
}
