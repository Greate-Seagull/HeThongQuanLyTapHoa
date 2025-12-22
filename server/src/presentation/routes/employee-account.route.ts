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
  changeManagerPasswordUsecase,
} from "../../composition-root";

const router = Router();

// Lấy thông tin cá nhân employee-account
router.get("/profile", authenticationMiddleware, (req, res) => {
  // ✅ FIX: Use accountId (EmployeeAccountID) instead of authId (EmployeeID)
  const accountId = (req as any).accountId;
  
  console.log("Profile request for account id:", accountId);

  if (!accountId) return res.status(401).jsend.fail("Missing account id");
  
  // ✅ FIX: Initialize body if undefined, then set id
  if (!req.body) req.body = {};
  req.body.id = accountId; // Use EmployeeAccount.id
  
  return controller(getEmployeeAccountProfileUsecase)(req, res);
});

// Handlers
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
  (req, res) => {
    const id = parseInt(req.params.id);
    
    console.log('🗑️ DELETE /employee-accounts/:id called:', {
      id,
      params: req.params,
      bodyBefore: req.body,
    });
    
    // ✅ CRITICAL FIX: Initialize body first for DELETE request
    if (!req.body || typeof req.body !== 'object') {
      req.body = {};
    }
    
    req.body.id = id;
    
    console.log('🗑️ Body after setting id:', req.body);
    
    return controller(deleteEmployeeAccountUsecase)(req, res);
  }
);

// Đổi mật khẩu cho nhân viên
router.post(
  '/change-password',
  authenticationMiddleware,
  (req, res) => {
    // ✅ FIX: Set authId from middleware
    req.body.id = (req as any).authId;
    return controller(changeManagerPasswordUsecase)(req, res);
  }
);

export default router;
