import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
	createSlotUsecase,
	updateSlotUsecase,
	deleteSlotUsecase,
	listSlotWithProductUsecase,
} from "../../composition-root";

const router = Router();

router.use(authenticationMiddleware);
// router.use(authorizationMiddleware("ADMIN"));



// GET /slots - get all slots (basic info)
import { slotRepo } from '../../composition-root';
router.get("/", async (req, res, next) => {
	try {
		const slots = await slotRepo.getByIds([]); // empty array = get all
		res.jsend.success(slots);
	} catch (err) {
		next(err);
	}
});

router.post("/", controller(createSlotUsecase));
router.put("/:id", controller(updateSlotUsecase));
router.delete("/:id", controller(deleteSlotUsecase));

// GET /slots/list-with-product
router.get("/list-with-product", controller(listSlotWithProductUsecase));

// POST /slots/transfer - Chuyển sản phẩm từ ô này sang ô khác
import { slotDetailUsecase } from '../../composition-root';
router.post("/transfer", async (req, res, next) => {
	try {
		const { fromSlotId, toSlotId, productId, quantity } = req.body;
		
		// Validation
		if (!fromSlotId || !toSlotId || !productId || !quantity) {
			return res.status(400).jsend.fail("Missing required fields: fromSlotId, toSlotId, productId, quantity");
		}

		if (fromSlotId === toSlotId) {
			return res.status(400).jsend.fail("Source and target slots must be different");
		}

		const result = await slotDetailUsecase.transferProduct(
			parseInt(fromSlotId),
			parseInt(toSlotId),
			parseInt(productId),
			parseInt(quantity)
		);

		res.jsend.success({
			message: "Product transferred successfully",
			...result,
		});
	} catch (err: any) {
		res.status(400).jsend.fail(err.message);
	}
});

// PUT /slots/:slotId/quantity - Cập nhật số lượng sản phẩm trong ô
router.put("/:slotId/quantity", async (req, res, next) => {
	try {
		const { slotId } = req.params;
		const { productId, quantity } = req.body;
		
		// Validation
		if (!productId || quantity === undefined) {
			return res.status(400).jsend.fail("Missing required fields: productId, quantity");
		}

		const result = await slotDetailUsecase.updateQuantity(
			parseInt(slotId),
			parseInt(productId),
			parseInt(quantity)
		);

		res.jsend.success({
			message: "Quantity updated successfully",
			slotDetail: result,
		});
	} catch (err: any) {
		res.status(400).jsend.fail(err.message);
	}
});

export default router;