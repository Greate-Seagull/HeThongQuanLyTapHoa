import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import { 
    createInvoiceUsecase,
    getMyInvoicesUsecase,
    getInvoicesUsecase,
    getInvoiceByIdUsecase 
} from "../../composition-root";

const router = Router();
router.use(authenticationMiddleware);
// router.use(authorizationMiddleware("SALES"));
router.post("/", controller(createInvoiceUsecase));
router.get("/mine", (req, res) => {
	const authId = (req as any).authId || (req as any).user?.id;
	if (!authId) return res.status(401).jsend.fail("Missing user id");
	return controller(getMyInvoicesUsecase)({ ...req, authId }, res);
});
router.get("/", controller(getInvoicesUsecase));
router.get("/:id", controller(getInvoiceByIdUsecase));

export default router;
