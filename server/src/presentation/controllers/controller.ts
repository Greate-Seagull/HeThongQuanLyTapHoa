import { logger } from "../../domain/services/logger.service";
import { employeeAccountRepo } from "../../composition-root";

export function controller(usecase: any) {
	return async (req: any, res: any) => {
		// Parse numeric params
		const parsedParams = { ...req.params };
		for (const key in parsedParams) {
			if (parsedParams[key] && !isNaN(Number(parsedParams[key]))) {
				parsedParams[key] = Number(parsedParams[key]);
			}
		}

		// ✅ CRITICAL FIX: Resolve EmployeeAccount.id → Employee.id
		let authId = (req as any).authId;
		let employeeId = authId; // Default to same value
		
		// If authId exists, try to resolve to Employee.id
		if (authId && typeof authId === 'number') {
			try {
				const account = await employeeAccountRepo.getById(authId);
				if (account && account.employeeId) {
					employeeId = account.employeeId;
					console.log('✅ Resolved EmployeeAccount.id → Employee.id:', {
						accountId: authId,
						employeeId: employeeId,
					});
				}
			} catch (error) {
				console.warn('⚠️ Could not resolve EmployeeAccount → Employee:', error);
			}
		}
		
		const input = {
			...(req.body || {}),
			...parsedParams,
			...(req.query || {}),
			authId: employeeId, // ✅ Now this is Employee.id, not EmployeeAccount.id
		};

		console.log('🔍 Controller final input:', {
			usecase: usecase.constructor.name,
			accountId: authId,
			employeeId: employeeId,
			bodyAuthId: req.body?.authId,
		});

		try {
			const result = await usecase.execute(input);
			res.jsend.success(result);
		} catch (error: any) {
			console.error('❌ Controller error:', {
				usecase: usecase.constructor.name,
				message: error.message,
				stack: error.stack?.split('\n').slice(0, 3).join('\n'),
			});

			logger.error("Request failed", {
				usecase: usecase.constructor.name,
				error,
			});
			res.status(400).jsend.fail(error.message);
		}
	};
}
