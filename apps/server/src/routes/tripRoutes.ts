import { Router } from 'express';
import { TripController} from '../controllers/tripControler.js';

const router: Router = Router();

router.post('/', TripController);
export default router;