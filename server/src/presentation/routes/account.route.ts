import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { controller } from "../controllers/controller";
import {
  signInUsecase,
  signUpUsecase,
  getMyAccountUsecase,
  getAccountsUsecase,
} from "../../composition-root";

const router = Router();

// Đăng nhập
router.post("/sign-in", controller(signInUsecase));
// Đăng ký
router.post("/", controller(signUpUsecase));

// Lấy thông tin account hiện tại từ token (Profile)
router.get("/profile", authenticationMiddleware, (req, res) => {
  const authId =
    (req as any).authId ||
    (req as any).user?.id ||
    req.body?.authId ||
    req.query?.authId;
  if (!authId) return res.status(401).jsend.fail("Missing account id");
  return controller(getMyAccountUsecase)({ ...req, body: { authId } }, res);
});

// Lấy tất cả account (join user)
router.get("/", authenticationMiddleware, controller(getAccountsUsecase));

export default router;
