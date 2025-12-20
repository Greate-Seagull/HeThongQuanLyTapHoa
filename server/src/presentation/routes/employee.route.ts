import { Router } from "express";
import { createEmployeeWithAccountUsecase } from "../../composition-root";

const router = Router();

// Tạo nhân viên mới (có cả account)
router.post("/", async (req, res) => {
	const { name, username, password, position } = req.body;
	try {
		const employee = await createEmployeeWithAccountUsecase.execute({ name, username, password, position });
		res.status(201).json({ status: "success", data: employee });
	} catch (err: any) {
		res.status(400).json({ status: "fail", message: err.message });
	}
});

export default router;
