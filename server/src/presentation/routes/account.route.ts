import { signInUsecase, signUpUsecase } from "../../composition-root";
import { Router } from "express";
import { controller } from "../controllers/controller";

const router = Router();

//Handlers
router.post("/sign-in", controller(signInUsecase));
router.post("/", controller(signUpUsecase));

export default router;
