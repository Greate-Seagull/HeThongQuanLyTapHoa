import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import { createPromotionUsecase } from "../../composition-root";

const router = Router();

router.use(authenticationMiddleware);
router.use(authorizationMiddleware("ADMIN"));
router.post("/", controller(createPromotionUsecase));

export default router;
