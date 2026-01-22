import { Router } from 'express';
import { WeddingInvitationController } from '../controllers/weddingInvitationController.js';
import { EventInvitationController } from '../controllers/eventInvitationController.js';
import { GreetingInvitationController } from '../controllers/greetingInvitationController.js';

const router: Router = Router();

// Invitation routes
router.post(
    '/wedding',
    WeddingInvitationController
);

router.post(
    '/event',
    EventInvitationController
);

router.post(
    '/greetings',
    GreetingInvitationController
);

export default router;
