import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
	createSlotUsecase,
	updateSlotUsecase,
	deleteSlotUsecase,
} from "../../composition-root";

const router = Router();

router.use(authenticationMiddleware);
// router.use(authorizationMiddleware("ADMIN"));

router.post("/", controller(createSlotUsecase));
router.put("/:id", controller(updateSlotUsecase));
router.delete("/:id", controller(deleteSlotUsecase));

export default router;