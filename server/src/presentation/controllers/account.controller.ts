import { signUpUsecase } from "../../composition-root";

//Handlers
export async function controlSignUp(req, res) {
	try {
		console.log("Call POST /accounts");

		let input = req.body;
		const output = await signUpUsecase.execute(input);
		res.json(output);

		console.log("Return POST /accounts");
	} catch (e: any) {
		console.error(e.message);
		res.status(400).json({ message: e.message });
	}
}
