import { Router } from 'express';
import { UnlockController } from '../controllers/unlockController.js';

const router: Router = Router();

router.get('/status', UnlockController.getStatus);

export default router;