import { Router } from "express";
import { controlCreateGoodReceipt } from "../controllers/good-receipt.controller";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
router.use(authenticationMiddleware);
router.use(authorizationMiddleware("RECEIVING"));
router.post("/", controlCreateGoodReceipt);

export default router;
