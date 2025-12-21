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

export default router;