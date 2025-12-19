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

// Get all stocktakings - INVENTORY can view
router.get(
	"/",
	authorizationMiddleware("INVENTORY"),
	(req, res) => {
		const page = parseInt(req.query.page as string) || 1;
		const pageSize = parseInt(req.query.pageSize as string) || 100;
		return controller(getStocktakingsUsecase)({ ...req, body: { page, pageSize } }, res);
	}
);

// Create stocktaking - INVENTORY only
router.post(
	"/",
	authorizationMiddleware("INVENTORY"),
	controller(createStocktakingUsecase)
);

// Update stocktaking - INVENTORY only
router.put(
	"/:id",
	authorizationMiddleware("INVENTORY"),
	(req, res) => {
		const id = parseInt(req.params.id);
		return controller(updateStocktakingUsecase)({ ...req, body: { ...req.body, id } }, res);
	}
);

// Delete stocktaking - INVENTORY only
router.delete(
	"/:id",
	authorizationMiddleware("INVENTORY"),
	(req, res) => {
		const id = parseInt(req.params.id);
		return controller(deleteStocktakingUsecase)({ ...req, body: { id } }, res);
	}
);

export default router;
