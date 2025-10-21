import { ProductMapper } from '../mappers/product.mapper.js'

export class ProductRepositoryPostgree {
    #productModel;

    constructor(productModel) {
        this.#productModel = productModel;
    }

    async findById(id) {
        console.log('Enter find by Id');
        // const row = await this.#productModel.findUnique({
        //     where: { id: id },
        //     select: { id: true },
        // });
        return ProductMapper.toDomain({});
    }
}