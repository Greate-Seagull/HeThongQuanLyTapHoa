import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
	createGoodReceiptUsecase,
	getGoodReceiptsUsecase,
	updateGoodReceiptUsecase,
	deleteGoodReceiptUsecase,
} from "../../composition-root";

const router = Router();

router.use(authenticationMiddleware);

// Get all good receipts - RECEIVING can view
router.get(
	"/",
	authorizationMiddleware("RECEIVING"),
	(req, res) => {
		const page = parseInt(req.query.page as string) || 1;
		const pageSize = parseInt(req.query.pageSize as string) || 100;
		return controller(getGoodReceiptsUsecase)({ ...req, body: { page, pageSize } }, res);
	}
);

// Create good receipt - RECEIVING only
router.post(
	"/",
	authorizationMiddleware("RECEIVING"),
	(req, res) => {
		console.log('📥 POST /good-receipts received:', {
			authId: (req as any).authId,
			body: req.body,
		});
		
		return controller(createGoodReceiptUsecase)(req, res);
	}
);

// Update good receipt - RECEIVING only
router.put(
	"/:id",
	authorizationMiddleware("RECEIVING"),
	(req, res) => {
		const id = parseInt(req.params.id);
		return controller(updateGoodReceiptUsecase)({ ...req, body: { ...req.body, id } }, res);
	}
);

// Delete good receipt - RECEIVING only
router.delete(
	"/:id",
	authorizationMiddleware("RECEIVING"),
	(req, res) => {
		const id = parseInt(req.params.id);
		// ✅ authId will be merged by controller from (req as any).authId
		return controller(deleteGoodReceiptUsecase)({ ...req, body: { id } }, res);
	}
);

export default router;
