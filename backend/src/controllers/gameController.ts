import { Request, Response } from 'express';
import { gameService } from '../services/gameService';

export const getGameState = (req: Request, res: Response) => {
  try {
    const state = gameService.getGameState();
    const tasks = gameService.getTasks();
    const logs = gameService.getActivityLogs();
    res.json({
      success: true,
      data: {
        ...state,
        tasks,
        activityLogs: logs,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTasks = (req: Request, res: Response) => {
  try {
    const tasks = gameService.getTasks();
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeTask = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teamId } = req.body;

    if (!teamId) {
      return res.status(400).json({ success: false, message: 'teamId is required to complete task' });
    }

    const result = gameService.completeTask(id, teamId);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const triggerEmergencyMeeting = (req: Request, res: Response) => {
  try {
    const { caller, reason } = req.body;
    const state = gameService.triggerEmergencyMeeting(
      caller || 'Station Crew',
      reason || 'Emergency Meeting Called from Cafeteria Button'
    );
    res.json({ success: true, message: 'Emergency Meeting activated!', data: state.emergency });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const endEmergencyMeeting = (req: Request, res: Response) => {
  try {
    const { ejectedPlayer } = req.body;
    const state = gameService.endEmergencyMeeting(ejectedPlayer);
    res.json({ success: true, message: 'Emergency Meeting ended.', data: state });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActivityFeed = (req: Request, res: Response) => {
  try {
    const logs = gameService.getActivityLogs();
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
