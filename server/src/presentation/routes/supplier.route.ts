import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
  getSuppliersUsecase,
  createSupplierUsecase,
  updateSupplierUsecase,
  deleteSupplierUsecase,
} from "../../composition-root";

const router = Router();

// GET all suppliers
router.get("/", controller(getSuppliersUsecase));

// CREATE supplier
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("MANAGER"),
  controller(createSupplierUsecase)
);

// UPDATE supplier
router.put(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("MANAGER"),
  controller(updateSupplierUsecase)
);

// DELETE supplier
router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("MANAGER"),
  controller(deleteSupplierUsecase)
);

export default router;
