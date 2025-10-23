import type { Request, Response } from "express";
import {
	SearchProductsUsecase,
	SearchProductsUsecaseInput,
} from "src/application/search-products.usecase";

export class SearchProductsController {
	private usecase: SearchProductsUsecase;

	constructor(usecase: SearchProductsUsecase) {
		this.usecase = usecase;
	}

	async execute(
		req: Request<unknown, unknown, SearchProductsUsecaseInput>,
		res: Response
	) {
		console.log("Enter search products controller");
		const body: SearchProductsUsecaseInput = req.body;
		const result = await this.usecase.execute(body);
		res.json(result);
	}
}
