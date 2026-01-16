import { Router } from 'express';
import { WeddingInvitationController as invitationController } from '../controllers/weddingInvitationController.js';

const router: Router = Router();

// Invitation routes
router.post(
    '/wedding',
    invitationController
);

export default router;
