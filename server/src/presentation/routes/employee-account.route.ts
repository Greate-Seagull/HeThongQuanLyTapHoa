import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
	createAccountUsecase,
	useAccountUsecase,
	updateEmployeeAccountUsecase,
	getEmployeeAccountsUsecase,
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


// Lấy danh sách tất cả employee-accounts
router.get("/", authenticationMiddleware, controller(getEmployeeAccountsUsecase));

// Cập nhật thông tin employee-account
router.put("/", authenticationMiddleware, controller(updateEmployeeAccountUsecase));

export default router;
