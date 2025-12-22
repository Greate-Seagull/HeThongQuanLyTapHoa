import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
	createStocktakingUsecase,
	getStocktakingsUsecase,
	updateStocktakingUsecase,
	deleteStocktakingUsecase,
} from "../../composition-root";

const router = Router();

router.use(authenticationMiddleware);

// Get all stocktakings
router.get(
	"/",
	authorizationMiddleware("INVENTORY"),
	(req, res) => {
		const page = parseInt(req.query.page as string) || 1;
		const pageSize = parseInt(req.query.pageSize as string) || 100;
		// ✅ Initialize body for GET request
		req.body = { page, pageSize };
		return controller(getStocktakingsUsecase)(req, res);
	}
);

// Create stocktaking
router.post(
	"/",
	authorizationMiddleware("INVENTORY"),
	(req, res) => {
		console.log('📥 POST /stocktakings received:', {
			authId: (req as any).authId,
			body: req.body,
		});
		
		return controller(createStocktakingUsecase)(req, res);
	}
);

// Update stocktaking
router.put(
	"/:id",
	authorizationMiddleware("INVENTORY"),
	(req, res) => {
		const id = parseInt(req.params.id);
		// ✅ Body exists for PUT - safe to set property
		req.body.id = id;
		return controller(updateStocktakingUsecase)(req, res);
	}
);

// Delete stocktaking
router.delete(
	"/:id",
	authorizationMiddleware("INVENTORY"),
	(req, res) => {
		const id = parseInt(req.params.id);
		
		console.log('🗑️ DELETE /stocktakings/:id called:', {
			id,
			authId: (req as any).authId,
			bodyBefore: req.body,
		});
		
		// ✅ CRITICAL FIX: Initialize body first for DELETE request
		if (!req.body || typeof req.body !== 'object') {
			req.body = {};
		}
		
		req.body.id = id;
		
		console.log('🗑️ Body after setting id:', req.body);
		
		return controller(deleteStocktakingUsecase)(req, res);
	}
);

export default router;
