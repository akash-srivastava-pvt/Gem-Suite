import { Router } from 'express';
import { ApiKeysController } from '../controllers/apiKeysController.js';

const router: Router = Router();

router.get('/', ApiKeysController.getAll);
router.post('/', ApiKeysController.create);
router.put('/:id/default', ApiKeysController.setDefault);
router.put('/:id/toggle', ApiKeysController.toggleActive);
router.put('/:id/models', ApiKeysController.updateModels);
router.delete('/:id', ApiKeysController.delete);
router.get('/providers', ApiKeysController.getProviders);

export default router;