import { Router } from 'express';
import { ActivateController } from '../controllers/activateController.js';

// Explicitly type the router
const router: Router = Router();

router.get('/', ActivateController.get);
router.post('/', ActivateController.create);

export default router;