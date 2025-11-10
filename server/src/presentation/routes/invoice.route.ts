import { Router } from "express";
import { controllCreateInvoice } from "../controllers/invoice.controller";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
router.use(authenticationMiddleware);
router.use(authorizationMiddleware("SALES"));
router.post("/", controllCreateInvoice);

export default router;
