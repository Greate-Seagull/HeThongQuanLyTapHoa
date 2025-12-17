import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import { createInvoiceUsecase } from "../../composition-root";

const router = Router();
router.use(authenticationMiddleware);
router.use(authorizationMiddleware("SALES"));
router.post("/", controller(createInvoiceUsecase));

export default router;
