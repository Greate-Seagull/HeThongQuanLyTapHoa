import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
	getProductsUsecase,
	searchProductsUsecase,
	createProductUsecase,
	updateProductUsecase,
	deleteProductUsecase,
} from "../../composition-root";

const router = Router();

// Public routes
router.get("/", controller(getProductsUsecase));
router.get("/search", controller(searchProductsUsecase));

// Protected routes
router.use(authenticationMiddleware);

router.post(
	"/",
	authorizationMiddleware("MANAGER"),
	controller(createProductUsecase)
);

router.put(
	"/:id",
	authorizationMiddleware("MANAGER"),
	(req, res) => {
		const id = parseInt(req.params.id);
		if (isNaN(id)) {
			return res.status(400).jsend.fail("Invalid product ID");
		}
		req.body.id = id;
		return controller(updateProductUsecase)(req, res);
	}
);

router.delete(
	"/:id",
	authorizationMiddleware("MANAGER"),
	(req, res) => {
		const id = parseInt(req.params.id);
		if (isNaN(id)) {
			return res.status(400).jsend.fail("Invalid product ID");
		}
		
		if (!req.body) req.body = {};
		req.body.id = id;
		
		return controller(deleteProductUsecase)(req, res);
	}
);

export default router;
