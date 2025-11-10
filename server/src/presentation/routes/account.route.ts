import { controlSignIn } from "../controllers/account.controller";
import { controlSignUp } from "../controllers/account.controller";
import { Router } from "express";

const router = Router();

//Handlers
router.post("/sign-in", controlSignIn);
router.post("/", controlSignUp);

export default router;
