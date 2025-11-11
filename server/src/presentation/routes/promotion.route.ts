import { Router } from "express";
import { controlCreatePromotion } from "../controllers/promotion.controller";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";

const router = Router();

router.use(authenticationMiddleware);
router.use(authorizationMiddleware("ADMIN"));
router.post("/", controlCreatePromotion);

export default router;
