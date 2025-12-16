import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import { 
	createStocktakingUsecase,
	getStocktakingsUsecase,
	applyStocktakingUsecase 
} from "../../composition-root";

const router = Router();

router.use(authenticationMiddleware);

// GET all stocktakings - INVENTORY and MANAGER can view
router.get(
	"/", 
	authorizationMiddleware("INVENTORY"), 
	controller(getStocktakingsUsecase)
);

// POST create stocktaking - only INVENTORY
router.post(
	"/", 
	authorizationMiddleware("INVENTORY"), 
	controller(createStocktakingUsecase)
);

// POST apply stocktaking adjustments - only MANAGER
router.post(
	"/:id/apply", 
	authorizationMiddleware("MANAGER"), 
	controller(applyStocktakingUsecase)
);

export default router;
