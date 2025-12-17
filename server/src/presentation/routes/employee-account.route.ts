import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
	createAccountUsecase,
	useAccountUsecase,
} from "../../composition-root";

const router = Router();

//Handlers
router.post("/sign-in", controller(useAccountUsecase));
router.post(
	"/",
	authenticationMiddleware,
	authorizationMiddleware("MANAGER"),
	controller(createAccountUsecase)
);

export default router;
