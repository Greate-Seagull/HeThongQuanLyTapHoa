import { controlSignUp } from "../controllers/account.controller";
import { Router } from "express";

const router = Router();

//Handlers
router.post("/", controlSignUp);

export default router;
