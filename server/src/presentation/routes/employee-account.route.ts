import { controlCreateAccount } from "../controllers/employee-account.controller";
import { Router } from "express";

const router = Router();

//Handlers
router.post("/", controlCreateAccount);

export default router;
