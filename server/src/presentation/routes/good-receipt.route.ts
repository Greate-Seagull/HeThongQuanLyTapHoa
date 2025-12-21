import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import { createGoodReceiptUsecase } from "../../composition-root";

const router = Router();
router.use(authenticationMiddleware);
router.use(authorizationMiddleware("RECEIVING"));
import { container } from "../../composition-root";

// Lấy danh sách phiếu nhập kho
router.get("/", async (req, res) => {
	try {
		const receipts = await container.goodReceiptRepo.findAll();
		res.jsend.success(receipts);
	} catch (err) {
		res.status(500).jsend.error("Không thể lấy danh sách phiếu nhập kho");
	}
});

// Lấy chi tiết phiếu nhập kho theo id
router.get("/:id", async (req, res) => {
	try {
		const id = Number(req.params.id);
		const receipt = await container.goodReceiptRepo.findById(id);
		if (!receipt) return res.status(404).jsend.fail("Không tìm thấy phiếu nhập kho");
		res.jsend.success(receipt);
	} catch (err) {
		res.status(500).jsend.error("Không thể lấy chi tiết phiếu nhập kho");
	}
});

router.post("/", controller(createGoodReceiptUsecase));

export default router;
