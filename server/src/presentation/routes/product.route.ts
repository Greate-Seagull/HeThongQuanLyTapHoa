import { Router } from "express";
import { controller } from "../controllers/controller";
import { 
  getProductsUsecase, 
  searchProductsUsecase, 
  updateProductsUsecase 
} from "../../composition-root";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";

const router = Router();

// Get all products - should work without authentication for inventory checking
router.get("/", controller(getProductsUsecase));

// Search products
router.get("/search", controller(searchProductsUsecase));

// Update products bulk - requires authentication
router.put("/bulk", authenticationMiddleware, controller(updateProductsUsecase));

export default router;
