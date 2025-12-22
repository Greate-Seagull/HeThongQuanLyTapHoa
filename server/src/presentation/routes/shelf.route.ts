import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
	getShelvesUsecase,
	createShelfUsecase,
	updateShelfUsecase,
	deleteShelfUsecase,
} from "../../composition-root";

const router = Router();

router.use(authenticationMiddleware);

router.get("/", controller(getShelvesUsecase));

// router.use(authorizationMiddleware("ADMIN"));
router.post("/", controller(createShelfUsecase));

router.put("/:id", (req, res) => {
	const id = parseInt(req.params.id);
	if (isNaN(id)) {
		return res.status(400).jsend.fail("Invalid shelf ID");
	}
	req.body.id = id;
	return controller(updateShelfUsecase)(req, res);
});

router.delete("/:id", (req, res) => {
	const id = parseInt(req.params.id);
	if (isNaN(id)) {
		return res.status(400).jsend.fail("Invalid shelf ID");
	}
	
	if (!req.body) req.body = {};
	req.body.id = id;
	
	return controller(deleteShelfUsecase)(req, res);
});

export default router;