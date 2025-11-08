import { SearchProductsUsecaseInput } from "../../application/search-products.usecase";
import {
	searchProductsUsecase,
	updateProductsUsecase,
} from "../../composition-root";

export async function controlSearchProduct(req, res) {
	try {
		console.log(`Call GET /products/${req.params.productId}`);

		let input = new SearchProductsUsecaseInput(
			Number(req.params.productId)
		);
		let output = await searchProductsUsecase.execute(input);
		res.json(output);

		console.log(`Return GET /products/${req.params.productId}`);
	} catch (e: any) {
		console.error(e.message);
		res.json({ message: e.message });
	}
}

export async function controlUpdateProducts(req, res) {
	try {
		console.log(`Call PUT /products/bulk`);

		let input = req.body;
		let output = await updateProductsUsecase.execute(input);
		res.json(output);

		console.log(`Return PUT /products/bulk`);
	} catch (e: any) {
		console.error(e.message);
		res.status(400).json({ message: e.message });
	}
}
