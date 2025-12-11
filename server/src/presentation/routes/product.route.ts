import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
	getProductsUsecase,
	searchProductsUsecase,
	updateProductsUsecase,
} from "../../composition-root";

const router = Router();
router.get("/", controller(getProductsUsecase));
router.get("/:productId", controller(searchProductsUsecase));
router.put(
	"/bulk",
	authenticationMiddleware,
	authorizationMiddleware("ADMIN"),
	controller(updateProductsUsecase)
);

export default router;
