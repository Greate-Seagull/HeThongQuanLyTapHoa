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
  (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).jsend.fail("Invalid supplier ID");
    }
    req.body.id = id;
    return controller(updateSupplierUsecase)(req, res);
  }
);

// DELETE supplier
router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("MANAGER"),
  (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).jsend.fail("Invalid supplier ID");
    }
    
    if (!req.body) req.body = {};
    req.body.id = id;
    
    return controller(deleteSupplierUsecase)(req, res);
  }
);

export default router;
