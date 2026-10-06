import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Building,
  UserPlus,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Phone,
  Download,
  Search,
  ArrowRight,
  RefreshCw,
  LogOut,
  Layers,
  Sparkles,
  AlertCircle,
  X,
  Shield,
  ShieldCheck,
  Crown,
  Zap,
  Skull,
  Dices,
  History,
  Eye,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Team, RoomRecord, PlayerMember, AdminUser, AdminRole, ActivityLogItem } from '../types';
import { AllocationDatabase } from '../lib/gameDatabase';


export default function AmongUsAdmin() {
  const { user, login, logout, isAuthenticated } = useAdminAuth();

  // -------------------------------------------------------------
  // AUTH LOGIN FORM STATE (EMPTY BY DEFAULT, NO DEMO LOGINS)
  // -------------------------------------------------------------
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // -------------------------------------------------------------
  // DASHBOARD DATA STATE
  // -------------------------------------------------------------
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [staffUsers, setStaffUsers] = useState<AdminUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [activeTab, setActiveTab] = useState<'allocation' | 'teams' | 'rooms' | 'users' | 'logs'>('allocation');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'power' | 'impostor_assign' | 'sabotage' | 'login' | 'system'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);


  // -------------------------------------------------------------
  // MODALS STATE
  // -------------------------------------------------------------
  // Room Modal (Add / Edit)
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomRecord | null>(null);
  const [roomForm, setRoomForm] = useState({
    name: '',
    zone: '',
    pocName: '',
    pocContact: '',
  });

  // Team Modal (Add)
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: '',
    playerNames: '',
    assignedRoomId: '',
  });

  // Add Player to Team Modal
  const [personModalOpen, setPersonModalOpen] = useState(false);
  const [targetTeamId, setTargetTeamId] = useState<string | null>(null);
  const [personForm, setPersonForm] = useState({
    name: '',
    phone: '',
  });

  // User / Staff Modal (Add / Edit for Master Admin)
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userForm, setUserForm] = useState<{
    name: string;
    username: string;
    email: string;
    role: AdminRole;
    password: string;
    pocRoom: string;
    title: string;
  }>({
    name: '',
    username: '',
    email: '',
    role: 'admin',
    password: '',
    pocRoom: '',
    title: '',
  });

  // -------------------------------------------------------------
  // INITIAL LOAD & LOG POLLING
  // -------------------------------------------------------------
  useEffect(() => {
    setRooms(AllocationDatabase.getRooms());
    setTeams(AllocationDatabase.getTeams());
    setStaffUsers(AllocationDatabase.getStaffUsers());
    setActivityLogs(AllocationDatabase.getLogs());

    // Auto-poll logs so live player actions & power activations display immediately
    const pollLogs = setInterval(() => {
      setActivityLogs(AllocationDatabase.getLogs());
    }, 3000);
    return () => clearInterval(pollLogs);
  }, []);

  // -------------------------------------------------------------
  // IMPOSTOR SELECTION HANDLERS
  // -------------------------------------------------------------
  const handleRollRandomImpostor = (roomId: string, roomName: string) => {
    const res = AllocationDatabase.rollRandomImpostorInRoom(roomId);
    if (!res.selectedTeam) {
      notify(`No teams in ${roomName} to select from.`);
      return;
    }
    setTeams(res.updatedTeams);
    setActivityLogs(AllocationDatabase.getLogs());
    notify(`🎲 Rolled Impostor in ${roomName}: ${res.selectedTeam.name} (${res.selectedTeam.teamCode || res.selectedTeam.id})`);
  };

  const handleSetRoomImpostor = (roomId: string, targetTeamId: string | null) => {
    const updated = AllocationDatabase.setRoomImpostor(roomId, targetTeamId);
    setTeams(updated);
    setActivityLogs(AllocationDatabase.getLogs());
    const targetTeam = updated.find(t => t.id === targetTeamId);
    if (targetTeam) {
      notify(`Set ${targetTeam.name} as Impostor in room`);
    } else {
      notify('Reset room to all Crewmates');
    }
  };

  const handleToggleTeamImpostor = (teamId: string, currentStatus: boolean | undefined) => {
    const newStatus = !currentStatus;
    const updated = AllocationDatabase.setTeamImpostor(teamId, newStatus);
    setTeams(updated);
    setActivityLogs(AllocationDatabase.getLogs());
    const team = updated.find(t => t.id === teamId);
    notify(`${team?.name} is now ${newStatus ? 'an IMPOSTOR' : 'a CREWMATE'}`);
  };

  const handleClearLogs = () => {
    if (window.confirm('Clear all activity logs? This cannot be undone.')) {
      AllocationDatabase.clearLogs();
      setActivityLogs([]);
      notify('Activity logs cleared');
    }
  };

  const handleExportLogsCSV = () => {
    const rows = [
      ['Timestamp', 'Type', 'Severity', 'Team ID', 'Team Name', 'Room Name', 'Message'],
    ];

    activityLogs.forEach(l => {
      rows.push([
        new Date(l.timestamp).toLocaleString(),
        l.type.toUpperCase(),
        l.severity || 'info',
        l.teamId || '-',
        l.teamName || '-',
        l.roomName || '-',
        `"${(l.message || '').replace(/"/g, '""')}"`
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NEXUS_Activity_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notify('Exported Activity Logs CSV');
  };



  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // -------------------------------------------------------------
  // AUTH HANDLER
  // -------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await login(loginId, loginPassword);
      if (!res.success) {
        setLoginError(res.error || 'Invalid ID or password.');
      }
    } catch {
      setLoginError('Authentication error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // -------------------------------------------------------------
  // ROOM CRUD
  // -------------------------------------------------------------
  const openAddRoom = () => {
    setEditingRoom(null);
    setRoomForm({
      name: `Room ${rooms.length + 1}`,
      zone: 'Zone A',
      pocName: '',
      pocContact: '',
    });
    setRoomModalOpen(true);
  };

  const openEditRoom = (room: RoomRecord) => {
    setEditingRoom(room);
    setRoomForm({
      name: room.name,
      zone: room.zone,
      pocName: room.pocName,
      pocContact: room.pocContact,
    });
    setRoomModalOpen(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.name.trim()) return;

    if (editingRoom) {
      const updated = AllocationDatabase.updateRoom(editingRoom.id, {
        name: roomForm.name.trim(),
        zone: roomForm.zone.trim() || 'Zone A',
        pocName: roomForm.pocName.trim(),
        pocContact: roomForm.pocContact.trim(),
      });
      setRooms(updated);
      setTeams(AllocationDatabase.getTeams());
      notify(`Updated ${roomForm.name}`);
    } else {
      const created = AllocationDatabase.createRoom({
        name: roomForm.name.trim(),
        zone: roomForm.zone.trim() || 'Zone A',
        capacity: 20,
        pocName: roomForm.pocName.trim(),
        pocContact: roomForm.pocContact.trim(),
      });
      setRooms(AllocationDatabase.getRooms());
      notify(`Created ${created.name}`);
    }

    setRoomModalOpen(false);
  };

  const handleDeleteRoom = (roomId: string, roomName: string) => {
    if (window.confirm(`Delete ${roomName}? Teams in this room will become unassigned.`)) {
      const updated = AllocationDatabase.deleteRoom(roomId);
      setRooms(updated);
      setTeams(AllocationDatabase.getTeams());
      notify(`Deleted ${roomName}`);
    }
  };

  // -------------------------------------------------------------
  // TEAM CRUD
  // -------------------------------------------------------------
  const openAddTeam = () => {
    setTeamForm({
      name: `Team ${teams.length + 1}`,
      playerNames: '',
      assignedRoomId: '',
    });
    setTeamModalOpen(true);
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.name.trim()) return;

    const names = teamForm.playerNames
      .split(/[\n,]+/)
      .map(n => n.trim())
      .filter(Boolean);

    const created = AllocationDatabase.createTeam({
      name: teamForm.name.trim(),
      memberNames: names,
    });

    if (teamForm.assignedRoomId) {
      AllocationDatabase.allocateTeamToRoom(created.id, teamForm.assignedRoomId);
    }

    setTeams(AllocationDatabase.getTeams());
    notify(`Added ${created.name} (${names.length} players)`);
    setTeamModalOpen(false);
  };

  const handleDeleteTeam = (teamId: string, teamName: string) => {
    if (window.confirm(`Delete ${teamName}?`)) {
      const updated = AllocationDatabase.deleteTeam(teamId);
      setTeams(updated);
      notify(`Deleted ${teamName}`);
    }
  };

  // -------------------------------------------------------------
  // PLAYER CRUD
  // -------------------------------------------------------------
  const openAddPerson = (teamId: string) => {
    setTargetTeamId(teamId);
    setPersonForm({ name: '', phone: '' });
    setPersonModalOpen(true);
  };

  const handleSavePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTeamId || !personForm.name.trim()) return;

    const updated = AllocationDatabase.addPlayerToTeam(targetTeamId, personForm);
    setTeams(updated);
    notify(`Added ${personForm.name}`);
    setPersonModalOpen(false);
  };

  const handleRemovePerson = (teamId: string, memberId: string, memberName: string) => {
    if (window.confirm(`Remove ${memberName} from this team?`)) {
      const updated = AllocationDatabase.removePlayerFromTeam(teamId, memberId);
      setTeams(updated);
      notify(`Removed ${memberName}`);
    }
  };

  // -------------------------------------------------------------
  // ALLOCATION ACTIONS
  // -------------------------------------------------------------
  const handleAssignTeamToRoom = (teamId: string, roomId: string) => {
    const targetRoomId = roomId === 'unassigned' ? null : roomId;
    const updated = AllocationDatabase.allocateTeamToRoom(teamId, targetRoomId);
    setTeams(updated);
    const roomObj = rooms.find(r => r.id === targetRoomId);
    notify(targetRoomId ? `Assigned to ${roomObj?.name}` : `Unassigned`);
  };

  const handleAutoAllot = () => {
    if (rooms.length === 0) {
      notify('Please create at least 1 room first');
      return;
    }
    const updated = AllocationDatabase.autoAllotUnassignedTeams();
    setTeams(updated);
    notify('Auto-allotted unassigned teams across rooms');
  };

  const handleResetAll = () => {
    if (window.confirm('Clear all team room assignments? (Teams and players are preserved)')) {
      const updated = AllocationDatabase.resetAllAllocations();
      setTeams(updated);
      notify('All room assignments cleared');
    }
  };

  // -------------------------------------------------------------
  // USER / STAFF CRUD (MASTER ADMIN ONLY)
  // -------------------------------------------------------------
  const openAddUser = (defaultRole: AdminRole = 'admin') => {
    setEditingUser(null);
    setUserForm({
      name: '',
      username: '',
      email: '',
      role: defaultRole,
      password: '',
      pocRoom: '',
      title: defaultRole === 'admin' ? 'Sub-Admin' : 'Sector Moderator',
    });
    setUserModalOpen(true);
  };

  const openEditUser = (targetUser: AdminUser) => {
    setEditingUser(targetUser);
    setUserForm({
      name: targetUser.name,
      username: targetUser.username,
      email: targetUser.email || '',
      role: targetUser.role,
      password: targetUser.password || '',
      pocRoom: targetUser.pocRoom || '',
      title: targetUser.title || '',
    });
    setUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.username.trim()) {
      notify('Name and Facilitator ID / Username are required.');
      return;
    }

    if (editingUser) {
      const updated = AllocationDatabase.updateStaffUser(editingUser.id, {
        name: userForm.name.trim(),
        username: userForm.username.trim(),
        facilitatorId: userForm.username.trim(),
        email: userForm.email.trim(),
        role: userForm.role,
        password: userForm.password ? userForm.password.trim() : editingUser.password,
        pocRoom: userForm.pocRoom.trim() || undefined,
        title: userForm.title.trim() || undefined,
      });
      setStaffUsers(updated);
      notify(`User ${userForm.name} updated.`);
    } else {
      const cleanUsername = userForm.username.trim();
      if (staffUsers.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
        notify('A user with this Facilitator ID already exists.');
        return;
      }
      AllocationDatabase.createStaffUser({
        name: userForm.name.trim(),
        username: cleanUsername,
        facilitatorId: cleanUsername,
        email: userForm.email.trim(),
        role: userForm.role,
        password: userForm.password.trim() || 'pass2026',
        pocRoom: userForm.pocRoom.trim() || undefined,
        title: userForm.title.trim() || (userForm.role === 'admin' ? 'Sub-Admin' : 'Sector Moderator'),
      });
      setStaffUsers(AllocationDatabase.getStaffUsers());
      notify(`New ${userForm.role === 'admin' ? 'Sub-Admin' : 'Moderator'} created successfully.`);
    }
    setUserModalOpen(false);
  };

  const handleQuickRoleChange = (userId: string, newRole: AdminRole) => {
    const target = staffUsers.find(u => u.id === userId);
    if (!target) return;
    if (target.id === 'NX-SUPER-01' || target.role === 'super_admin') {
      notify('Master Admin clearance cannot be altered.');
      return;
    }
    const updated = AllocationDatabase.updateStaffUser(userId, { role: newRole });
    setStaffUsers(updated);
    notify(`${target.name} role changed to ${newRole === 'admin' ? 'Sub-Admin' : 'Moderator'}.`);
  };

  const handleDeleteUser = (userId: string) => {
    const target = staffUsers.find(u => u.id === userId);
    if (!target) return;
    if (target.id === 'NX-SUPER-01' || target.role === 'super_admin') {
      notify('Master Admin cannot be deleted.');
      return;
    }
    if (window.confirm(`Delete staff account for ${target.name} (${target.username})?`)) {
      const updated = AllocationDatabase.deleteStaffUser(userId);
      setStaffUsers(updated);
      notify(`Staff user ${target.name} deleted.`);
    }
  };

  // -------------------------------------------------------------
  // EXPORT CSV
  // -------------------------------------------------------------
  const handleExportCSV = () => {
    const rows = [
      ['Room Name', 'Zone', 'POC In-Charge', 'POC Phone', 'Team ID', 'Team Name', 'Player Name', 'Player Phone'],
    ];

    teams.forEach(t => {
      const room = rooms.find(r => r.id === t.assignedRoomId);
      const members = t.memberDetails || [];

      if (members.length === 0) {
        rows.push([
          room?.name || 'Unassigned',
          room?.zone || '-',
          room?.pocName || 'None',
          room?.pocContact || '-',
          t.teamCode || t.id,
          t.name,
          '-',
          '-',
        ]);
      } else {
        members.forEach(m => {
          rows.push([
            room?.name || 'Unassigned',
            room?.zone || '-',
            room?.pocName || 'None',
            room?.pocContact || '-',
            t.teamCode || t.id,
            t.name,
            m.name,
            m.phone || '-',
          ]);
        });
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${cell}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NEXUS_Room_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notify('Exported CSV roster');
  };

  // -------------------------------------------------------------
  // COMPUTED COUNTS
  // -------------------------------------------------------------
  const masterAdminCount = useMemo(() => {
    return staffUsers.filter(u => u.role === 'super_admin').length;
  }, [staffUsers]);

  const subAdminCount = useMemo(() => {
    return staffUsers.filter(u => u.role === 'admin').length;
  }, [staffUsers]);

  const moderatorCount = useMemo(() => {
    return staffUsers.filter(u => u.role === 'moderator').length;
  }, [staffUsers]);

  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return staffUsers;
    const q = userSearchQuery.toLowerCase();
    return staffUsers.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        u.role.toLowerCase().includes(q) ||
        (u.pocRoom && u.pocRoom.toLowerCase().includes(q))
    );
  }, [staffUsers, userSearchQuery]);

  const impostorTeamsCount = useMemo(() => {
    return teams.filter(t => t.isImpostor).length;
  }, [teams]);

  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
      const matchesFilter =
        logFilter === 'all' ||
        (logFilter === 'power' && log.type === 'power') ||
        (logFilter === 'impostor_assign' && log.type === 'impostor_assign') ||
        (logFilter === 'sabotage' && (log.type === 'sabotage' || log.type === 'emergency')) ||
        (logFilter === 'login' && log.type === 'login') ||
        (logFilter === 'system' && log.type === 'system');

      if (!matchesFilter) return false;

      if (!logSearchQuery.trim()) return true;
      const q = logSearchQuery.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        (log.teamName && log.teamName.toLowerCase().includes(q)) ||
        (log.teamId && log.teamId.toLowerCase().includes(q)) ||
        (log.roomName && log.roomName.toLowerCase().includes(q)) ||
        log.type.toLowerCase().includes(q)
      );
    });
  }, [activityLogs, logFilter, logSearchQuery]);

  const totalPlayersCount = useMemo(() => {
    return teams.reduce((acc, t) => acc + (t.memberDetails?.length || t.members?.length || 0), 0);
  }, [teams]);

  const unassignedTeams = useMemo(() => {
    return teams.filter(t => !t.assignedRoomId);
  }, [teams]);

  const assignedTeams = useMemo(() => {
    return teams.filter(t => t.assignedRoomId);
  }, [teams]);

  const filteredTeams = useMemo(() => {
    return teams.filter(t => {
      return (
        searchQuery === '' ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.memberDetails && t.memberDetails.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    });
  }, [teams, searchQuery]);

  const teamsByRoom = useMemo(() => {
    const map: Record<string, Team[]> = {};
    rooms.forEach(r => {
      map[r.id] = [];
    });
    teams.forEach(t => {
      if (t.assignedRoomId && map[t.assignedRoomId]) {
        map[t.assignedRoomId].push(t);
      }
    });
    return map;
  }, [rooms, teams]);

  // =============================================================
  // 1. LOGIN SCREEN (CLEAN, MODERN BLACK & WHITE, NO DEMO LOGINS)
  // =============================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4 text-black font-sans">
        <div className="w-full max-w-sm border border-neutral-300 rounded-xl p-8 bg-white shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <img
              src="/logo.jpeg"
              alt="NEXUS"
              className="w-16 h-16 object-contain mx-auto rounded-lg border border-neutral-200 p-1 mb-2"
            />
            <h1 className="text-xl font-bold tracking-tight">
              NEXUS AMONG US
            </h1>
            <p className="text-xs text-neutral-500 uppercase font-medium">
              Admin Allocation Portal
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            {loginError && (
              <div className="p-3 border border-neutral-300 bg-neutral-100 rounded-md text-xs font-medium text-center">
                {loginError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-neutral-700 font-semibold text-xs">
                Facilitator ID / Username
              </label>
              <input
                type="text"
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                placeholder="Enter username..."
                required
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm outline-none focus:border-black transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-neutral-700 font-semibold text-xs">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="Enter password..."
                required
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm outline-none focus:border-black transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-black text-white hover:bg-neutral-800 rounded-md font-medium text-sm transition"
            >
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =============================================================
  // 2. MAIN ADMIN CONSOLE (CLEAN MODERN BLACK & WHITE)
  // =============================================================
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-2.5 border border-black bg-black text-white text-xs font-medium rounded-md shadow-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="NEXUS"
              className="w-9 h-9 object-contain rounded-md border border-neutral-200"
            />
            <div>
              <span className="font-bold text-sm block tracking-tight">
                NEXUS AMONG US
              </span>
              <span className="text-xs text-neutral-500 block font-normal">
                Team & Room Allocation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <span className="hidden sm:inline text-neutral-500 font-medium">
              {user?.name}
            </span>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 border border-neutral-300 hover:border-black rounded-md font-medium text-xs transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={logout}
              className="px-3 py-1.5 border border-neutral-300 hover:border-black rounded-md font-medium text-xs transition"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Simple Summary Metric Cards */}
        <div className={`grid ${user?.role === 'super_admin' ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'} gap-3 text-center`}>
          <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
            <span className="text-xs text-neutral-500 uppercase font-medium block">Rooms</span>
            <div className="text-2xl font-bold mt-0.5">{rooms.length}</div>
          </div>
          <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
            <span className="text-xs text-neutral-500 uppercase font-medium block">Teams</span>
            <div className="text-2xl font-bold mt-0.5">{teams.length}</div>
          </div>
          <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
            <span className="text-xs text-neutral-500 uppercase font-medium block">Total Players</span>
            <div className="text-2xl font-bold mt-0.5">{totalPlayersCount}</div>
          </div>
          <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
            <span className="text-xs text-neutral-500 uppercase font-medium block">Impostors Active</span>
            <div className="text-2xl font-bold mt-0.5">{impostorTeamsCount}</div>
          </div>
          {user?.role === 'super_admin' && (
            <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
              <span className="text-xs text-neutral-500 uppercase font-medium block">Staff & Admins</span>
              <div className="text-2xl font-bold mt-0.5">{staffUsers.length}</div>
            </div>
          )}
        </div>

        {/* Modern Segmented Tab Buttons */}
        <div className="flex border border-neutral-300 rounded-lg p-1 bg-neutral-100 gap-1 text-xs sm:text-sm font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('allocation')}
            className={`flex-1 py-2 px-2 rounded-md transition whitespace-nowrap ${
              activeTab === 'allocation'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-700 hover:text-black'
            }`}
          >
            1. Room Allocation
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className={`flex-1 py-2 px-2 rounded-md transition whitespace-nowrap ${
              activeTab === 'teams'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-700 hover:text-black'
            }`}
          >
            2. Teams & Players ({teams.length})
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 py-2 px-2 rounded-md transition whitespace-nowrap ${
              activeTab === 'rooms'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-700 hover:text-black'
            }`}
          >
            3. Rooms & POCs ({rooms.length})
          </button>

          {user?.role === 'super_admin' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2 px-2 rounded-md transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>4. User Panel ({staffUsers.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-2 px-2 rounded-md transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-700 hover:text-black'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>5. Activity Logs ({activityLogs.length})</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: ROOM ALLOCATION */}
        {/* ========================================================= */}
        {activeTab === 'allocation' && (
          <div className="space-y-5">
            {/* Action Bar */}
            <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-sm block">Allocation Matrix</span>
                <span className="text-neutral-500">
                  {assignedTeams.length} of {teams.length} teams assigned to rooms
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleAutoAllot}
                  className="px-3 py-1.5 bg-black text-white hover:bg-neutral-800 rounded-md font-medium text-xs transition"
                >
                  ⚡ Auto-Assign All Teams
                </button>

                <button
                  onClick={handleResetAll}
                  className="px-3 py-1.5 border border-neutral-300 hover:border-black rounded-md font-medium text-xs transition"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Unassigned Teams Section */}
            {unassignedTeams.length > 0 && (
              <div className="p-4 border border-neutral-300 rounded-lg bg-white space-y-3">
                <span className="font-semibold text-xs text-neutral-800 block">
                  Unassigned Teams ({unassignedTeams.length}):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {unassignedTeams.map(t => (
                    <div
                      key={t.id}
                      className="p-2.5 border border-neutral-200 rounded-md bg-neutral-50 flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold block">{t.name}</span>
                        <span className="text-neutral-500 text-[11px]">
                          {t.memberDetails?.length || t.members?.length || 0} players
                        </span>
                      </div>

                      <select
                        onChange={e => {
                          if (e.target.value) {
                            handleAssignTeamToRoom(t.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="border border-neutral-300 rounded px-2 py-1 text-xs outline-none bg-white"
                      >
                        <option value="" disabled>Put in...</option>
                        {rooms.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map(room => {
                const roomTeams = teamsByRoom[room.id] || [];
                const totalPlayersInRoom = roomTeams.reduce(
                  (acc, t) => acc + (t.memberDetails?.length || t.members?.length || 0),
                  0
                );

                return (
                  <div
                    key={room.id}
                    className="border border-neutral-200 rounded-lg bg-white p-4 space-y-3 flex flex-col justify-between shadow-sm"
                  >
                    {/* Room Header */}
                    <div className="space-y-1.5 border-b border-neutral-100 pb-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base">
                          {room.name}
                        </span>
                        <span className="px-2 py-0.5 border border-neutral-200 rounded text-[11px] font-medium bg-neutral-50">
                          {room.zone}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-600">
                        <span>POC: </span>
                        <strong className="text-black">{room.pocName || 'None'}</strong>
                        {room.pocContact && (
                          <span className="block text-neutral-500 text-[11px]">
                            {room.pocContact}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-neutral-500 font-medium pt-0.5">
                        {roomTeams.length} teams ({totalPlayersInRoom} players)
                      </div>
                    </div>

                    {/* Impostor Status & Selection Controls for Room */}
                    {(() => {
                      const currentImpostorInRoom = roomTeams.find(t => t.isImpostor);
                      return (
                        <div className="p-2.5 border border-neutral-300 rounded-md bg-neutral-100/80 space-y-2 text-xs">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                              <Skull className="w-3.5 h-3.5 text-black" />
                              <span>Room Impostor:</span>
                            </div>
                            {currentImpostorInRoom ? (
                              <span className="px-2 py-0.5 bg-black text-white rounded text-[10px] font-mono font-bold flex items-center gap-1">
                                <span>{currentImpostorInRoom.name}</span>
                                <span className="text-neutral-400">({currentImpostorInRoom.teamCode || currentImpostorInRoom.id})</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-neutral-500 italic">None set</span>
                            )}
                          </div>

                          {/* Controls: Random Impostor & Custom Override Dropdown */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleRollRandomImpostor(room.id, room.name)}
                              disabled={roomTeams.length === 0}
                              title="Randomly pick 1 team in this room as Impostor"
                              className="px-2 py-1 bg-black text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed rounded text-[11px] font-medium transition flex items-center gap-1 whitespace-nowrap"
                            >
                              <Dices className="w-3 h-3" />
                              <span>Random Roll</span>
                            </button>

                            <select
                              value={currentImpostorInRoom?.id || ''}
                              onChange={e => handleSetRoomImpostor(room.id, e.target.value || null)}
                              disabled={roomTeams.length === 0}
                              className="flex-1 border border-neutral-300 rounded px-1.5 py-1 text-[11px] outline-none bg-white font-medium"
                            >
                              <option value="">Custom Override (None / Reset)</option>
                              {roomTeams.map(t => (
                                <option key={t.id} value={t.id}>
                                  Set: {t.name} ({t.teamCode || t.id})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Teams in Room */}
                    <div className="space-y-2 flex-1">
                      <span className="text-[11px] font-semibold text-neutral-500 uppercase block">
                        Teams Inside:
                      </span>

                      {roomTeams.length === 0 ? (
                        <div className="p-4 border border-dashed border-neutral-200 rounded text-center text-xs text-neutral-400">
                          No teams assigned
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {roomTeams.map(t => (
                            <div
                              key={t.id}
                              className={`p-2.5 border rounded text-xs space-y-1.5 transition ${
                                t.isImpostor
                                  ? 'border-black bg-neutral-900 text-white shadow-sm'
                                  : 'border-neutral-200 bg-neutral-50 text-black'
                              }`}
                            >
                              <div className="flex items-center justify-between font-semibold">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span>{t.name}</span>
                                  <span className="font-mono text-[10px] opacity-75">
                                    ({t.teamCode || t.id})
                                  </span>
                                  {t.isImpostor ? (
                                    <span className="px-1.5 py-0.5 bg-white text-black font-bold text-[9px] rounded uppercase tracking-wider">
                                      IMPOSTOR
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 border border-neutral-300 text-neutral-600 text-[9px] rounded uppercase">
                                      Crewmate
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleToggleTeamImpostor(t.id, t.isImpostor)}
                                    className={`text-[10px] px-1.5 py-0.5 rounded border transition ${
                                      t.isImpostor
                                        ? 'border-neutral-600 hover:border-white text-neutral-300'
                                        : 'border-neutral-300 hover:border-black text-black'
                                    }`}
                                  >
                                    {t.isImpostor ? 'Make Crew' : 'Make Impostor'}
                                  </button>

                                  <button
                                    onClick={() => handleAssignTeamToRoom(t.id, 'unassigned')}
                                    className={`text-[11px] underline ${t.isImpostor ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'}`}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>

                              <div className={`text-[11px] ${t.isImpostor ? 'text-neutral-300' : 'text-neutral-500'}`}>
                                Players: {(t.memberDetails || []).map(m => m.name).join(', ') || 'None'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Team Dropdown */}
                    <div className="border-t border-neutral-100 pt-3">
                      <select
                        onChange={e => {
                          if (e.target.value) {
                            handleAssignTeamToRoom(e.target.value, room.id);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="w-full border border-neutral-300 rounded px-2.5 py-1.5 text-xs outline-none bg-white"
                      >
                        <option value="" disabled>
                          + Add a team to {room.name}...
                        </option>
                        {unassignedTeams.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.memberDetails?.length || t.members?.length || 0} players)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TEAMS & PLAYERS */}
        {/* ========================================================= */}
        {activeTab === 'teams' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">
                  Teams & Individual Players
                </h2>
                <p className="text-xs text-neutral-500">
                  All participants in a team are equal individual players.
                </p>
              </div>

              <button
                onClick={openAddTeam}
                className="px-3.5 py-2 bg-black text-white hover:bg-neutral-800 rounded-md text-xs font-medium transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Team</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="p-2 border border-neutral-300 rounded-lg bg-white flex items-center gap-2">
              <Search className="w-4 h-4 text-neutral-400 ml-1.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search team name or player name..."
                className="w-full text-xs outline-none"
              />
            </div>

            {/* Teams List */}
            <div className="space-y-3">
              {filteredTeams.map(team => {
                const room = rooms.find(r => r.id === team.assignedRoomId);
                const members = team.memberDetails || [];

                return (
                  <div
                    key={team.id}
                    className="border border-neutral-200 rounded-lg bg-white p-4 space-y-3 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm">
                          {team.name}
                        </span>
                        <span className="px-2 py-0.5 bg-black text-white rounded text-[11px] font-mono font-bold tracking-wider" title="Player Login Team ID">
                          ID: {team.teamCode || team.id}
                        </span>
                        {room ? (
                          <span className="px-2 py-0.5 border border-neutral-200 rounded text-[11px] font-medium bg-neutral-50">
                            {room.name} ({room.zone})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 border border-neutral-300 rounded text-[11px] font-medium text-neutral-500">
                            Unassigned
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <select
                          value={team.assignedRoomId || 'unassigned'}
                          onChange={e => handleAssignTeamToRoom(team.id, e.target.value)}
                          className="border border-neutral-300 rounded px-2 py-1 text-xs outline-none bg-white"
                        >
                          <option value="unassigned">No Room</option>
                          {rooms.map(r => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => openAddPerson(team.id)}
                          className="px-2.5 py-1 border border-neutral-300 hover:border-black rounded text-xs font-medium transition"
                        >
                          + Player
                        </button>

                        <button
                          onClick={() => handleDeleteTeam(team.id, team.name)}
                          className="p-1 border border-neutral-300 hover:border-black rounded text-neutral-600 hover:text-black transition"
                          title="Delete Team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Players List */}
                    <div className="space-y-1.5 text-xs">
                      <span className="text-[11px] font-semibold text-neutral-500 uppercase block">
                        Players ({members.length}):
                      </span>

                      {members.length === 0 ? (
                        <div className="text-neutral-400 italic text-xs">
                          No players in this team. Click "+ Player" above to add one.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {members.map(m => (
                            <span
                              key={m.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-neutral-200 rounded-md bg-neutral-50 text-xs"
                            >
                              <span className="font-medium">{m.name}</span>
                              {m.phone && <span className="text-neutral-400 text-[10px]">({m.phone})</span>}
                              <button
                                onClick={() => handleRemovePerson(team.id, m.id, m.name)}
                                className="text-neutral-400 hover:text-black font-bold ml-0.5"
                                title="Remove player"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ROOMS & POCS */}
        {/* ========================================================= */}
        {activeTab === 'rooms' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">
                  Rooms & Points of Contact (POCs)
                </h2>
                <p className="text-xs text-neutral-500">
                  Manage game rooms and the coordinators in charge of each room.
                </p>
              </div>

              <button
                onClick={openAddRoom}
                className="px-3.5 py-2 bg-black text-white hover:bg-neutral-800 rounded-md text-xs font-medium transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Room</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {rooms.map(room => (
                <div
                  key={room.id}
                  className="border border-neutral-200 rounded-lg bg-white p-4 space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <span className="font-bold text-base">{room.name}</span>
                    <span className="px-2 py-0.5 border border-neutral-200 rounded text-[11px] bg-neutral-50">
                      {room.zone}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-neutral-700">
                    <div>
                      <span className="text-neutral-400 text-[11px] block">POC in Charge:</span>
                      <span className="font-semibold">{room.pocName || 'None assigned'}</span>
                    </div>
                    {room.pocContact && (
                      <div>
                        <span className="text-neutral-400 text-[11px] block">Phone:</span>
                        <span>{room.pocContact}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                    <button
                      onClick={() => openEditRoom(room)}
                      className="flex-1 py-1 border border-neutral-300 hover:border-black rounded font-medium text-xs transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id, room.name)}
                      className="px-3 py-1 border border-neutral-300 hover:border-black rounded font-medium text-xs transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: USER & ROLE MANAGEMENT (MASTER ADMIN ONLY) */}
        {/* ========================================================= */}
        {activeTab === 'users' && user?.role === 'super_admin' && (
          <div className="space-y-5">
            {/* Action Bar */}
            <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-black" />
                  <span className="font-bold text-sm">Staff & Role Management</span>
                  <span className="px-2 py-0.5 bg-black text-white rounded text-[10px] font-mono uppercase tracking-wider">
                    Master Admin Clearance
                  </span>
                </div>
                <span className="text-neutral-500 block mt-0.5">
                  Authorize and manage Sub-Admins and Sector Moderators with instant credential access.
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => openAddUser('admin')}
                  className="px-3 py-1.5 bg-black text-white hover:bg-neutral-800 rounded-md font-medium text-xs transition flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ New Sub-Admin</span>
                </button>
                <button
                  onClick={() => openAddUser('moderator')}
                  className="px-3 py-1.5 border border-neutral-300 hover:border-black rounded-md font-medium text-xs transition flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ New Moderator</span>
                </button>
              </div>
            </div>

            {/* Role Summary Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 border border-black rounded-lg bg-black text-white">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-300 uppercase text-[10px] tracking-wider">Master Admins</span>
                  <Crown className="w-3.5 h-3.5 text-neutral-200" />
                </div>
                <div className="text-2xl font-bold mt-1">{masterAdminCount}</div>
                <span className="text-[11px] text-neutral-400 block mt-0.5">Full root clearance & staff authority</span>
              </div>

              <div className="p-3.5 border border-neutral-300 rounded-lg bg-white">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-500 uppercase text-[10px] tracking-wider">Sub-Admins</span>
                  <Shield className="w-3.5 h-3.5 text-black" />
                </div>
                <div className="text-2xl font-bold mt-1 text-black">{subAdminCount}</div>
                <span className="text-[11px] text-neutral-500 block mt-0.5">Manage teams, rooms & allocations</span>
              </div>

              <div className="p-3.5 border border-neutral-300 rounded-lg bg-white">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-500 uppercase text-[10px] tracking-wider">Moderators</span>
                  <Users className="w-3.5 h-3.5 text-neutral-500" />
                </div>
                <div className="text-2xl font-bold mt-1 text-black">{moderatorCount}</div>
                <span className="text-[11px] text-neutral-500 block mt-0.5">Ground check-in & sector POCs</span>
              </div>
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                placeholder="Search staff by name, Facilitator ID, email, or role..."
                className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-xs outline-none focus:border-black"
              />
            </div>

            {/* User List / Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredUsers.map(staff => {
                const isMaster = staff.role === 'super_admin';
                const isSubAdmin = staff.role === 'admin';

                return (
                  <div
                    key={staff.id}
                    className="p-4 border border-neutral-200 rounded-lg bg-white space-y-3 text-xs flex flex-col justify-between hover:border-neutral-400 transition"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2 border-b border-neutral-100 pb-2">
                        <div>
                          <span className="font-bold text-sm block">{staff.name}</span>
                          <span className="font-mono text-[11px] text-neutral-500">
                            ID: {staff.username || staff.id}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                            isMaster
                              ? 'bg-black text-white'
                              : isSubAdmin
                              ? 'bg-neutral-100 border border-neutral-400 text-black font-semibold'
                              : 'bg-neutral-50 border border-neutral-200 text-neutral-700'
                          }`}
                        >
                          {isMaster ? 'Master Admin' : isSubAdmin ? 'Sub-Admin' : 'Moderator'}
                        </span>
                      </div>

                      <div className="space-y-1 text-neutral-600 text-xs">
                        {staff.email && (
                          <div className="truncate">
                            <span className="text-neutral-400 text-[11px]">Email: </span>
                            <span>{staff.email}</span>
                          </div>
                        )}
                        {staff.title && (
                          <div>
                            <span className="text-neutral-400 text-[11px]">Designation: </span>
                            <span>{staff.title}</span>
                          </div>
                        )}
                        {staff.pocRoom && (
                          <div>
                            <span className="text-neutral-400 text-[11px]">Assigned Sector: </span>
                            <span className="font-medium text-black">{staff.pocRoom}</span>
                          </div>
                        )}
                        <div className="font-mono text-[11px] text-neutral-500">
                          Passcode: <span className="text-neutral-800">{staff.password || '••••••••'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-100 space-y-2">
                      {/* Role Switcher (Promote/Demote) */}
                      {!isMaster ? (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-neutral-500">Change Role:</span>
                          <select
                            value={staff.role}
                            onChange={e => handleQuickRoleChange(staff.id, e.target.value as AdminRole)}
                            className="flex-1 border border-neutral-300 rounded px-1.5 py-0.5 bg-white text-xs outline-none focus:border-black font-medium"
                          >
                            <option value="admin">Sub-Admin</option>
                            <option value="moderator">Moderator</option>
                          </select>
                        </div>
                      ) : (
                        <div className="text-[11px] text-neutral-400 italic">
                          Primary Master Admin account (Protected)
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditUser(staff)}
                          className="flex-1 py-1 border border-neutral-300 hover:border-black rounded font-medium text-xs transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(staff.id)}
                          disabled={isMaster}
                          className={`px-3 py-1 border rounded font-medium text-xs transition ${
                            isMaster
                              ? 'border-neutral-200 text-neutral-300 cursor-not-allowed'
                              : 'border-neutral-300 hover:border-black text-black'
                          }`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ACTIVITY & AUDIT LOGS */}
        {/* ========================================================= */}
        {activeTab === 'logs' && (
          <div className="space-y-5">
            {/* Top Action Header */}
            <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-black" />
                  <span className="font-bold text-sm">Real-Time Activity & Power Logs</span>
                  <span className="px-2 py-0.5 border border-neutral-300 bg-white rounded text-[10px] font-mono">
                    Live Telemetry
                  </span>
                </div>
                <span className="text-neutral-500 block mt-0.5">
                  Live audit trail tracking Impostor powers, room role assignments, and player logins.
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setActivityLogs(AllocationDatabase.getLogs());
                    notify('Logs refreshed');
                  }}
                  className="px-3 py-1.5 border border-neutral-300 hover:border-black rounded-md font-medium text-xs transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={handleExportLogsCSV}
                  className="px-3 py-1.5 border border-neutral-300 hover:border-black rounded-md font-medium text-xs transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handleClearLogs}
                  className="px-3 py-1.5 border border-neutral-300 hover:border-red-600 hover:text-red-600 rounded-md font-medium text-xs transition"
                >
                  Clear Logs
                </button>
              </div>
            </div>

            {/* Log Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex border border-neutral-300 rounded-lg p-1 bg-neutral-100 gap-1 text-xs overflow-x-auto flex-1">
                {[
                  { key: 'all', label: `All (${activityLogs.length})` },
                  { key: 'power', label: '⚡ Impostor Powers' },
                  { key: 'impostor_assign', label: '🎯 Impostor Roles' },
                  { key: 'sabotage', label: '🚨 Sabotage & Alert' },
                  { key: 'login', label: '🔐 Logins' },
                  { key: 'system', label: '⚙️ System' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setLogFilter(f.key as any)}
                    className={`px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap ${
                      logFilter === f.key
                        ? 'bg-black text-white shadow-sm'
                        : 'text-neutral-700 hover:text-black'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={logSearchQuery}
                  onChange={e => setLogSearchQuery(e.target.value)}
                  placeholder="Filter logs by team, room, text..."
                  className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-xs outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Logs List Container */}
            <div className="border border-neutral-300 rounded-lg bg-white overflow-hidden shadow-sm">
              <div className="p-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs font-semibold text-neutral-700">
                <span>Event Stream ({filteredLogs.length} events)</span>
                <span className="text-neutral-400 text-[11px] font-normal">Auto-updates every 3s</span>
              </div>

              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 text-xs">
                  No activity logs matching current filter.
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 max-h-[600px] overflow-y-auto">
                  {filteredLogs.map(log => {
                    const isPower = log.type === 'power';
                    const isAssign = log.type === 'impostor_assign';
                    const isSabotage = log.type === 'sabotage' || log.type === 'emergency';
                    const isLogin = log.type === 'login';

                    return (
                      <div
                        key={log.id}
                        className={`p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 hover:bg-neutral-50/80 transition ${
                          isPower ? 'bg-neutral-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-2.5 flex-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap ${
                              isPower
                                ? 'bg-black text-white'
                                : isAssign
                                ? 'border border-black text-black'
                                : isSabotage
                                ? 'bg-neutral-800 text-white'
                                : isLogin
                                ? 'border border-neutral-400 text-neutral-700'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {isPower
                              ? '⚡ IMPOSTOR POWER'
                              : isAssign
                              ? '🎯 ROLE ASSIGN'
                              : isSabotage
                              ? '🚨 SABOTAGE'
                              : isLogin
                              ? '🔐 LOGIN'
                              : 'SYSTEM'}
                          </span>

                          <div className="space-y-0.5">
                            <div className="font-medium text-black">
                              {log.message}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
                              {log.teamId && <span>Team: {log.teamId}</span>}
                              {log.roomName && <span>• Room: {log.roomName}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="font-mono text-[11px] text-neutral-400 whitespace-nowrap sm:text-right">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT ROOM */}
      {/* ========================================================= */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-neutral-300 rounded-xl p-5 shadow-lg space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <span className="font-bold text-sm">
                {editingRoom ? `Edit ${editingRoom.name}` : 'Add Room'}
              </span>
              <button onClick={() => setRoomModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-neutral-700 font-medium text-xs">Room Name</label>
                <input
                  type="text"
                  value={roomForm.name}
                  onChange={e => setRoomForm({ ...roomForm, name: e.target.value })}
                  placeholder="e.g. Room 1, Lab 102"
                  required
                  className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-700 font-medium text-xs">Campus Zone</label>
                <input
                  type="text"
                  value={roomForm.zone}
                  onChange={e => setRoomForm({ ...roomForm, zone: e.target.value })}
                  placeholder="e.g. Zone A, Ground Floor"
                  required
                  className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-700 font-medium text-xs">POC Name</label>
                <input
                  type="text"
                  value={roomForm.pocName}
                  onChange={e => setRoomForm({ ...roomForm, pocName: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-700 font-medium text-xs">POC Phone</label>
                <input
                  type="text"
                  value={roomForm.pocContact}
                  onChange={e => setRoomForm({ ...roomForm, pocContact: e.target.value })}
                  placeholder="+91 98111 22334"
                  className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setRoomModalOpen(false)}
                  className="px-3 py-1.5 border border-neutral-300 rounded-md font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-black text-white hover:bg-neutral-800 rounded-md font-medium text-xs transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD TEAM */}
      {/* ========================================================= */}
      {teamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-neutral-300 rounded-xl p-5 shadow-lg space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <span className="font-bold text-sm">Add Team</span>
              <button onClick={() => setTeamModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-neutral-700 font-medium text-xs">Team Name</label>
                <input
                  type="text"
                  value={teamForm.name}
                  onChange={e => setTeamForm({ ...teamForm, name: e.target.value })}
                  placeholder="e.g. Team 1, Red Squad"
                  required
                  className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-700 font-medium text-xs">
                  Players (enter names, separated by commas or lines)
                </label>
                <textarea
                  value={teamForm.playerNames}
                  onChange={e => setTeamForm({ ...teamForm, playerNames: e.target.value })}
                  placeholder="Rohan Sharma&#10;Sneha Kapoor&#10;Aditya Roy"
                  rows={4}
                  className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-700 font-medium text-xs">Put in Room (Optional)</label>
                <select
                  value={teamForm.assignedRoomId}
                  onChange={e => setTeamForm({ ...teamForm, assignedRoomId: e.target.value })}
                  className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-xs outline-none bg-white"
                >
                  <option value="">Leave Unassigned</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setTeamModalOpen(false)}
                  className="px-3 py-1.5 border border-neutral-300 rounded-md font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-black text-white hover:bg-neutral-800 rounded-md font-medium text-xs transition"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD PLAYER */}
      {/* ========================================================= */}
      {personModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white border border-neutral-300 rounded-xl p-5 shadow-lg space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <span className="font-bold text-sm">Add Player</span>
              <button onClick={() => setPersonModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePerson} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-neutral-700 font-medium text-xs">Player Name</label>
                <input
                  type="text"
                  value={personForm.name}
                  onChange={e => setPersonForm({ ...personForm, name: e.target.value })}
                  placeholder="e.g. Rahul Verma"
                  required
                  className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-700 font-medium text-xs">Phone (Optional)</label>
                <input
                  type="text"
                  value={personForm.phone}
                  onChange={e => setPersonForm({ ...personForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setPersonModalOpen(false)}
                  className="px-3 py-1.5 border border-neutral-300 rounded-md font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-black text-white hover:bg-neutral-800 rounded-md font-medium text-xs transition"
                >
                  Add Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT STAFF USER (MASTER ADMIN) */}
      {/* ========================================================= */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-neutral-300 rounded-xl p-5 shadow-lg space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <span className="font-bold text-sm">
                {editingUser ? `Edit ${editingUser.name}` : `Create ${userForm.role === 'admin' ? 'Sub-Admin' : 'Moderator'}`}
              </span>
              <button onClick={() => setUserModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-neutral-700 font-medium text-xs">Role</label>
                <select
                  value={userForm.role}
                  onChange={e => setUserForm({ ...userForm, role: e.target.value as AdminRole })}
                  disabled={editingUser?.role === 'super_admin'}
                  className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-xs outline-none bg-white font-medium"
                >
                  <option value="admin">Sub-Admin (Full Operations Access)</option>
                  <option value="moderator">Moderator (Sector POC / Check-In)</option>
                  {editingUser?.role === 'super_admin' && (
                    <option value="super_admin">Master Admin</option>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-700 font-medium text-xs">Full Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  required
                  className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-700 font-medium text-xs">Facilitator ID / Username</label>
                <input
                  type="text"
                  value={userForm.username}
                  onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                  placeholder="e.g. NX-ADMIN-03 or rohan.admin"
                  required
                  className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-black font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-700 font-medium text-xs">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="user@nexus.org"
                  className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-700 font-medium text-xs">Security Passcode (Login Password)</label>
                <input
                  type="text"
                  value={userForm.password}
                  onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="Enter login password e.g. pass2026"
                  required={!editingUser}
                  className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-black font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-700 font-medium text-xs">Designation / Title (Optional)</label>
                <input
                  type="text"
                  value={userForm.title}
                  onChange={e => setUserForm({ ...userForm, title: e.target.value })}
                  placeholder="e.g. Operations Assistant, Sector POC"
                  className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-700 font-medium text-xs">Assigned Sector / Room (Optional)</label>
                <select
                  value={userForm.pocRoom}
                  onChange={e => setUserForm({ ...userForm, pocRoom: e.target.value })}
                  className="w-full border border-neutral-300 rounded-md px-3 py-1.5 text-xs outline-none bg-white"
                >
                  <option value="">No Specific Room Assigned</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-3 py-1.5 border border-neutral-300 rounded-md font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-black text-white hover:bg-neutral-800 rounded-md font-medium text-xs transition"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
