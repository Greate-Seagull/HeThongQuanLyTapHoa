import { controlUseAccount } from "../controllers/employee-account.controller";
import { controlCreateAccount } from "../controllers/employee-account.controller";
import { Router } from "express";

const router = Router();

//Handlers
router.post("/sign-in", controlUseAccount);
router.post("/", controlCreateAccount);

export default router;
