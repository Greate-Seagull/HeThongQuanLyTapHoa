export class SearchProductsUseCase {
    #productRepository;

    constructor(productRepository) {
        this.#productRepository = productRepository;
    }

    async execute({ productId }) {
        console.log("Enter search product use case");
        return await this.#productRepository.findById(productId);
    }
}