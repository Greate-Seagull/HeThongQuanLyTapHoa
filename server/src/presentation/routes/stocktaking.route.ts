import { Router } from "express";
import { controlCreateStocktaking } from "../controllers/stocktaking.controller";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";

const router = Router();

router.use(authenticationMiddleware);
router.use(authorizationMiddleware("INVENTORY"));
router.post("/", controlCreateStocktaking);

export default router;
