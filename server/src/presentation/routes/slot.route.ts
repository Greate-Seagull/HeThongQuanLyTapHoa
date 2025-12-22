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

router.put("/:id", (req, res) => {
	const id = parseInt(req.params.id);
	if (isNaN(id)) {
		return res.status(400).jsend.fail("Invalid slot ID");
	}
	req.body.id = id;
	return controller(updateSlotUsecase)(req, res);
});

router.delete("/:id", (req, res) => {
	const id = parseInt(req.params.id);
	if (isNaN(id)) {
		return res.status(400).jsend.fail("Invalid slot ID");
	}
	
	if (!req.body) req.body = {};
	req.body.id = id;
	
	return controller(deleteSlotUsecase)(req, res);
});

// GET /slots/list-with-product
router.get("/list-with-product", controller(listSlotWithProductUsecase));

export default router;