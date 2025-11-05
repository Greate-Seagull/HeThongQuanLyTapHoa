import { Product } from "../../domain/product";

export class ProductMapper {
	static toDomain(rawProduct: any) {
		console.log("Enter to domain");
		let product = new Product();
		product.id = rawProduct.id;
		product.money = rawProduct.money;
		product.amount = rawProduct.amount;
		return product;
	}
}
