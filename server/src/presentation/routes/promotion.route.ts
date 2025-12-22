import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
  createPromotionUsecase,
  getPromotionsUsecase,
  updatePromotionUsecase,
  deletePromotionUsecase,
} from "../../composition-root";

const router = Router();

router.use(authenticationMiddleware);
router.get("/", controller(getPromotionsUsecase));

// router.use(authorizationMiddleware("ADMIN"));
router.post("/", controller(createPromotionUsecase));

router.put("/:id", (req, res) => {
  // ✅ CRITICAL FIX: Parse and set id from params
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).jsend.fail("Invalid promotion ID");
  }
  req.body.id = id;
  return controller(updatePromotionUsecase)(req, res);
});

router.delete("/:id", (req, res) => {
  // ✅ CRITICAL FIX: Parse and set id from params
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).jsend.fail("Invalid promotion ID");
  }
  
  // ✅ Initialize body for DELETE
  if (!req.body) req.body = {};
  req.body.id = id;
  
  return controller(deletePromotionUsecase)(req, res);
});

export default router;
