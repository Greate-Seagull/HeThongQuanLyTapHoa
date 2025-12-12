import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
  getProductCategoriesUsecase,
  createProductCategoryUsecase,
  updateProductCategoryUsecase,
  deleteProductCategoryUsecase,
} from "../../composition-root";

const router = Router();

// GET all categories
router.get("/", controller(getProductCategoriesUsecase));

// CREATE category
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("MANAGER"),
  controller(createProductCategoryUsecase)
);

// UPDATE category
router.put(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("MANAGER"),
  controller(updateProductCategoryUsecase)
);

// DELETE category
router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("MANAGER"),
  controller(deleteProductCategoryUsecase)
);

export default router;
