import { Router } from 'express';
import {
  getTeams,
  getTeamById,
  getPlayerSession,
  loginPlayer,
  registerTeam,
} from '../controllers/teamController';

const router = Router();

router.post('/login', loginPlayer);
router.post('/session', getPlayerSession);
router.get('/', getTeams);
router.get('/:id', getTeamById);
router.post('/register', registerTeam);

export default router;
