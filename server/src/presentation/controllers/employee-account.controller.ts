import { createAccountUsecase } from "../../composition-root";

//Handlers
export async function controlCreateAccount(req, res) {
	try {
		console.log("Call POST /employee-accounts");

		let input = req.body;
		const output = await createAccountUsecase.execute(input);
		res.json(output);

		console.log("Return POST /employee-accounts");
	} catch (e: any) {
		console.error(e.message);
		res.status(400).json({ message: e.message });
	}
}
