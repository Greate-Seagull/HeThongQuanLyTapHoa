import { useAccountUsecase } from "../../composition-root";
import { createAccountUsecase } from "../../composition-root";

//Handlers
export async function controlUseAccount(req, res) {
	try {
		console.log("Call POST /employee-accounts/sign-in");

		let input = req.body;
		const output = await useAccountUsecase.execute(input);
		res.jsend.success(output);

		console.log("Return POST /employee-accounts/sign-in");
	} catch (e: any) {
		console.error(e.message);
		res.status(400);
		res.jsend.fail(e.message);
	}
}

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
