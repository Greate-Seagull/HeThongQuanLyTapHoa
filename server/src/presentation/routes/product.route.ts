import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
  getProductsUsecase,
  searchProductsUsecase,
  updateProductsUsecase,
  createProductUsecase,
  updateProductUsecase,
  deleteProductUsecase,
  updateProductStatusUsecase,
  adjustProductInventoryUsecase,
} from "../../composition-root";

const router = Router();
router.get("/", controller(getProductsUsecase));
router.use(authenticationMiddleware);

router.get("/:productId", controller(searchProductsUsecase));
router.put(
  "/bulk",
  authenticationMiddleware,
  authorizationMiddleware("ADMIN"),
  controller(updateProductsUsecase)
);
router.post("/", controller(createProductUsecase));
router.put("/", controller(updateProductUsecase));

// API cập nhật trạng thái sản phẩm
router.patch(
  "/:productId/status",
  controller(updateProductStatusUsecase)
);

// API điều chỉnh tồn kho (Manager only)
router.patch(
  "/:productId/adjust-inventory",
  authorizationMiddleware("MANAGER"),
  controller(adjustProductInventoryUsecase)
);

// router.delete("/:id", controller(deleteProductUsecase));
router.delete("/:id", (req, res) =>
  controller(deleteProductUsecase)({ ...req, id: req.params.id }, res)
);
export default router;
