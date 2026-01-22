import { Router } from 'express';
import { AiProxyController } from '../controllers/aiProxyController.js';

const router: Router = Router();

router.post('/proxy', AiProxyController.execute);
router.get('/models', AiProxyController.listModels);

export default router;