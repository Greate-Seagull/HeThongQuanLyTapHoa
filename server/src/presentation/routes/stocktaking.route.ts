import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
  createStocktakingUsecase,
  listStocktakingsUsecase,
  getStocktakingByIdUsecase,
  updateStocktakingUsecase,
} from "../../composition-root";

const router = Router();

router.use(authenticationMiddleware);
router.use(authorizationMiddleware("INVENTORY"));

// Lấy danh sách phiếu kiểm kê
router.get("/", controller(listStocktakingsUsecase));
// Lấy chi tiết phiếu kiểm kê theo id
router.get("/:id", controller(getStocktakingByIdUsecase));
router.post("/", controller(createStocktakingUsecase));

// Cập nhật phiếu kiểm kê (có validate tồn kho âm)
router.put("/:id", controller(updateStocktakingUsecase));

// Xóa phiếu kiểm kê - Không cho phép theo rule
router.delete("/:id", (req, res) => {
  res.status(400).jsend.fail(
    "Không thể xóa phiếu kiểm kê đã tạo vì sẽ ảnh hưởng đến lịch sử xuất nhập tồn. Vui lòng tạo phiếu kiểm kê mới để điều chỉnh nếu cần."
  );
});

export default router;
