import { CreatePromotionUsecaseInput } from "../../application/create-promotion.usecase";
import { createPromotionUsecase } from "../../composition-root";

export async function controlCreatePromotion(req, res) {
	try {
		console.log(`Call POST /promotions`);

		let input = new CreatePromotionUsecaseInput(
			String(req.body.name),
			String(req.body.description),
			new Date(req.body.startedAt),
			new Date(req.body.endedAt),
			String(req.body.condition),
			Number(req.body.value),
			Number(req.body.promotionId),
			req.body.products.map(Number)
		);
		let output = await createPromotionUsecase.execute(input);
		res.json(output);

		console.log(`Return POST /promotions`);
	} catch (e: any) {
		console.error(e.message);
		res.status(400).json({ message: e.message });
	}
}
