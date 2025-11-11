import { createGoodReceiptUsecase } from "../../composition-root";

export async function controlCreateGoodReceipt(req, res) {
	try {
		console.log("Call POST /good-receipts");

		let input = req.body;
		const output = await createGoodReceiptUsecase.execute(input);
		res.json(output);

		console.log("Return POST /good-receipts");
	} catch (e: any) {
		res.json({ message: e.message });
	}
}
