import { Router } from "express";

export function createLoginRouter(usecase) {
    const router = Router()
    const controller = new LoginController(usecase)

    router.post("/login", async (req, res) => {
        await controller.execute(req, res)
    })

    return router
}