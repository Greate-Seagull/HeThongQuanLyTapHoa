import { Request, Response, NextFunction } from "express";

export function authorizationMiddleware(position: string) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			console.log("Call authorization middleware");

			authorize(position, req.body.position);

			next();

			console.log("Return authorization middleware");
		} catch (e: any) {
			console.error(e.message);
			res.status(403).json({ message: e.message });
		}
	};
}

function authorize(position: string, clientPosition: any) {
	if (position !== clientPosition) throw Error(`Invalid position`);
}
