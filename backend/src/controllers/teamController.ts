import { Request, Response } from 'express';
import { gameService } from '../services/gameService';

export const getTeams = (req: Request, res: Response) => {
  try {
    const teams = gameService.getTeams();
    res.json({ success: true, count: teams.length, data: teams });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeamById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const team = gameService.getTeamById(id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    res.json({ success: true, data: team });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const registerTeam = (req: Request, res: Response) => {
  try {
    const { name, leaderName, email, phone, members, color } = req.body;

    if (!name || !leaderName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Team Name, Team Leader Name, and Email are required.',
      });
    }

    const newTeam = gameService.registerTeam({
      name,
      leaderName,
      email,
      phone: phone || '',
      members: Array.isArray(members) ? members : [leaderName],
      color,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Dual-event pass granted for Coded Chaos & Tech Mystery.',
      data: newTeam,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
