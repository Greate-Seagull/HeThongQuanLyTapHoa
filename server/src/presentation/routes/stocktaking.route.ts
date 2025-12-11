import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import { createStocktakingUsecase } from "../../composition-root";

const router = Router();

router.use(authenticationMiddleware);
router.use(authorizationMiddleware("INVENTORY"));
router.post("/", controller(createStocktakingUsecase));

export default router;
