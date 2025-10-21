import { Product } from "../../domain_layer/product.js";

export class ProductMapper {
    static toDomain(rawProduct) {
        console.log('Enter to domain');
        return new Product();
    }
}