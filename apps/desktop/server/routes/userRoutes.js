import { Router } from 'express';
import { UserController } from '../controllers/userController.js'; // Ensure .js extension
// Explicitly type the router
const router = Router();
router.get('/', UserController.getAll);
router.post('/', UserController.create);
export default router;
