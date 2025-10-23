import { Product } from "../../domain/product";

export class ProductMapper {
	static toDomain(rawProduct: any) {
		console.log("Enter to domain");
		return new Product();
	}
}
