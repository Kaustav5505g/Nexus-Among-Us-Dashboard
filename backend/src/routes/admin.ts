import { Router } from 'express';
import {
  triggerSabotage,
  resolveSabotage,
  resetMatch,
  broadcastAnnouncement,
} from '../controllers/adminController';

const router = Router();

router.post('/sabotage', triggerSabotage);
router.post('/sabotage/resolve', resolveSabotage);
router.post('/reset', resetMatch);
router.post('/broadcast', broadcastAnnouncement);

export default router;
