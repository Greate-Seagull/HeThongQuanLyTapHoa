import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { controller } from "../controllers/controller";
import { getShelvesUsecase } from "../../composition-root";

const router = Router();

router.use(authenticationMiddleware);

router.get("/", controller(getShelvesUsecase));

export default router;