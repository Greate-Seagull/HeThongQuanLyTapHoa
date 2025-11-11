import { Product } from "../../domain/product";

export class ProductMapper {
	static toPersistence(entity: Product) {
		return {
			name: entity.name,
			price: entity.price,
			unit: entity.unit,
			barcode: entity.barcode,
			amount: entity.amount,
		};
	}

	static toDomain(raw: any) {
		return Product.rehydrate(raw);
	}
}
