import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { controller } from "../controllers/controller";
import {
	getShelvesUsecase,
	createShelfUsecase,
	updateShelfUsecase,
	deleteShelfUsecase,
} from "../../composition-root";

const router = Router();

// Public endpoint - no auth needed for viewing shelves
router.get("/", controller(getShelvesUsecase));

// Protected endpoints
router.use(authenticationMiddleware);
router.post("/", controller(createShelfUsecase));
router.put("/:id", controller(updateShelfUsecase));
router.delete("/:id", controller(deleteShelfUsecase));

export default router;