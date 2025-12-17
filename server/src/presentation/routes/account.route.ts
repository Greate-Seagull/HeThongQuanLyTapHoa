import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
  signInUsecase,
  signUpUsecase,
  getMyAccountUsecase,
  getAccountsUsecase,
  createCustomerAccountUsecase,
  updateCustomerAccountUsecase,
  deleteCustomerAccountUsecase,
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
    req.body?.id ||
    req.query?.id;
  if (!authId) return res.status(401).jsend.fail("Missing account id");
  return controller(getMyAccountUsecase)({ ...req, body: { authId } }, res);
});

// router.get("/profile", authenticationMiddleware, (req, res) => {
//   const id =
//     (req as any).authId ||
//     (req as any).user?.id ||
//     req.body?.id ||
//     req.query?.id;
//   if (!id) return res.status(401).jsend.fail("Missing account id");
//   return controller(getEmployeeAccountProfileUsecase)(
//     { ...req, body: { id } },
//     res
//   );
// });

// Lấy tất cả account (join user)
router.get("/", authenticationMiddleware, controller(getAccountsUsecase));

// Quản lý Account (Create, Update, Delete)
router.post(
  "/create",
  authenticationMiddleware,
  authorizationMiddleware("MANAGER"),
  controller(createCustomerAccountUsecase)
);

router.put(
  "/:id",
  authenticationMiddleware,
//   authorizationMiddleware("MANAGER"),
  (req, res) => controller(updateCustomerAccountUsecase)({ ...req, id: req.params.id }, res)
);

router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("MANAGER"),
  (req, res) => controller(deleteCustomerAccountUsecase)({ ...req, id: req.params.id }, res)
);

export default router;
