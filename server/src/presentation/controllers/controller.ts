import { logger } from "../../domain/services/logger.service";

export function controller(usecase: any) {
	return async (req: any, res: any) => {
		// Parse numeric params (id, productId, etc.)
		const parsedParams = { ...req.params };
		for (const key in parsedParams) {
			if (parsedParams[key] && !isNaN(Number(parsedParams[key]))) {
				parsedParams[key] = Number(parsedParams[key]);
			}
		}

		const input = {
			...(req.body || {}),
			...parsedParams,
			...(req.query || {}),
			authId: req.authId,
		};

		try {
			const result = await usecase.execute(input);
			res.jsend.success(result);
		} catch (error: any) {
			logger.error("Request failed", {
				usecase: usecase.constructor.name,
				error,
			});
			res.status(400).jsend.fail(error.message);
		}
	};
}
