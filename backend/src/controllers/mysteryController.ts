import { Request, Response } from 'express';
import { gameService } from '../services/gameService';

export const getMysteryClues = (req: Request, res: Response) => {
  try {
    const clues = gameService.getMysteryClues();
    res.json({ success: true, count: clues.length, data: clues });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyMysteryFlag = (req: Request, res: Response) => {
  try {
    const { clueId, teamId, flag } = req.body;

    if (!clueId || !teamId || !flag) {
      return res.status(400).json({
        success: false,
        message: 'clueId, teamId, and flag/answer are required.',
      });
    }

    const result = gameService.verifyMysteryAnswer(clueId, teamId, flag);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
