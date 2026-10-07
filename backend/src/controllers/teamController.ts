import { Request, Response } from 'express';
import { gameService } from '../services/gameService';
import { isSupabaseConfigured, supabase } from '../config/supabase';

type DatabaseTeam = {
  id: string;
  name: string;
  leader_name: string | null;
  phone: string | null;
  members: unknown;
  status: string | null;
  badge_code: string | null;
  team_code?: string | null;
  assigned_room: string | null;
  is_impostor: boolean | null;
  impostor_player_name: string | null;
};

const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();
const normalizePhone = (phone: string) => phone.replace(/\D/g, '');

const readPlayerSession = async (teamId: string, credential: string) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase configuration is missing or still contains placeholders. Update the root .env with your project URL and anon key, then restart the backend.');
  }

  const normalizedTeamId = teamId.trim().toUpperCase();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalizedTeamId);
  let team: DatabaseTeam | null = null;

  const selectCols = 'id, name, leader_name, phone, members, status, badge_code, team_code, assigned_room, is_impostor, impostor_player_name';

  // Search by team_code, badge_code, or UUID id
  const lookupQuery = isUuid
    ? supabase.from('teams').select(selectCols).or(`team_code.eq.${normalizedTeamId},badge_code.eq.${normalizedTeamId},id.eq.${normalizedTeamId}`).maybeSingle()
    : supabase.from('teams').select(selectCols).or(`team_code.eq.${normalizedTeamId},badge_code.eq.${normalizedTeamId}`).maybeSingle();

  const lookupResult = await lookupQuery;
  if (lookupResult.error) {
    console.error('Supabase player team lookup failed:', lookupResult.error);
    throw new Error('Player sign-in could not reach the team database.');
  }
  team = lookupResult.data as DatabaseTeam | null;

  if (!team || team.status !== 'active') {
    return null;
  }

  // Check 1: Phone number match against leader mobile number
  const inputPhone = normalizePhone(credential);
  const teamPhone = team.phone ? normalizePhone(team.phone) : '';
  const isPhoneMatch =
    inputPhone.length >= 7 &&
    teamPhone.length >= 7 &&
    (teamPhone.endsWith(inputPhone) || inputPhone.endsWith(teamPhone));

  // Check 2: Member / leader name match (fallback)
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

  const isNameMatch = memberNames.some((name) => normalizeName(name) === normalizeName(credential));

  if (!isPhoneMatch && !isNameMatch) {
    return null;
  }

  const sessionResult = await supabase
    .from('event_controls')
    .select('id, status, current_round, elapsed_seconds, active_sabotage, emergency_active, updated_at')
    .eq('id', 'primary_match')
    .maybeSingle();

  const defaultSession = {
    id: 'primary_match',
    status: 'running',
    current_round: 1,
    elapsed_seconds: 0,
    active_sabotage: null,
    emergency_active: false,
    updated_at: new Date().toISOString(),
  };

  const sessionData = sessionResult?.data || defaultSession;

  const isImpostor = Boolean(team.is_impostor);
  const impostorPlayerName = team.impostor_player_name;
  const isDesignatedImpostor =
    isImpostor &&
    (typeof impostorPlayerName !== 'string' ||
      normalizeName(impostorPlayerName) === normalizeName(credential) ||
      isPhoneMatch);

  const displayName = team.leader_name || 'Team Leader';

  return {
    team: {
      id: team.id,
      name: team.name,
      teamCode: team.team_code || team.badge_code || team.id,
      leaderName: team.leader_name,
      phone: team.phone,
      status: team.status,
      assignedRoom: team.assigned_room,
      isImpostor: isDesignatedImpostor,
      isImpostorTeam: isImpostor,
      impostorPlayerName: team.impostor_player_name,
    },
    player: {
      name: displayName,
      phone: team.phone,
      role: isDesignatedImpostor ? 'impostor' : 'crewmate',
      isDesignatedImpostor,
      isLeader: true,
    },
    eventSession: {
      id: sessionData.id,
      status: sessionData.status,
      currentRound: sessionData.current_round,
      elapsedSeconds: sessionData.elapsed_seconds,
      activeSabotage: sessionData.active_sabotage,
      emergencyActive: sessionData.emergency_active,
      updatedAt: sessionData.updated_at,
    },
  };
};

const getPlayerCredentials = (body: unknown) => {
  if (!body || typeof body !== 'object') return null;
  const { teamId, phone, mobileNumber, playerName } = body as Record<string, unknown>;
  if (
    typeof teamId !== 'string' ||
    !/^[a-z0-9][a-z0-9-]{1,39}$/i.test(teamId.trim())
  ) {
    return null;
  }

  const credential = (
    (typeof phone === 'string' && phone.trim()) ||
    (typeof mobileNumber === 'string' && mobileNumber.trim()) ||
    (typeof playerName === 'string' && playerName.trim()) ||
    ''
  );

  if (!credential || credential.length < 2 || credential.length > 60 || /[\u0000-\u001f\u007f]/u.test(credential)) {
    return null;
  }

  return { teamId: teamId.trim(), credential };
};

export const loginPlayer = async (req: Request, res: Response) => {
  const credentials = getPlayerCredentials(req.body);
  if (!credentials) {
    return res.status(400).json({
      success: false,
      message: 'Enter a valid Team ID and Team Leader Mobile Number.',
    });
  }

  try {
    const data = await readPlayerSession(credentials.teamId, credentials.credential);
    if (!data) {
      return res.status(401).json({ success: false, message: 'Team ID or Leader Mobile Number was not recognized.' });
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

interface CachedSessionItem {
  data: any;
  cachedAt: number;
}
const sessionCache = new Map<string, CachedSessionItem>();
const SESSION_CACHE_TTL = 3000; // 3 seconds TTL

export const getPlayerSession = async (req: Request, res: Response) => {
  const credentials = getPlayerCredentials(req.body);
  if (!credentials) {
    return res.status(400).json({
      success: false,
      message: 'A valid Team ID and Leader Mobile Number are required to refresh the player session.',
    });
  }

  const cacheKey = `${credentials.teamId.toLowerCase()}_${credentials.credential.toLowerCase()}`;
  const cached = sessionCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < SESSION_CACHE_TTL) {
    return res.json({ success: true, data: cached.data });
  }

  try {
    const data = await readPlayerSession(credentials.teamId, credentials.credential);
    if (!data) {
      sessionCache.delete(cacheKey);
      return res.status(401).json({ success: false, message: 'Player session is no longer valid.' });
    }
    sessionCache.set(cacheKey, { data, cachedAt: Date.now() });
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
