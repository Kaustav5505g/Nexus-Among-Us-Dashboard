import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getMysteryClues, verifyMysteryFlag } from '../controllers/mysteryController';

const router = Router();

// Rate limiter to prevent brute-forcing forensic flags
const verifyRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // limit each IP to 15 verification requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many verification attempts from this IP. Please wait a minute before trying again.',
  },
});

router.get('/clues', getMysteryClues);
router.post('/verify', verifyRateLimiter, verifyMysteryFlag);

export default router;
