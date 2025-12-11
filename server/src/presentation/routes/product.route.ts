import { Router } from "express";
import {
	controlGetProducts,
	controlSearchProduct,
	controlUpdateProducts,
} from "../controllers/product.controller";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
router.get("/", controlGetProducts);
router.get("/:productId", controlSearchProduct);
router.put(
	"/bulk",
	authenticationMiddleware,
	authorizationMiddleware("ADMIN"),
	controlUpdateProducts
);

export default router;
