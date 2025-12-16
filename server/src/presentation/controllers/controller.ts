import { Request, Response } from "express";
import { logger } from "../../domain/services/logger.service";

export const controller = (usecase: any) => {
	return async (req: Request, res: Response) => {
		try {
			const input = {
				...req.body,
				...req.params,
				...req.query,
				authId: (req as any).authId,
			};

			const result = await usecase.execute(input);

			// Ensure consistent response format
			res.status(200).json({
				status: "success",
				data: result,
			});
		} catch (error: any) {
			logger.error("Controller error:", {
				usecase: usecase.constructor.name,
				error,
			});
			
			res.status(error.statusCode || 400).json({
				status: "error",
				message: error.message || "An error occurred",
			});
		}
	};
};
