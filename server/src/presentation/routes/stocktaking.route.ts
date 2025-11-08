import { Router } from "express";
import { controlCreateStocktaking } from "../controllers/stocktaking.controller";

const router = Router();

router.post("/", controlCreateStocktaking);

export default router;
