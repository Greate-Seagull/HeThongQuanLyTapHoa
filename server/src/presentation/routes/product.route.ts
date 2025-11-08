import { Router } from "express";
import {
	controlGetProducts,
	controlSearchProduct,
	controlUpdateProducts,
} from "../controllers/product.controller";

const router = Router();

router.get("/:productId", controlSearchProduct);
router.put("/bulk", controlUpdateProducts);
router.get("/", controlGetProducts);

export default router;
