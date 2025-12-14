import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
  createAccountUsecase,
  useAccountUsecase,
  updateEmployeeAccountUsecase,
  getEmployeeAccountsUsecase,
  getEmployeeAccountProfileUsecase,
} from "../../composition-root";
const router = Router();

// Lấy thông tin cá nhân employee-account
router.get("/profile", authenticationMiddleware, (req, res) => {
  const id =
    (req as any).authId ||
    (req as any).user?.id ||
    req.body?.id ||
    req.query?.id;
  if (!id) return res.status(401).jsend.fail("Missing account id");
  return controller(getEmployeeAccountProfileUsecase)(
    { ...req, body: { id } },
    res
  );
});

//Handlers
router.post("/sign-in", controller(useAccountUsecase));
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("MANAGER"),
  controller(createAccountUsecase)
);

// Lấy danh sách tất cả employee-accounts
router.get(
  "/",
  authenticationMiddleware,
  controller(getEmployeeAccountsUsecase)
);

// Cập nhật thông tin employee-account
router.put(
  "/",
  authenticationMiddleware,
  controller(updateEmployeeAccountUsecase)
);

export default router;
