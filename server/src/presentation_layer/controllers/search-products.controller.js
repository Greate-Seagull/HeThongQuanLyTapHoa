export class SearchProductsController {
    #usecase;

    constructor(usecase) {
        this.#usecase = usecase;
    }

    async execute(req, res) {
        try {
            console.log('Enter search products use case');
            const res = await this.#usecase.execute(req.body);
            res.json();
        }
        catch (error) {
            console.error(error.message);
            res.json(error.message);
        }
    }
}