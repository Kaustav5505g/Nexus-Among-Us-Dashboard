import { Router } from 'express';
import { getMysteryClues, verifyMysteryFlag } from '../controllers/mysteryController';

const router = Router();

router.get('/clues', getMysteryClues);
router.post('/verify', verifyMysteryFlag);

export default router;
