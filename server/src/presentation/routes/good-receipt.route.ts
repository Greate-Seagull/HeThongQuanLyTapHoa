import { Router } from "express";
import { controlCreateGoodReceipt } from "../controllers/good-receipt.controller";

const router = Router();
router.post("/", controlCreateGoodReceipt);

export default router;
