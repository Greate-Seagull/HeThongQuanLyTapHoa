import { ChangeEmployeePasswordUsecase } from '../../application/services/employee-account/change-employee-password.usecase';
const changeEmployeePasswordUsecase = new ChangeEmployeePasswordUsecase();

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
  deleteEmployeeAccountUsecase,
} from "../../composition-root";
const router = Router();

// router.use(authenticationMiddleware);

// Lấy thông tin cá nhân employee-account
router.get("/profile", authenticationMiddleware, (req, res) => {
  const id =
    (req as any).authId ||
    (req as any).user?.id ||
    req.body?.id ||
    req.query?.id;
  console.log("Profile request for account id:", id);

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
  // authenticationMiddleware,
  // authorizationMiddleware("MANAGER"),
  controller(createAccountUsecase)
);

router.get(
  "/",
  // authenticationMiddleware,
  controller(getEmployeeAccountsUsecase)
);

router.put(
  "/",
  // authenticationMiddleware,
  controller(updateEmployeeAccountUsecase)
);

router.delete(
  "/:id",
  // authenticationMiddleware,
  // authorizationMiddleware("MANAGER"),
  (req, res) =>
    controller(deleteEmployeeAccountUsecase)({ ...req, id: req.params.id }, res)
);

// Đổi mật khẩu cho nhân viên
router.post(
  '/change-password',
  authenticationMiddleware,
  async (req, res) => {
    req.body = { ...req.body, id: (req as any).authId };
    try {
      console.log("testabc", req.body);
      
      const result = await changeEmployeePasswordUsecase.execute(req.body);
      res.json({ status: 'success', data: result });
    } catch (err: any) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  }
);

export default router;
