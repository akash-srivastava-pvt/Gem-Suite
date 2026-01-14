import { Router } from 'express';
import { WeddingInvitationController } from '../controllers/weddingInvitationController.js';

const router: Router = Router();

// Invitation routes
router.post(
    '/wedding',
    WeddingInvitationController
);

export default router;
