import { ProductMapper } from "../mappers/product.mapper";
import { ProductRepository } from "./product.repository";
import { TransactionType } from "./transaction";

export class ProductRepositoryPostgree implements ProductRepository {
	async getById(transaction: TransactionType, id: number) {
		console.log("Enter find by Id");
		return ProductMapper.toDomain({});
	}
}
