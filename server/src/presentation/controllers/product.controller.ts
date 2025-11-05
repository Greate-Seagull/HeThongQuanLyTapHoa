import { SearchProductsUsecaseInput } from "../../application/search-products.usecase";
import { searchProductsUsecase } from "../../composition-root";

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
