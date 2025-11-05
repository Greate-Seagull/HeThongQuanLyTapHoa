import { Router } from "express";
import { controlCreatePromotion } from "../controllers/promotion.controller";

const router = Router();

router.post("/", controlCreatePromotion);

export default router;
