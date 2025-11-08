import { Router } from "express";
import {
	controlSearchProduct,
	controlUpdateProducts,
} from "../controllers/product.controller";

const router = Router();

router.get("/:productId", controlSearchProduct);
router.put("/bulk", controlUpdateProducts);

export default router;
