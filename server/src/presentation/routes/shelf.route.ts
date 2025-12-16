import { Router } from "express";
import { controller } from "../controllers/controller";
import { getShelvesUsecase } from "../../composition-root";

const router = Router();

// GET all shelves with racks and slots
router.get("/", controller(getShelvesUsecase));

export default router;
