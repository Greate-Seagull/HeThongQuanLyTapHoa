export class SearchProductsUseCase {
    #productRepository;

    constructor(productRepository) {
        this.#productRepository = productRepository;
    }

    async execute({ id }) {
        console.log("Enter search products use case");
        return await this.#productRepository.findById(id);
    }
}