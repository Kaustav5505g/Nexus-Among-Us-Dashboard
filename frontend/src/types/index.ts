export type RoomType =
  | 'Electrical'
  | 'Reactor'
  | 'MedBay'
  | 'Navigation'
  | 'Admin'
  | 'Weapons'
  | 'O2'
  | 'Cafeteria'
  | 'Communications';

export type SabotageType = 'reactor' | 'oxygen' | 'lights' | 'comms' | null;

export type AdminRole = 'super_admin' | 'admin' | 'moderator'; // moderator = Point of Contact (POC)

export interface RolePermissions {
  levelName: string;
  levelNumber: number;
  canStartEvent: boolean;
  canPauseEvent: boolean;
  canEndEvent: boolean;
  canToggleImpostorPowers: boolean;
  canAllotRoomsAndImpostors: boolean;
  canAddTeam: boolean;
  canEditTeam: boolean;
  canDeleteTeam: boolean;
  canTriggerSabotage: boolean;
  canCallEmergency: boolean;
  canManageAdmins: boolean;
  canManageTasksAndClues: boolean;
}

export interface AdminUser {
  id: string;
  facilitatorId?: string;
  username: string;
  name: string;
  email: string;
  role: AdminRole;
  pocRoom?: RoomType; // If assigned as room POC
  title?: string;
  password?: string;
}

export interface Team {
  id: string;
  name: string;
  leaderName: string;
  email: string;
  phone: string;
  members: string[];
  color: string;
  score: number;
  tasksCompleted: number;
  cluesSolved: number;
  status: 'active' | 'eliminated' | 'winner';
  registeredEvents: string[];
  badgeCode: string;
  assignedRoom?: RoomType;
  isImpostor?: boolean;
  impostorPlayerName?: string;
  createdAt: string;
}

export interface StationTask {
  id: string;
  title: string;
  room: RoomType;
  description: string;
  snippet?: string;
  clueHint?: string;
  flagAnswer?: string;
  points: number;
  status: 'pending' | 'in_progress' | 'completed';
  completedByTeamId?: string;
  completedAt?: string;
}

export interface SabotageState {
  active: boolean;
  type: SabotageType;
  title: string;
  description: string;
  durationSeconds: number;
  timeRemaining: number;
  triggeredAt: number | null;
}

export interface EmergencyMeetingState {
  active: boolean;
  caller: string | null;
  reason: string | null;
  timeRemaining: number;
  votes: Record<string, string>;
}

export interface MysteryClue {
  id: string;
  caseFile: string;
  title: string;
  difficulty: 'Novice' | 'Investigator' | 'Cyber Detective';
  location: string;
  description: string;
  puzzleContent: string;
  hint: string;
  points: number;
  solvedByTeamIds: string[];
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  type: 'task' | 'sabotage' | 'emergency' | 'clue' | 'kill' | 'system';
  message: string;
  teamName?: string;
  severity?: 'info' | 'warning' | 'danger' | 'success';
}

export interface GameState {
  matchId: string;
  matchName: string;
  status: 'waiting' | 'in_progress' | 'emergency' | 'ended';
  crewmatesAlive: number;
  impostorsCount: number;
  totalTasks: number;
  completedTasksCount: number;
  sabotage: SabotageState;
  emergency: EmergencyMeetingState;
  startedAt: string | null;
}

export interface EventControlState {
  status: 'standby' | 'running' | 'paused' | 'ended';
  impostorPowersActive: boolean;
  elapsedSeconds: number;
  currentRound: number;
  activeSabotage: SabotageType;
  emergencyActive: boolean;
  pausedBy?: string;
}
