import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import {
	createRackUsecase,
	updateRackUsecase,
	deleteRackUsecase,
} from "../../composition-root";

const router = Router();

router.use(authenticationMiddleware);
// router.use(authorizationMiddleware("ADMIN"));

router.post("/", controller(createRackUsecase));

router.put("/:id", (req, res) => {
	const id = parseInt(req.params.id);
	if (isNaN(id)) {
		return res.status(400).jsend.fail("Invalid rack ID");
	}
	req.body.id = id;
	return controller(updateRackUsecase)(req, res);
});

router.delete("/:id", (req, res) => {
	const id = parseInt(req.params.id);
	if (isNaN(id)) {
		return res.status(400).jsend.fail("Invalid rack ID");
	}
	
	if (!req.body) req.body = {};
	req.body.id = id;
	
	return controller(deleteRackUsecase)(req, res);
});

export default router;