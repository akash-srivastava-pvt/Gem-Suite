import { Router } from 'express';
import { UserController } from '../controllers/userController.js';

const router: Router = Router();

router.get('/status', UserController.getStatus);
router.post('/agree', UserController.agree);
router.get('/logs', UserController.getLogs);
router.post('/delete-data', UserController.deleteData);

export default router;
