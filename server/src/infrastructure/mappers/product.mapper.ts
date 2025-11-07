import { Product } from "../../domain/product";

export class ProductMapper {
	static toPersistence(entity: Product) {
		return {
			name: entity.name,
			price: entity.price,
			amount: entity.amount,
			unit: entity.unit,
		};
	}

	static toDomain(raw: any) {
		return Product.rehydrate(raw);
	}
}
