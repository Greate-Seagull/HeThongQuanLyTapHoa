import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
	createSlotUsecase,
	updateSlotUsecase,
	deleteSlotUsecase,
	listSlotWithProductUsecase,
} from "../../composition-root";

const router = Router();

router.use(authenticationMiddleware);
// router.use(authorizationMiddleware("ADMIN"));


router.post("/", controller(createSlotUsecase));
router.put("/:id", controller(updateSlotUsecase));
router.delete("/:id", controller(deleteSlotUsecase));

// New endpoint: GET /list-with-product
router.get("/list-with-product", controller(listSlotWithProductUsecase));

export default router;