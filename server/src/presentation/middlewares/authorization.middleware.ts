import { Request, Response, NextFunction } from "express";

export function authorizationMiddleware(requiredPosition: string) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			console.log("🔐 Authorization middleware called");
			console.log("Required position:", requiredPosition);
			
			// Get position from req object or body
			const userPosition = (req as any).position || req.body?.position;
			
			console.log("User position:", userPosition);
			
			if (!userPosition) {
				throw new Error('User position not found. Authentication may have failed.');
			}

			// ✅ CRITICAL FIX: MANAGER has access to ALL positions
			if (userPosition === 'MANAGER') {
				console.log("✅ Authorization successful: MANAGER has full access");
				next();
				return;
			}

			// For non-MANAGER, check exact position match
			if (requiredPosition !== userPosition) {
				throw new Error(`Access denied. Required: ${requiredPosition}, Your position: ${userPosition}`);
			}

			console.log("✅ Authorization successful");
			next();

			console.log("Return authorization middleware");
		} catch (e: any) {
			console.error("❌ Authorization failed:", e.message);
			res.status(403).json({ message: e.message });
		}
	};
}
