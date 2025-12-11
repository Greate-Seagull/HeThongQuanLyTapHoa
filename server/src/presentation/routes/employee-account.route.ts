import { controlUseAccount } from "../controllers/employee-account.controller";
import { controlCreateAccount } from "../controllers/employee-account.controller";
import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";

const router = Router();

//Handlers
router.post("/sign-in", controlUseAccount);
router.post(
	"/",
	authenticationMiddleware,
	authorizationMiddleware("ADMIN"),
	controlCreateAccount
);

export default router;
