import { Request, Response, NextFunction } from "express";
import { tokenService } from "../../composition-root";
import { authenticationTokenSchema } from "../../domain/services/encrypt.service";

export function authenticationMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		console.log("Call authentication middleware");

		const result = authenticate(req.headers.authorization);
		req.body.authId = result.id;
		req.body.position = result.position;

		next();

		console.log("Return authentication middleware");
	} catch (e: any) {
		console.error(e.message);
		res.status(401).json({ message: e.message });
	}
}

function authenticate(header: string) {
	const splitted = header.split(" ");
	if (!header || splitted[0] !== "Bearer")
		throw Error("Authorization token required");

	const decoded = tokenService.verifyJwt(splitted[1]);
	const result = authenticationTokenSchema.parse(decoded);

	return result;
}
