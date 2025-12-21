import { Request, Response, NextFunction } from "express";

export function authorizationMiddleware(position: string) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			console.log("Call authorization middleware");
			console.log("Required position:", position);

			// Get position from req object or body (for DELETE requests, use req.position)
			const userPosition = (req as any).position || req.body?.position;

			console.log("User position:", userPosition);

			if (!userPosition) {
				throw new Error('User position not found. Authentication may have failed.');
			}

			// Allow MANAGER to access RECEIVING and INVENTORY APIs
			if (
				userPosition === position ||
				(position === "RECEIVING" && userPosition === "MANAGER") ||
				(position === "INVENTORY" && userPosition === "MANAGER")
			) {
				console.log("Authorization successful");
				next();
				console.log("Return authorization middleware");
				return;
			}

			throw new Error(`Access denied. Required: ${position}, Your position: ${userPosition}`);
		} catch (e: any) {
			console.error(e.message);
			res.status(403).json({ message: e.message });
		}
	};
}
