import { Request, Response, NextFunction } from "express";
import { tokenService, employeeAccountRepo } from "../../composition-root";
import { authenticationTokenSchema } from "../../domain/services/encrypt.service";

export function authenticationMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		console.log("🔐 Authentication middleware called");

		const result = authenticate(req.headers.authorization);
		
		// ✅ FIX: Set BOTH EmployeeAccount.id AND Employee.id
		(req as any).accountId = result.id; // EmployeeAccount.id (for JWT validation)
		(req as any).authId = result.id;    // For backward compatibility
		(req as any).position = result.position;
		
		// ✅ CRITICAL: For Employee operations (Stocktaking, GoodReceipt), we need Employee.id
		// We'll resolve this in controller by looking up EmployeeAccount → Employee
		
		console.log("✅ Authenticated:", { 
			accountId: result.id, 
			position: result.position,
		});

		next();
	} catch (e: any) {
		console.error("❌ Authentication failed:", e.message);
		res.status(401).json({ message: e.message });
	}
}

function authenticate(header: string | undefined) {
	if (!header) {
		throw Error("Authorization token required");
	}

	const splitted = header.split(" ");
	if (splitted[0] !== "Bearer") {
		throw Error("Authorization token required");
	}

	const decoded = tokenService.verifyJwt(splitted[1]);
	const result = authenticationTokenSchema.parse(decoded);

	return result;
}
