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

router.get(
  "/",
  authenticationMiddleware,
  controller(getEmployeeAccountsUsecase)
);

router.put(
  "/",
  authenticationMiddleware,
  controller(updateEmployeeAccountUsecase)
);

router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("MANAGER"),
  (req, res) => controller(deleteEmployeeAccountUsecase)({ ...req, id: req.params.id }, res)
);

export default router;
