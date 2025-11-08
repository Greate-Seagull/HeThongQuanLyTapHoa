import { createStocktakingUsecase } from "../../composition-root";

export async function controlCreateStocktaking(req, res) {
	try {
		console.log("Call POST /stocktakings");

		let input = req.body;
		const output = await createStocktakingUsecase.execute(input);
		res.json(output);

		console.log("Return POST /stocktakings");
	} catch (e: any) {
		console.error(e.message);
		res.status(400).json({ message: e.message });
	}
}
