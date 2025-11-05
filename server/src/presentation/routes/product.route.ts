import { Router } from "express";
import { controlSearchProduct } from "../controllers/product.controller";

const router = Router();

router.get("/:productId", controlSearchProduct);

export default router;
