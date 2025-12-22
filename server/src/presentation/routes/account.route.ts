import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { controller } from "../controllers/controller";
import {
  signInUsecase,
  signUpUsecase,
  getMyAccountUsecase,
  getAccountsUsecase,
  createCustomerAccountUsecase,
  updateCustomerAccountUsecase,
  deleteCustomerAccountUsecase,
  changeCustomerPasswordUsecase,
} from "../../composition-root";

const router = Router();

// Public routes
router.post("/sign-in", controller(signInUsecase));
router.post("/sign-up", controller(signUpUsecase));

// Protected routes
router.use(authenticationMiddleware);

router.get("/me", (req, res) => {
  // ✅ FIX: Use userId (not accountId) for customer
  const userId = (req as any).userId || (req as any).authId;
  
  console.log('📥 GET /accounts/me called:', {
    userId,
    accountId: (req as any).accountId,
    userType: (req as any).userType,
  });
  
  if (!userId) return res.status(401).jsend.fail("Not authenticated");
  
  // ✅ Initialize body
  if (!req.body) req.body = {};
  req.body.authId = userId;
  
  return controller(getMyAccountUsecase)(req, res);
});

router.get("/", controller(getAccountsUsecase));

router.post("/", controller(createCustomerAccountUsecase));

router.put("/:id", (req, res) => {
  if (!req.body) req.body = {};
  req.body.id = parseInt(req.params.id);
  return controller(updateCustomerAccountUsecase)(req, res);
});

router.delete("/:id", (req, res) => {
  if (!req.body) req.body = {};
  req.body.id = parseInt(req.params.id);
  return controller(deleteCustomerAccountUsecase)(req, res);
});

router.post("/change-password", (req, res) => {
  if (!req.body) req.body = {};
  req.body.id = (req as any).userId || (req as any).authId;
  return controller(changeCustomerPasswordUsecase)(req, res);
});

export default router;
