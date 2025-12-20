
import { Router } from "express";
import { createEmployeeWithAccountUsecase, updateEmployeeUsecase } from "../../composition-root";
const router = Router();

// Cập nhật thông tin nhân viên
router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, position } = req.body;
  try {
    const updated = await updateEmployeeUsecase.execute({ id, name, position });
    res.status(200).json({ status: "success", data: updated });
  } catch (err: any) {
    res.status(400).json({ status: "fail", message: err.message });
  }
});

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
