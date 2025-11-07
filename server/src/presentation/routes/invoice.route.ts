import { Router } from "express";
import { controllCreateInvoice } from "../controllers/invoice.controller";

const router = Router();
router.post("/", controllCreateInvoice);

export default router;
