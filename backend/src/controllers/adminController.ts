import { Request, Response } from 'express';
import { gameService } from '../services/gameService';

export const triggerSabotage = (req: Request, res: Response) => {
  try {
    const { type, message } = req.body;
    if (!type || !['reactor', 'oxygen', 'lights', 'comms'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sabotage type. Choose reactor, oxygen, lights, or comms.',
      });
    }

    const sabotage = gameService.triggerSabotage(type, message);
    res.json({ success: true, message: `Sabotage [${type}] triggered!`, data: sabotage });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveSabotage = (req: Request, res: Response) => {
  try {
    const { teamId } = req.body;
    const sabotage = gameService.resolveSabotage(teamId);
    res.json({ success: true, message: 'Sabotage resolved.', data: sabotage });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetMatch = (req: Request, res: Response) => {
  try {
    const newState = gameService.resetMatch();
    res.json({ success: true, message: 'Match successfully reset.', data: newState });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const broadcastAnnouncement = (req: Request, res: Response) => {
  try {
    const { message, severity, title } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Announcement message is required.' });
    }

    gameService.addLog('system', `ANNOUNCEMENT: ${message}`, 'Game Master', severity || 'warning');
    res.json({ success: true, message: 'Announcement broadcasted to all terminals.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
