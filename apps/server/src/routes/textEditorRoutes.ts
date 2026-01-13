import { Router } from 'express';
import { TextEditorController} from '../controllers/textEditorController.js';

const router: Router = Router();

router.post('/', TextEditorController);
export default router;
