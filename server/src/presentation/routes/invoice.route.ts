import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { controller } from "../controllers/controller";
import {
	createInvoiceUsecase,
	getMyInvoicesUsecase,
} from "../../composition-root";

const router = Router();

router.use(authenticationMiddleware);

// Tạo hóa đơn (thường dùng cho nhân viên/POS)
router.post("/", controller(createInvoiceUsecase));

// Lấy danh sách hóa đơn của user đang đăng nhập
router.get("/mine", (req, res) => {
	const authId = (req as any).authId || (req as any).user?.id;
	if (!authId) return res.status(401).jsend.fail("Missing user id");
	return controller(getMyInvoicesUsecase)({ ...req, authId }, res);
});

export default router;