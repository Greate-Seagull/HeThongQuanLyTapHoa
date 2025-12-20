import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
	getShelvesUsecase,
	createShelfUsecase,
	updateShelfUsecase,
	deleteShelfUsecase,
} from "../../composition-root";

const router = Router();

router.use(authenticationMiddleware);

router.get("/", controller(getShelvesUsecase));
// router.use(authorizationMiddleware("ADMIN"));
router.post("/", controller(createShelfUsecase));
router.put("/:id", controller(updateShelfUsecase));
router.delete("/:id", controller(deleteShelfUsecase));

export default router;