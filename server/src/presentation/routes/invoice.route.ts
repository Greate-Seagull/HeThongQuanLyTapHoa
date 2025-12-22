import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";
import { controller } from "../controllers/controller";
import { createInvoiceUsecase, getMyInvoicesUsecase } from "../../composition-root";

const router = Router();

router.use(authenticationMiddleware);

router.post(
	"/",
	authorizationMiddleware("SALES"),
	(req, res) => {
		console.log('📥 POST /invoices - authId:', (req as any).authId);
		// ✅ Controller middleware already merges authId
		return controller(createInvoiceUsecase)(req, res);
	}
);

router.get(
	"/my",
	(req, res) => {
		// ✅ FIX: Set authId in body
		req.body.authId = (req as any).authId;
		return controller(getMyInvoicesUsecase)(req, res);
	}
);

export default router;
