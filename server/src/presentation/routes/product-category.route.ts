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
  (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).jsend.fail("Invalid category ID");
    }
    req.body.id = id;
    return controller(updateProductCategoryUsecase)(req, res);
  }
);

// DELETE category
router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("MANAGER"),
  (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).jsend.fail("Invalid category ID");
    }
    
    if (!req.body) req.body = {};
    req.body.id = id;
    
    return controller(deleteProductCategoryUsecase)(req, res);
  }
);

export default router;
