import { Request, Response } from 'express';
import { gameService } from '../services/gameService';
import { isSupabaseConfigured, supabase } from '../config/supabase';

type DatabaseTeam = {
  id: string;
  name: string;
  leader_name: string | null;
  members: unknown;
  status: string | null;
  badge_code: string | null;
  assigned_room: string | null;
  is_impostor: boolean | null;
  impostor_player_name: string | null;
};

const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

const readPlayerSession = async (teamId: string, playerName: string) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase configuration is missing or still contains placeholders. Update the root .env with your project URL and anon key, then restart the backend.');
  }

  const normalizedTeamId = teamId.trim().toUpperCase();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalizedTeamId);
  let team: DatabaseTeam | null = null;

  const badgeResult = await supabase
    .from('teams')
    .select('id, name, leader_name, members, status, badge_code, assigned_room, is_impostor, impostor_player_name')
    .eq('badge_code', normalizedTeamId)
    .maybeSingle();
  if (badgeResult.error) {
    console.error('Supabase player team lookup failed:', badgeResult.error);
    throw new Error('Player sign-in could not reach the team database.');
  }
  team = badgeResult.data as DatabaseTeam | null;

  if (!team && isUuid) {
    const idResult = await supabase
      .from('teams')
      .select('id, name, leader_name, members, status, badge_code, assigned_room, is_impostor, impostor_player_name')
      .eq('id', normalizedTeamId)
      .maybeSingle();
    if (idResult.error) {
      console.error('Supabase player team lookup failed:', idResult.error);
      throw new Error('Player sign-in could not reach the team database.');
    }
    team = idResult.data as DatabaseTeam | null;
  }

  const members = Array.isArray(team?.members) ? team.members : [];
  const memberNames = members
    .map((member) => {
      if (typeof member === 'string') return member;
      if (member && typeof member === 'object' && 'name' in member && typeof member.name === 'string') {
        return member.name;
      }
      return '';
    })
    .filter(Boolean);
  if (team?.leader_name) memberNames.push(team.leader_name);

  if (!team || team.status !== 'active' || !memberNames.some((name) => normalizeName(name) === normalizeName(playerName))) {
    return null;
  }

  const sessionResult = await supabase
    .from('event_controls')
    .select('id, status, current_round, elapsed_seconds, active_sabotage, emergency_active, updated_at')
    .eq('id', 'primary_match')
    .maybeSingle();
  if (sessionResult.error) {
    console.error('Supabase event session lookup failed:', sessionResult.error);
    throw new Error('The event session could not be loaded from the database.');
  }
  if (!sessionResult.data) {
    throw new Error('No event session is configured in the database.');
  }

  const isImpostor = Boolean(team.is_impostor);
  const impostorPlayerName = team.impostor_player_name;
  const isDesignatedImpostor =
    isImpostor &&
    (typeof impostorPlayerName !== 'string' ||
      normalizeName(impostorPlayerName) === normalizeName(playerName));
  return {
    team: {
      id: team.id,
      name: team.name,
      teamCode: team.badge_code || team.id,
      status: team.status,
      assignedRoom: team.assigned_room,
      isImpostor: isDesignatedImpostor,
      isImpostorTeam: isImpostor,
      impostorPlayerName: team.impostor_player_name,
    },
    player: {
      name: playerName.trim().replace(/\s+/g, ' '),
      role: isDesignatedImpostor ? 'impostor' : 'crewmate',
      isDesignatedImpostor,
    },
    eventSession: {
      id: sessionResult.data.id,
      status: sessionResult.data.status,
      currentRound: sessionResult.data.current_round,
      elapsedSeconds: sessionResult.data.elapsed_seconds,
      activeSabotage: sessionResult.data.active_sabotage,
      emergencyActive: sessionResult.data.emergency_active,
      updatedAt: sessionResult.data.updated_at,
    },
  };
};

const getPlayerCredentials = (body: unknown) => {
  if (!body || typeof body !== 'object') return null;
  const { teamId, playerName } = body as Record<string, unknown>;
  if (
    typeof teamId !== 'string' ||
    !/^[a-z0-9][a-z0-9-]{1,39}$/i.test(teamId.trim()) ||
    typeof playerName !== 'string' ||
    playerName.trim().length < 2 ||
    playerName.trim().length > 60 ||
    /[\u0000-\u001f\u007f]/u.test(playerName)
  ) {
    return null;
  }
  return { teamId: teamId.trim(), playerName: playerName.trim().replace(/\s+/g, ' ') };
};

export const loginPlayer = async (req: Request, res: Response) => {
  const credentials = getPlayerCredentials(req.body);
  if (!credentials) {
    return res.status(400).json({
      success: false,
      message: 'Enter a valid Team ID and a player name between 2 and 60 characters.',
    });
  }

  try {
    const data = await readPlayerSession(credentials.teamId, credentials.playerName);
    if (!data) {
      return res.status(401).json({ success: false, message: 'Team ID or player name was not recognized.' });
    }
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Player sign-in failed:', error);
    return res.status(503).json({
      success: false,
      message: error instanceof Error ? error.message : 'Player sign-in is temporarily unavailable.',
    });
  }
};

export const getPlayerSession = async (req: Request, res: Response) => {
  const credentials = getPlayerCredentials(req.body);
  if (!credentials) {
    return res.status(400).json({
      success: false,
      message: 'A valid Team ID and player name are required to refresh the player session.',
    });
  }

  try {
    const data = await readPlayerSession(credentials.teamId, credentials.playerName);
    if (!data) {
      return res.status(401).json({ success: false, message: 'Player session is no longer valid.' });
    }
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Player session refresh failed:', error);
    return res.status(503).json({
      success: false,
      message: error instanceof Error ? error.message : 'Player session is temporarily unavailable.',
    });
  }
};

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
