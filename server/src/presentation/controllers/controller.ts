import { logger } from "../../domain/services/logger.service";

export function controller(usecase: any) {
	return async (req: any, res: any) => {
		const input = {
			...(req.body || {}),
			...(req.params || {}),
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
