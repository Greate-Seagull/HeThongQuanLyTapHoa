import { Router } from "express"
import { searchProductsController } from '../../composition-root.js';

const router = Router()

router.get('/', async (req, res) => searchProductsController.execute(req, res));

export default router