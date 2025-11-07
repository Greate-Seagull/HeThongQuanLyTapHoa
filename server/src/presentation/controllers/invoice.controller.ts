import { createInvoiceUsecase } from "../../composition-root";

export async function controllCreateInvoice(req, res) {
	try {
		console.log("Call POST /invoices");

		let input = req.body;
		const output = await createInvoiceUsecase.execute(input);
		res.json(output);

		console.log("Return POST /invoices");
	} catch (e: any) {
		res.json({ message: e.message });
	}
}
