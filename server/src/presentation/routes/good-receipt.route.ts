import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import { createGoodReceiptUsecase } from "../../composition-root";

const router = Router();
router.use(authenticationMiddleware);
router.use(authorizationMiddleware("RECEIVING"));
router.post("/", controller(createGoodReceiptUsecase));

export default router;
