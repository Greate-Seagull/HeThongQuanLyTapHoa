import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
  createStocktakingUsecase,
  listStocktakingsUsecase,
  getStocktakingByIdUsecase,
} from "../../composition-root";

const router = Router();

router.use(authenticationMiddleware);
router.use(authorizationMiddleware("INVENTORY"));

// Lấy danh sách phiếu kiểm kê
router.get("/", controller(listStocktakingsUsecase));
// Lấy chi tiết phiếu kiểm kê theo id
router.get("/:id", controller(getStocktakingByIdUsecase));
router.post("/", controller(createStocktakingUsecase));

export default router;
