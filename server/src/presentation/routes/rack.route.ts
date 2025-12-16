import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
	createRackUsecase,
	updateRackUsecase,
	deleteRackUsecase,
} from "../../composition-root";

const router = Router();

router.use(authenticationMiddleware);
// router.use(authorizationMiddleware("ADMIN"));

router.post("/", controller(createRackUsecase));
router.put("/:id", controller(updateRackUsecase));
router.delete("/:id", controller(deleteRackUsecase));

export default router;