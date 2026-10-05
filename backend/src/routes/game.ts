import { Router } from 'express';
import {
  getGameState,
  getTasks,
  completeTask,
  triggerEmergencyMeeting,
  endEmergencyMeeting,
  getActivityFeed,
} from '../controllers/gameController';

const router = Router();

router.get('/state', getGameState);
router.get('/tasks', getTasks);
router.post('/tasks/:id/complete', completeTask);
router.post('/emergency', triggerEmergencyMeeting);
router.post('/emergency/end', endEmergencyMeeting);
router.get('/activity', getActivityFeed);

export default router;
