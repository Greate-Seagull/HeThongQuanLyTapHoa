import { Router } from "express";
import {
	controlGetProducts,
	controlSearchProduct,
	controlUpdateProducts,
} from "../controllers/product.controller";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
router.use(authenticationMiddleware);
router.use(authorizationMiddleware("ADMIN"));
router.get("/:productId", controlSearchProduct);
router.put("/bulk", controlUpdateProducts);
router.get("/", controlGetProducts);

export default router;
