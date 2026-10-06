import { Team, RoomRecord, PlayerMember, AdminUser, ActivityLogItem } from '../types';
import { INITIAL_ADMIN_TEAMS, INITIAL_ROOMS } from '../data/initialAdminData';

const ROOMS_STORAGE_KEY = 'nexus_rooms_v2';
const TEAMS_STORAGE_KEY = 'nexus_teams_v2';
const STAFF_STORAGE_KEY = 'nexus_admin_staff_v2';
const LOGS_STORAGE_KEY = 'nexus_activity_logs_v2';

const INITIAL_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'system',
    message: 'System initialized. 6 Sector Rooms and 5 Teams active.',
    severity: 'info',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    type: 'impostor_assign',
    message: 'Team 2 (NX-T2) designated as covert IMPOSTOR in Room 2 (Zone A).',
    teamId: 'NX-T2',
    teamName: 'Team 2',
    roomName: 'Room 2',
    severity: 'danger',
  },
];


const INITIAL_STAFF_USERS: AdminUser[] = [
  {
    id: 'NX-SUPER-01',
    facilitatorId: 'NX-SUPER-01',
    username: 'NX-SUPER-01',
    name: 'Tejas Narula',
    title: 'Lead Operations Facilitator (Master Admin)',
    role: 'super_admin',
    email: 'tejas@nexus.org',
    password: 'master2026',
  },
  {
    id: 'NX-ADMIN-02',
    facilitatorId: 'NX-ADMIN-02',
    username: 'NX-ADMIN-02',
    name: 'Aarav Sharma',
    title: 'Station Operations Admin',
    role: 'admin',
    email: 'aarav@nexus.org',
    password: 'admin2026',
  },
  {
    id: 'NX-POC-03',
    facilitatorId: 'NX-POC-03',
    username: 'NX-POC-03',
    name: 'Zoya Khan',
    title: 'Field Moderator & Sector POC',
    role: 'moderator',
    email: 'zoya@nexus.org',
    pocRoom: 'Reactor',
    password: 'poc2026',
  },
];


// Cryptographically secure ID generator
function generateId(prefix: string): string {
  const array = new Uint32Array(2);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
    return `${prefix}-${array[0].toString(36)}-${array[1].toString(36)}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000).toString(36)}`;
}

// Ensure members are normalized into PlayerMember objects
export function normalizeTeamMembers(team: Team): PlayerMember[] {
  if (team.memberDetails && Array.isArray(team.memberDetails) && team.memberDetails.length > 0) {
    return team.memberDetails;
  }
  if (team.members && Array.isArray(team.members)) {
    return team.members.map((m, idx) => {
      if (typeof m === 'string') {
        return {
          id: `${team.id}-m-${idx + 1}`,
          name: m,
          assignedRoomId: team.assignedRoomId,
          assignedRoomName: team.assignedRoomName,
          assignedZone: team.assignedZone,
        };
      }
      return m as PlayerMember;
    });
  }
  return [];
}

export const AllocationDatabase = {
  // -------------------------------------------------------------
  // ROOMS & ZONES MANAGEMENT
  // -------------------------------------------------------------
  getRooms(): RoomRecord[] {
    try {
      const stored = localStorage.getItem(ROOMS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored rooms from localStorage', e);
    }
    // Initialize with default rooms
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(INITIAL_ROOMS));
    return INITIAL_ROOMS;
  },

  saveRooms(rooms: RoomRecord[]): void {
    try {
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
    } catch (e) {
      console.error('Failed to save rooms to localStorage', e);
    }
  },

  createRoom(room: Omit<RoomRecord, 'id'>): RoomRecord {
    const rooms = this.getRooms();
    const newRoom: RoomRecord = {
      ...room,
      id: generateId('room'),
    };
    const updated = [...rooms, newRoom];
    this.saveRooms(updated);
    return newRoom;
  },

  updateRoom(id: string, updates: Partial<RoomRecord>): RoomRecord[] {
    const rooms = this.getRooms();
    const updated = rooms.map(r => (r.id === id ? { ...r, ...updates } : r));
    this.saveRooms(updated);

    // If room name or zone changed, update all teams and players assigned to this room
    if (updates.name || updates.zone) {
      const teams = this.getTeams();
      const targetRoom = updated.find(r => r.id === id);
      if (targetRoom) {
        const updatedTeams = teams.map(t => {
          let teamModified = false;
          let newTeam = { ...t };
          if (newTeam.assignedRoomId === id) {
            newTeam.assignedRoomName = targetRoom.name;
            newTeam.assignedZone = targetRoom.zone;
            teamModified = true;
          }
          if (newTeam.memberDetails) {
            newTeam.memberDetails = newTeam.memberDetails.map(m => {
              if (m.assignedRoomId === id) {
                return {
                  ...m,
                  assignedRoomName: targetRoom.name,
                  assignedZone: targetRoom.zone,
                };
              }
              return m;
            });
          }
          return newTeam;
        });
        this.saveTeams(updatedTeams);
      }
    }

    return updated;
  },

  deleteRoom(id: string): RoomRecord[] {
    const rooms = this.getRooms();
    const updated = rooms.filter(r => r.id !== id);
    this.saveRooms(updated);

    // Unassign teams and players that were in this room
    const teams = this.getTeams();
    const updatedTeams = teams.map(t => {
      let newTeam = { ...t };
      if (newTeam.assignedRoomId === id) {
        delete newTeam.assignedRoomId;
        delete newTeam.assignedRoomName;
        delete newTeam.assignedZone;
      }
      if (newTeam.memberDetails) {
        newTeam.memberDetails = newTeam.memberDetails.map(m => {
          if (m.assignedRoomId === id) {
            return {
              ...m,
              assignedRoomId: undefined,
              assignedRoomName: undefined,
              assignedZone: undefined,
            };
          }
          return m;
        });
      }
      return newTeam;
    });
    this.saveTeams(updatedTeams);

    return updated;
  },

  // -------------------------------------------------------------
  // TEAMS & PLAYERS MANAGEMENT
  // -------------------------------------------------------------
  getTeams(): Team[] {
    try {
      const stored = localStorage.getItem(TEAMS_STORAGE_KEY);
      if (stored) {
        const parsed: Team[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize memberDetails and ensure teamCode
          return parsed.map((t, idx) => ({
            ...t,
            teamCode: t.teamCode || `NX-T${idx + 1}`,
            memberDetails: normalizeTeamMembers(t),
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored teams from localStorage', e);
    }
    // Initialize with default teams
    const initialized = INITIAL_ADMIN_TEAMS.map((t, idx) => ({
      ...t,
      teamCode: t.teamCode || `NX-T${idx + 1}`,
      memberDetails: normalizeTeamMembers(t),
    }));
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(initialized));
    return initialized;
  },

  saveTeams(teams: Team[]): void {
    try {
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
    } catch (e) {
      console.error('Failed to save teams to localStorage', e);
    }
  },

  createTeam(teamData: {
    name: string;
    leaderName?: string;
    phone?: string;
    email?: string;
    notes?: string;
    memberNames?: string[];
    playerList?: { name: string; regNo?: string; phone?: string; email?: string }[];
  }): Team {
    const teams = this.getTeams();
    const teamId = generateId('team');
    const teamCode = `NX-T${teams.length + 1}`;

    let members: PlayerMember[] = [];
    if (teamData.playerList && teamData.playerList.length > 0) {
      members = teamData.playerList
        .filter(p => p.name && p.name.trim())
        .map(p => ({
          id: generateId('player'),
          name: p.name.trim(),
          regNo: p.regNo?.trim(),
          phone: p.phone?.trim(),
          email: p.email?.trim(),
        }));
    } else if (teamData.memberNames) {
      members = teamData.memberNames
        .filter(n => n && n.trim())
        .map(name => ({
          id: generateId('player'),
          name: name.trim(),
        }));
    }

    const newTeam: Team = {
      id: teamId,
      teamCode,
      name: teamData.name.trim(),
      leaderName: teamData.leaderName?.trim(),
      phone: teamData.phone?.trim() || '',
      email: teamData.email?.trim() || '',
      notes: teamData.notes?.trim() || '',
      members: members.map(m => m.name),
      memberDetails: members,
      createdAt: new Date().toISOString(),
    };

    const updated = [newTeam, ...teams];
    this.saveTeams(updated);
    return newTeam;
  },

  updateTeam(id: string, updates: Partial<Team>): Team[] {
    const teams = this.getTeams();
    const updated = teams.map(t => {
      if (t.id === id) {
        const next = { ...t, ...updates };
        if (updates.members && !updates.memberDetails) {
          next.memberDetails = normalizeTeamMembers(next);
        }
        return next;
      }
      return t;
    });
    this.saveTeams(updated);
    return updated;
  },

  deleteTeam(id: string): Team[] {
    const teams = this.getTeams();
    const updated = teams.filter(t => t.id !== id);
    this.saveTeams(updated);
    return updated;
  },

  addPlayerToTeam(
    teamId: string,
    player: { name: string; regNo?: string; phone?: string; email?: string }
  ): Team[] {
    const teams = this.getTeams();
    const updated = teams.map(t => {
      if (t.id === teamId) {
        const currentMembers = t.memberDetails || normalizeTeamMembers(t);
        const newPlayer: PlayerMember = {
          id: generateId('player'),
          name: player.name.trim(),
          regNo: player.regNo?.trim(),
          phone: player.phone?.trim(),
          email: player.email?.trim(),
          assignedRoomId: t.assignedRoomId,
          assignedRoomName: t.assignedRoomName,
          assignedZone: t.assignedZone,
        };
        const nextMembers = [...currentMembers, newPlayer];
        return {
          ...t,
          members: nextMembers.map(m => m.name),
          memberDetails: nextMembers,
        };
      }
      return t;
    });
    this.saveTeams(updated);
    return updated;
  },

  removePlayerFromTeam(teamId: string, playerId: string): Team[] {
    const teams = this.getTeams();
    const updated = teams.map(t => {
      if (t.id === teamId) {
        const currentMembers = t.memberDetails || normalizeTeamMembers(t);
        const nextMembers = currentMembers.filter(m => m.id !== playerId);
        return {
          ...t,
          members: nextMembers.map(m => m.name),
          memberDetails: nextMembers,
        };
      }
      return t;
    });
    this.saveTeams(updated);
    return updated;
  },

  // -------------------------------------------------------------
  // ALLOCATION ACTIONS (TEAMS & PLAYERS TO ROOMS)
  // -------------------------------------------------------------
  allocateTeamToRoom(teamId: string, roomId: string | null): Team[] {
    const rooms = this.getRooms();
    const targetRoom = roomId ? rooms.find(r => r.id === roomId) : null;
    const teams = this.getTeams();

    const updated = teams.map(t => {
      if (t.id === teamId) {
        const currentMembers = t.memberDetails || normalizeTeamMembers(t);
        if (!targetRoom) {
          // Unassign
          return {
            ...t,
            assignedRoomId: undefined,
            assignedRoomName: undefined,
            assignedZone: undefined,
            memberDetails: currentMembers.map(m => ({
              ...m,
              assignedRoomId: undefined,
              assignedRoomName: undefined,
              assignedZone: undefined,
            })),
          };
        }
        // Assign to room
        return {
          ...t,
          assignedRoomId: targetRoom.id,
          assignedRoomName: targetRoom.name,
          assignedZone: targetRoom.zone,
          memberDetails: currentMembers.map(m => ({
            ...m,
            assignedRoomId: targetRoom.id,
            assignedRoomName: targetRoom.name,
            assignedZone: targetRoom.zone,
          })),
        };
      }
      return t;
    });

    this.saveTeams(updated);
    return updated;
  },

  allocatePlayerToRoom(teamId: string, playerId: string, roomId: string | null): Team[] {
    const rooms = this.getRooms();
    const targetRoom = roomId ? rooms.find(r => r.id === roomId) : null;
    const teams = this.getTeams();

    const updated = teams.map(t => {
      if (t.id === teamId) {
        const currentMembers = t.memberDetails || normalizeTeamMembers(t);
        const updatedMembers = currentMembers.map(m => {
          if (m.id === playerId) {
            if (!targetRoom) {
              return {
                ...m,
                assignedRoomId: undefined,
                assignedRoomName: undefined,
                assignedZone: undefined,
              };
            }
            return {
              ...m,
              assignedRoomId: targetRoom.id,
              assignedRoomName: targetRoom.name,
              assignedZone: targetRoom.zone,
            };
          }
          return m;
        });

        // Check if all members now belong to the same room
        const roomIds = Array.from(new Set(updatedMembers.map(m => m.assignedRoomId).filter(Boolean)));
        let teamRoomId = t.assignedRoomId;
        let teamRoomName = t.assignedRoomName;
        let teamZone = t.assignedZone;

        if (roomIds.length === 1 && updatedMembers.every(m => m.assignedRoomId)) {
          teamRoomId = targetRoom?.id;
          teamRoomName = targetRoom?.name;
          teamZone = targetRoom?.zone;
        } else if (roomIds.length > 1) {
          teamRoomName = 'Split across rooms';
        }

        return {
          ...t,
          assignedRoomId: teamRoomId,
          assignedRoomName: teamRoomName,
          assignedZone: teamZone,
          memberDetails: updatedMembers,
        };
      }
      return t;
    });

    this.saveTeams(updated);
    return updated;
  },

  // Auto-allot all unassigned teams evenly across available rooms
  autoAllotUnassignedTeams(): Team[] {
    const rooms = this.getRooms();
    if (rooms.length === 0) return this.getTeams();

    const teams = this.getTeams();
    let currentRoomIndex = 0;

    const updated = teams.map(t => {
      if (!t.assignedRoomId) {
        const assignedRoom = rooms[currentRoomIndex % rooms.length];
        currentRoomIndex++;

        const currentMembers = t.memberDetails || normalizeTeamMembers(t);
        return {
          ...t,
          assignedRoomId: assignedRoom.id,
          assignedRoomName: assignedRoom.name,
          assignedZone: assignedRoom.zone,
          memberDetails: currentMembers.map(m => ({
            ...m,
            assignedRoomId: assignedRoom.id,
            assignedRoomName: assignedRoom.name,
            assignedZone: assignedRoom.zone,
          })),
        };
      }
      return t;
    });

    this.saveTeams(updated);
    return updated;
  },

  // Reset all room allocations
  resetAllAllocations(): Team[] {
    const teams = this.getTeams();
    const updated = teams.map(t => {
      const currentMembers = t.memberDetails || normalizeTeamMembers(t);
      return {
        ...t,
        assignedRoomId: undefined,
        assignedRoomName: undefined,
        assignedZone: undefined,
        memberDetails: currentMembers.map(m => ({
          ...m,
          assignedRoomId: undefined,
          assignedRoomName: undefined,
          assignedZone: undefined,
        })),
      };
    });
    this.saveTeams(updated);
    return updated;
  },

  // -------------------------------------------------------------
  // STAFF & USER MANAGEMENT (MASTER ADMIN, SUB-ADMIN, MODERATOR)
  // -------------------------------------------------------------
  getStaffUsers(): AdminUser[] {
    try {
      const stored = localStorage.getItem(STAFF_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse staff users from localStorage', e);
    }
    try {
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(INITIAL_STAFF_USERS));
    } catch (e) {}
    return INITIAL_STAFF_USERS;
  },

  saveStaffUsers(users: AdminUser[]): void {
    try {
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save staff users to localStorage', e);
    }
  },

  createStaffUser(user: Omit<AdminUser, 'id'>): AdminUser {
    const users = this.getStaffUsers();
    const newUser: AdminUser = {
      ...user,
      id: generateId('staff'),
      facilitatorId: user.facilitatorId || user.username,
    };
    const updated = [...users, newUser];
    this.saveStaffUsers(updated);
    return newUser;
  },

  updateStaffUser(id: string, updates: Partial<AdminUser>): AdminUser[] {
    const users = this.getStaffUsers();
    const updated = users.map(u => (u.id === id ? { ...u, ...updates } : u));
    this.saveStaffUsers(updated);
    return updated;
  },

  deleteStaffUser(id: string): AdminUser[] {
    const users = this.getStaffUsers();
    // Protect primary master admin from deletion
    const target = users.find(u => u.id === id);
    if (target && target.role === 'super_admin' && target.id === 'NX-SUPER-01') {
      return users;
    }
    const updated = users.filter(u => u.id !== id);
    this.saveStaffUsers(updated);
    return updated;
  },

  // -------------------------------------------------------------
  // IMPOSTOR SELECTION & ROLE OVERRIDES PER ROOM
  // -------------------------------------------------------------
  setTeamImpostor(teamId: string, isImpostor: boolean): Team[] {
    const teams = this.getTeams();
    const updated = teams.map(t => (t.id === teamId ? { ...t, isImpostor } : t));
    this.saveTeams(updated);

    const target = updated.find(t => t.id === teamId);
    if (target) {
      this.addLog({
        type: 'impostor_assign',
        message: isImpostor
          ? `Team ${target.name} (${target.teamCode || target.id}) set as IMPOSTOR in ${target.assignedRoomName || 'unassigned'}.`
          : `Team ${target.name} (${target.teamCode || target.id}) set as CREWMATE.`,
        teamId: target.teamCode || target.id,
        teamName: target.name,
        roomName: target.assignedRoomName,
        severity: isImpostor ? 'danger' : 'info',
      });
    }

    return updated;
  },

  setRoomImpostor(roomId: string, targetTeamId: string | null): Team[] {
    const teams = this.getTeams();
    const rooms = this.getRooms();
    const room = rooms.find(r => r.id === roomId);

    const updated = teams.map(t => {
      if (t.assignedRoomId === roomId) {
        return {
          ...t,
          isImpostor: targetTeamId ? t.id === targetTeamId : false,
        };
      }
      return t;
    });

    this.saveTeams(updated);

    if (targetTeamId) {
      const chosen = updated.find(t => t.id === targetTeamId);
      if (chosen) {
        this.addLog({
          type: 'impostor_assign',
          message: `Admin override in ${room?.name || roomId}: Team ${chosen.name} (${chosen.teamCode || chosen.id}) set as IMPOSTOR.`,
          teamId: chosen.teamCode || chosen.id,
          teamName: chosen.name,
          roomName: room?.name,
          severity: 'danger',
        });
      }
    } else {
      this.addLog({
        type: 'impostor_assign',
        message: `All teams in ${room?.name || roomId} reset to CREWMATE.`,
        roomName: room?.name,
        severity: 'info',
      });
    }

    return updated;
  },

  rollRandomImpostorInRoom(roomId: string): { updatedTeams: Team[]; selectedTeam: Team | null } {
    const teams = this.getTeams();
    const rooms = this.getRooms();
    const room = rooms.find(r => r.id === roomId);
    const roomTeams = teams.filter(t => t.assignedRoomId === roomId);

    if (roomTeams.length === 0) {
      return { updatedTeams: teams, selectedTeam: null };
    }

    // Cryptographically secure random selection
    let randomIndex = 0;
    if (typeof window !== 'undefined' && window.crypto) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      randomIndex = array[0] % roomTeams.length;
    } else {
      randomIndex = Math.floor(Math.random() * roomTeams.length);
    }

    const chosen = roomTeams[randomIndex];

    const updated = teams.map(t => {
      if (t.assignedRoomId === roomId) {
        return {
          ...t,
          isImpostor: t.id === chosen.id,
        };
      }
      return t;
    });

    this.saveTeams(updated);

    this.addLog({
      type: 'impostor_assign',
      message: `🎲 Random Impostor roll in ${room?.name || roomId}: Team ${chosen.name} (${chosen.teamCode || chosen.id}) chosen as IMPOSTOR out of ${roomTeams.length} teams.`,
      teamId: chosen.teamCode || chosen.id,
      teamName: chosen.name,
      roomName: room?.name,
      severity: 'danger',
    });

    return { updatedTeams: updated, selectedTeam: chosen };
  },

  // -------------------------------------------------------------
  // IMPOSTOR POWERS & PLAYER ACTIONS
  // -------------------------------------------------------------
  useImpostorPower(teamId: string, powerName: string, details?: string): ActivityLogItem {
    const teams = this.getTeams();
    const team = teams.find(t => t.id === teamId || t.teamCode?.toLowerCase() === teamId.toLowerCase());

    const logEntry = this.addLog({
      type: 'power',
      message: `⚡ IMPOSTOR POWER: ${team?.name || teamId} activated ${powerName}${details ? ` (${details})` : ''} in ${team?.assignedRoomName || 'assigned room'}!`,
      teamId: team?.teamCode || team?.id,
      teamName: team?.name || teamId,
      roomName: team?.assignedRoomName,
      powerName: powerName,
      severity: 'danger',
    });

    return logEntry;
  },

  // -------------------------------------------------------------
  // ACTIVITY & AUDIT LOGS
  // -------------------------------------------------------------
  getLogs(): ActivityLogItem[] {
    try {
      const stored = localStorage.getItem(LOGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse logs from localStorage', e);
    }
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(INITIAL_ACTIVITY_LOGS));
    } catch (e) {}
    return INITIAL_ACTIVITY_LOGS;
  },

  saveLogs(logs: ActivityLogItem[]): void {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save logs to localStorage', e);
    }
  },

  addLog(entry: Omit<ActivityLogItem, 'id' | 'timestamp'> & { timestamp?: string }): ActivityLogItem {
    const logs = this.getLogs();
    const newLog: ActivityLogItem = {
      ...entry,
      id: generateId('log'),
      timestamp: entry.timestamp || new Date().toISOString(),
    };
    // Keep last 500 logs
    const updated = [newLog, ...logs].slice(0, 500);
    this.saveLogs(updated);
    return newLog;
  },

  clearLogs(): void {
    this.saveLogs([]);
  },
};

// Backward compatibility GameDatabase alias for any existing imports
export const GameDatabase = {
  ...AllocationDatabase,
  getTeams: () => Promise.resolve(AllocationDatabase.getTeams()),
  subscribeToTeams: (cb: (teams: Team[]) => void) => {
    cb(AllocationDatabase.getTeams());
    return () => {};
  },
};
