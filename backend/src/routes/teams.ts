import { Router } from 'express';
import { getTeams, getTeamById, registerTeam } from '../controllers/teamController';

const router = Router();

router.get('/', getTeams);
router.get('/:id', getTeamById);
router.post('/register', registerTeam);

export default router;
