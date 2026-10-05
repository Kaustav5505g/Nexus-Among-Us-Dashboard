import React, { useState, useEffect } from 'react';
import {
  Shield,
  Play,
  Pause,
  Square,
  Shuffle,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  LogOut,
  AlertTriangle,
  Lock,
  Unlock,
  Search,
  Download,
  Users,
  Clock,
  Radio,
  Zap,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronRight,
  Flame,
  ArrowRightLeft,
  KeyRound,
  FileText,
  Briefcase,
  Layers,
  RotateCcw,
  CheckSquare,
  UserCheck,
  UserX,
  FileCode,
  Tag,
  Hash,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Team, RoomType, SabotageType, AdminRole, StationTask, MysteryClue, AdminUser } from '../types';
import { AMONG_US_ROOMS, INITIAL_ADMIN_TEAMS } from '../data/initialAdminData';
import { GameDatabase } from '../lib/gameDatabase';

// Room metadata with thematic icons and sector codes
const ROOM_METADATA: Record<RoomType, { code: string; icon: string; description: string }> = {
  Electrical: { code: 'SEC-01', icon: '⚡', description: 'Power grid & breakers' },
  Reactor: { code: 'SEC-02', icon: '⚛️', description: 'Core quantum manifold' },
  MedBay: { code: 'SEC-03', icon: '🧬', description: 'DNA scan diagnostics' },
  Navigation: { code: 'SEC-04', icon: '🧭', description: 'Sublight charting' },
  Admin: { code: 'SEC-05', icon: '📋', description: 'Card swipe & terminal' },
  Weapons: { code: 'SEC-06', icon: '🎯', description: 'Meteor deflection' },
  O2: { code: 'SEC-07', icon: '💨', description: 'Atmospheric filtration' },
  Cafeteria: { code: 'SEC-08', icon: '☕', description: 'Central emergency hub' },
  Communications: { code: 'SEC-09', icon: '📡', description: 'Subspace radio relay' },
};

export default function AmongUsAdmin() {
  const { user, permissions, login, logout, isAuthenticated } = useAdminAuth();

  // Primary Collections from Database
  const [teams, setTeams] = useState<Team[]>(INITIAL_ADMIN_TEAMS);
  const [tasks, setTasks] = useState<StationTask[]>([]);
  const [clues, setClues] = useState<MysteryClue[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  // Match Master Controls State
  const [eventStatus, setEventStatus] = useState<'standby' | 'running' | 'paused' | 'ended'>('running');
  const [impostorPowersActive, setImpostorPowersActive] = useState<boolean>(true);
  const [activeSabotage, setActiveSabotage] = useState<SabotageType>(null);
  const [emergencyActive, setEmergencyActive] = useState<boolean>(false);
  const [showImpostorRoster, setShowImpostorRoster] = useState<boolean>(true);
  const [matchSeconds, setMatchSeconds] = useState<number>(1420);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'matrix' | 'teams' | 'tasks' | 'facilitators' | 'telemetry'>('matrix');

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; time: string; user: string; action: string }>>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('ALL');
  const [taskFilterRoom, setTaskFilterRoom] = useState<string>('ALL');

  // Modal States: Teams
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);
  const [currentEditTeam, setCurrentEditTeam] = useState<Team | null>(null);

  // Team Form Fields
  const [formTeamName, setFormTeamName] = useState('');
  const [formLeaderName, setFormLeaderName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formMembers, setFormMembers] = useState('');
  const [formRoom, setFormRoom] = useState<RoomType>('Cafeteria');
  const [formScore, setFormScore] = useState<number>(0);
  const [formIsImpostor, setFormIsImpostor] = useState<boolean>(false);

  // Modal States: Station Tasks
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentEditTask, setCurrentEditTask] = useState<StationTask | null>(null);
  const [taskFormTitle, setTaskFormTitle] = useState('');
  const [taskFormRoom, setTaskFormRoom] = useState<RoomType>('Electrical');
  const [taskFormDesc, setTaskFormDesc] = useState('');
  const [taskFormSnippet, setTaskFormSnippet] = useState('');
  const [taskFormClueHint, setTaskFormClueHint] = useState('');
  const [taskFormFlag, setTaskFormFlag] = useState('');
  const [taskFormPoints, setTaskFormPoints] = useState<number>(100);

  // Modal States: Mystery Clues
  const [isClueModalOpen, setIsClueModalOpen] = useState(false);
  const [currentEditClue, setCurrentEditClue] = useState<MysteryClue | null>(null);
  const [clueFormCaseFile, setClueFormCaseFile] = useState('');
  const [clueFormTitle, setClueFormTitle] = useState('');
  const [clueFormDifficulty, setClueFormDifficulty] = useState<'Novice' | 'Investigator' | 'Cyber Detective'>('Novice');
  const [clueFormLocation, setClueFormLocation] = useState('');
  const [clueFormDesc, setClueFormDesc] = useState('');
  const [clueFormPuzzle, setClueFormPuzzle] = useState('');
  const [clueFormHint, setClueFormHint] = useState('');
  const [clueFormPoints, setClueFormPoints] = useState<number>(250);

  // Modal States: Facilitator Clearance Directory
  const [isFacilitatorModalOpen, setIsFacilitatorModalOpen] = useState(false);
  const [currentEditFacilitator, setCurrentEditFacilitator] = useState<AdminUser | null>(null);
  const [facId, setFacId] = useState('');
  const [facUsername, setFacUsername] = useState('');
  const [facName, setFacName] = useState('');
  const [facEmail, setFacEmail] = useState('');
  const [facRole, setFacRole] = useState<AdminRole>('moderator');
  const [facPassword, setFacPassword] = useState('');
  const [facPocRoom, setFacPocRoom] = useState<RoomType>('Reactor');
  const [facTitle, setFacTitle] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Login Gate State
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ============================================================================
  // DATABASE HYDRATION & REALTIME SUBSCRIPTIONS
  // ============================================================================

  useEffect(() => {
    // 1. Initial Loads from Supabase Database
    GameDatabase.getTeams().then(setTeams);
    GameDatabase.getEventControls().then(ctrl => {
      setEventStatus(ctrl.status);
      setImpostorPowersActive(ctrl.impostor_powers_active);
      setActiveSabotage(ctrl.active_sabotage);
      setEmergencyActive(ctrl.emergency_active);
      if (ctrl.elapsed_seconds) setMatchSeconds(ctrl.elapsed_seconds);
    });
    GameDatabase.getTasks().then(setTasks);
    GameDatabase.getClues().then(setClues);
    GameDatabase.getAdminUsers().then(setAdminUsers);
    GameDatabase.getActivityLogs().then(logs => {
      setAuditLogs(
        logs.map(l => ({
          id: l.id,
          time: new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          user: l.team_name || 'System / Facilitator',
          action: l.message,
        }))
      );
    });

    // 2. Realtime Subscriptions across all collections
    const unsubTeams = GameDatabase.subscribeToTeams(setTeams);
    const unsubControls = GameDatabase.subscribeToEventControls(ctrl => {
      setEventStatus(ctrl.status);
      setImpostorPowersActive(ctrl.impostor_powers_active);
      setActiveSabotage(ctrl.active_sabotage);
      setEmergencyActive(ctrl.emergency_active);
      if (ctrl.elapsed_seconds) setMatchSeconds(ctrl.elapsed_seconds);
    });
    const unsubTasks = GameDatabase.subscribeToTasks(setTasks);
    const unsubClues = GameDatabase.subscribeToClues(setClues);
    const unsubAdmins = GameDatabase.subscribeToAdminUsers(setAdminUsers);
    const unsubLogs = GameDatabase.subscribeToActivityLogs(logs => {
      setAuditLogs(
        logs.map(l => ({
          id: l.id,
          time: new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          user: l.team_name || 'System / Facilitator',
          action: l.message,
        }))
      );
    });

    return () => {
      unsubTeams();
      unsubControls();
      unsubTasks();
      unsubClues();
      unsubAdmins();
      unsubLogs();
    };
  }, []);

  // Match clock ticker
  useEffect(() => {
    if (eventStatus !== 'running') return;
    const interval = setInterval(() => {
      setMatchSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [eventStatus]);

  const addAuditLog = (action: string) => {
    const newLog = {
      id: `log-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      user: user ? `${user.name} (${user.role.toUpperCase()})` : 'System Facilitator',
      action,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // ============================================================================
  // EVENT MASTER CONTROL ACTIONS
  // ============================================================================

  const handleStartEvent = async () => {
    if (!permissions?.canStartEvent) return;
    setEventStatus('running');
    await GameDatabase.updateEventControls({ status: 'running' });
    addAuditLog('Started match timer and initialized orbital operations.');
  };

  const handlePauseEvent = async () => {
    if (!permissions?.canPauseEvent) return;
    setEventStatus('paused');
    await GameDatabase.updateEventControls({ status: 'paused' });
    addAuditLog('PAUSED match. Player terminal inputs locked.');
  };

  const handleResumeEvent = async () => {
    if (!permissions?.canPauseEvent) return;
    setEventStatus('running');
    await GameDatabase.updateEventControls({ status: 'running' });
    addAuditLog('Resumed match operations.');
  };

  const handleEndEvent = async () => {
    if (!permissions?.canEndEvent) return;
    if (window.confirm('Officially conclude Among Us match? Final scores and telemetry will be archived.')) {
      setEventStatus('ended');
      await GameDatabase.updateEventControls({ status: 'ended' });
      addAuditLog('Concluded Among Us match.');
    }
  };

  const handleToggleImpostorPowers = async () => {
    if (!permissions?.canToggleImpostorPowers) return;
    const nextState = !impostorPowersActive;
    setImpostorPowersActive(nextState);
    await GameDatabase.updateEventControls({ impostor_powers_active: nextState });
    addAuditLog(
      nextState
        ? 'Restored Impostor powers (Kills & Sabotages active).'
        : 'STOPPED Impostor powers (Impostor actions frozen by POC/Admin).'
    );
  };

  const handleToggleEmergency = async () => {
    if (!permissions?.canCallEmergency) return;
    const nextState = !emergencyActive;
    setEmergencyActive(nextState);
    if (nextState) {
      setActiveSabotage(null);
      await GameDatabase.callEmergency(user?.name || 'Facilitator Command', 'Emergency declared from Command Deck');
      addAuditLog('Triggered Emergency Meeting override siren.');
    } else {
      await GameDatabase.dismissEmergency();
      addAuditLog('Dismissed Emergency Meeting. Round resumed.');
    }
  };

  const handleTriggerSabotage = async (type: SabotageType) => {
    if (!permissions?.canTriggerSabotage || !type) return;
    setActiveSabotage(type);
    await GameDatabase.triggerSabotage(type, user?.name || 'Facilitator Command');
    addAuditLog(`Triggered sabotage alarm: [${type.toUpperCase()}].`);
  };

  const handleResolveSabotage = async () => {
    if (!activeSabotage) return;
    const current = activeSabotage;
    setActiveSabotage(null);
    await GameDatabase.resolveSabotage(current, user?.id || 'admin', user?.name || 'Station Command');
    addAuditLog(`Resolved sabotage alarm: [${current.toUpperCase()}]. All sectors restored.`);
  };

  // ============================================================================
  // ROOM ALLOTMENT & SQUAD MANAGEMENT ACTIONS
  // ============================================================================

  // Cryptographically secure random helper for game integrity and CodeQL compliance
  const getSecureRandomInt = (max: number): number => {
    if (max <= 0) return 0;
    const array = new Uint32Array(1);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
      return array[0] % max;
    }
    return Math.floor(Math.random() * max);
  };

  const secureShuffle = <T,>(arr: T[]): T[] => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = getSecureRandomInt(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const handleRandomizeRoomsAndImpostors = async () => {
    if (!permissions?.canAllotRoomsAndImpostors || teams.length === 0) return;

    const updated = [...teams];
    const shuffledRooms = secureShuffle([...AMONG_US_ROOMS]);

    updated.forEach((team, index) => {
      team.assignedRoom = shuffledRooms[index % shuffledRooms.length];
      team.isImpostor = false;
      team.impostorPlayerName = undefined;
    });

    const impostorIndices = new Set<number>();
    const countToAssign = Math.min(2, updated.length);

    while (impostorIndices.size < countToAssign) {
      const randIdx = getSecureRandomInt(updated.length);
      impostorIndices.add(randIdx);
    }

    impostorIndices.forEach(idx => {
      const team = updated[idx];
      team.isImpostor = true;
      const player =
        team.members && team.members.length > 0
          ? team.members[getSecureRandomInt(team.members.length)]
          : team.leaderName;
      team.impostorPlayerName = player;
    });

    setTeams(updated);
    await GameDatabase.batchUpdateTeams(
      updated.map(t => ({
        id: t.id,
        assignedRoom: t.assignedRoom,
        isImpostor: t.isImpostor,
        impostorPlayerName: t.impostorPlayerName,
      }))
    );

    addAuditLog(
      `Allotted ${updated.length} squads across 9 Skeld sectors and assigned ${countToAssign} covert Impostors in database.`
    );
  };

  const handleReassignTeamRoom = async (teamId: string, newRoom: RoomType) => {
    if (!permissions?.canEditTeam) return;
    setTeams(prev => prev.map(t => (t.id === teamId ? { ...t, assignedRoom: newRoom } : t)));
    await GameDatabase.updateTeam(teamId, { assignedRoom: newRoom });
    const target = teams.find(t => t.id === teamId);
    if (target) {
      addAuditLog(`Reassigned squad [${target.name}] to ${newRoom}.`);
    }
  };

  const handleResetScores = async () => {
    if (!permissions?.canEditTeam) return;
    if (window.confirm('Reset all squad scores, tasks completed, and clues solved back to zero?')) {
      await GameDatabase.resetAllTeamScores();
      setTeams(prev => prev.map(t => ({ ...t, score: 0, tasksCompleted: 0, cluesSolved: 0 })));
      addAuditLog('Reset all team scores and achievements in station database.');
    }
  };

  // Team CRUD
  const openAddTeamModal = () => {
    if (!permissions?.canAddTeam) return;
    setFormTeamName('');
    setFormLeaderName('');
    setFormEmail('');
    setFormPhone('');
    setFormMembers('');
    setFormRoom('Cafeteria');
    setFormScore(0);
    setFormIsImpostor(false);
    setIsAddTeamModalOpen(true);
  };

  const handleSaveNewTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTeamName || !formLeaderName) return;

    const membersArray = formMembers
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    const newTeamData: Partial<Team> = {
      name: formTeamName,
      leaderName: formLeaderName,
      email: formEmail || `${formTeamName.toLowerCase().replace(/\s+/g, '')}@nexus.org`,
      phone: formPhone || '+91 98000 00000',
      members: membersArray.length > 0 ? membersArray : [formLeaderName],
      color: '#00F0FF',
      score: Number(formScore) || 0,
      assignedRoom: formRoom,
      isImpostor: formIsImpostor,
      impostorPlayerName: formIsImpostor ? formLeaderName : undefined,
    };

    const created = await GameDatabase.createTeam(newTeamData);
    setTeams(prev => [created, ...prev.filter(t => t.id !== created.id)]);
    setIsAddTeamModalOpen(false);
    addAuditLog(`Registered new squad [${created.name}] stationed in ${created.assignedRoom}.`);
  };

  const openEditTeamModal = (team: Team) => {
    if (!permissions?.canEditTeam) return;
    setCurrentEditTeam(team);
    setFormTeamName(team.name);
    setFormLeaderName(team.leaderName);
    setFormEmail(team.email);
    setFormPhone(team.phone);
    setFormMembers(team.members ? team.members.join(', ') : '');
    setFormRoom(team.assignedRoom || 'Cafeteria');
    setFormScore(team.score);
    setFormIsImpostor(Boolean(team.isImpostor));
    setIsEditTeamModalOpen(true);
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditTeam || !formTeamName) return;

    const membersArray = formMembers
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    const updates: Partial<Team> = {
      name: formTeamName,
      leaderName: formLeaderName,
      phone: formPhone,
      members: membersArray.length > 0 ? membersArray : currentEditTeam.members,
      assignedRoom: formRoom,
      score: Number(formScore) || 0,
      isImpostor: formIsImpostor,
      impostorPlayerName: formIsImpostor ? currentEditTeam.impostorPlayerName || formLeaderName : undefined,
    };

    await GameDatabase.updateTeam(currentEditTeam.id, updates);
    setTeams(prev => prev.map(t => (t.id === currentEditTeam.id ? { ...t, ...updates } : t)));
    setIsEditTeamModalOpen(false);
    addAuditLog(`Updated telemetry & parameters for squad [${formTeamName}].`);
  };

  const handleDeleteTeam = async (id: string, name: string) => {
    if (!permissions?.canDeleteTeam) return;
    if (window.confirm(`Permanently remove squad [${name}] from station manifest?`)) {
      await GameDatabase.deleteTeam(id);
      setTeams(prev => prev.filter(t => t.id !== id));
      addAuditLog(`Decommissioned squad [${name}].`);
    }
  };

  // ============================================================================
  // STATION TASKS CRUD ACTIONS
  // ============================================================================

  const openAddTaskModal = () => {
    setCurrentEditTask(null);
    setTaskFormTitle('');
    setTaskFormRoom('Electrical');
    setTaskFormDesc('');
    setTaskFormSnippet('');
    setTaskFormClueHint('');
    setTaskFormFlag('');
    setTaskFormPoints(100);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: StationTask) => {
    setCurrentEditTask(task);
    setTaskFormTitle(task.title);
    setTaskFormRoom(task.room);
    setTaskFormDesc(task.description);
    setTaskFormSnippet(task.snippet || '');
    setTaskFormClueHint(task.clueHint || '');
    setTaskFormFlag(task.flagAnswer || '');
    setTaskFormPoints(task.points);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskFormTitle || !taskFormDesc) return;

    if (currentEditTask) {
      const updates = {
        title: taskFormTitle,
        room: taskFormRoom,
        description: taskFormDesc,
        snippet: taskFormSnippet || undefined,
        clueHint: taskFormClueHint || undefined,
        flagAnswer: taskFormFlag || undefined,
        points: Number(taskFormPoints) || 100,
      };
      await GameDatabase.updateTask(currentEditTask.id, updates);
      setTasks(prev => prev.map(t => (t.id === currentEditTask.id ? { ...t, ...updates } : t)));
      addAuditLog(`Updated station task '${taskFormTitle}' in [${taskFormRoom}].`);
    } else {
      const newTask = await GameDatabase.createTask({
        title: taskFormTitle,
        room: taskFormRoom,
        description: taskFormDesc,
        snippet: taskFormSnippet || undefined,
        clueHint: taskFormClueHint || undefined,
        flagAnswer: taskFormFlag || undefined,
        points: Number(taskFormPoints) || 100,
      });
      setTasks(prev => [newTask, ...prev]);
      addAuditLog(`Created station task '${newTask.title}' in [${newTask.room}].`);
    }
    setIsTaskModalOpen(false);
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (window.confirm(`Delete station task '${title}' from database?`)) {
      await GameDatabase.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      addAuditLog(`Deleted station task '${title}'.`);
    }
  };

  const handleResetTasks = async () => {
    if (window.confirm('Reset all station tasks back to pending status?')) {
      await GameDatabase.resetAllTasks();
      setTasks(prev => prev.map(t => ({ ...t, status: 'pending', completedByTeamId: undefined, completedAt: undefined })));
      addAuditLog('Reset all station tasks to pending.');
    }
  };

  // ============================================================================
  // TECH MYSTERY CLUES CRUD ACTIONS
  // ============================================================================

  const openAddClueModal = () => {
    setCurrentEditClue(null);
    setClueFormCaseFile(`DOSSIER #0${clues.length + 1}`);
    setClueFormTitle('');
    setClueFormDifficulty('Novice');
    setClueFormLocation('Central Corridor');
    setClueFormDesc('');
    setClueFormPuzzle('');
    setClueFormHint('');
    setClueFormPoints(250);
    setIsClueModalOpen(true);
  };

  const openEditClueModal = (clue: MysteryClue) => {
    setCurrentEditClue(clue);
    setClueFormCaseFile(clue.caseFile);
    setClueFormTitle(clue.title);
    setClueFormDifficulty(clue.difficulty);
    setClueFormLocation(clue.location);
    setClueFormDesc(clue.description);
    setClueFormPuzzle(clue.puzzleContent);
    setClueFormHint(clue.hint);
    setClueFormPoints(clue.points);
    setIsClueModalOpen(true);
  };

  const handleSaveClue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clueFormTitle || !clueFormDesc) return;

    if (currentEditClue) {
      const updates = {
        caseFile: clueFormCaseFile,
        title: clueFormTitle,
        difficulty: clueFormDifficulty,
        location: clueFormLocation,
        description: clueFormDesc,
        puzzleContent: clueFormPuzzle,
        hint: clueFormHint,
        points: Number(clueFormPoints) || 250,
      };
      await GameDatabase.updateClue(currentEditClue.id, updates);
      setClues(prev => prev.map(c => (c.id === currentEditClue.id ? { ...c, ...updates } : c)));
      addAuditLog(`Updated case dossier clue '${clueFormTitle}'.`);
    } else {
      const newClue = await GameDatabase.createClue({
        caseFile: clueFormCaseFile,
        title: clueFormTitle,
        difficulty: clueFormDifficulty,
        location: clueFormLocation,
        description: clueFormDesc,
        puzzleContent: clueFormPuzzle,
        hint: clueFormHint,
        points: Number(clueFormPoints) || 250,
      });
      setClues(prev => [newClue, ...prev]);
      addAuditLog(`Published new mystery dossier '${newClue.title}'.`);
    }
    setIsClueModalOpen(false);
  };

  const handleDeleteClue = async (clueId: string, title: string) => {
    if (window.confirm(`Purge case dossier clue '${title}' from database?`)) {
      await GameDatabase.deleteClue(clueId);
      setClues(prev => prev.filter(c => c.id !== clueId));
      addAuditLog(`Purged mystery clue '${title}'.`);
    }
  };

  // ============================================================================
  // FACILITATOR CLEARANCE DIRECTORY CRUD ACTIONS
  // ============================================================================

  const openAddFacilitatorModal = () => {
    setCurrentEditFacilitator(null);
    setFacId(`NX-POC-0${adminUsers.length + 1}`);
    setFacUsername(`poc0${adminUsers.length + 1}`);
    setFacName('');
    setFacEmail('');
    setFacRole('moderator');
    setFacPassword('poc2026');
    setFacPocRoom('Reactor');
    setFacTitle('Field Moderator & Sector POC');
    setIsFacilitatorModalOpen(true);
  };

  const openEditFacilitatorModal = (admin: AdminUser) => {
    setCurrentEditFacilitator(admin);
    setFacId(admin.facilitatorId || admin.id);
    setFacUsername(admin.username);
    setFacName(admin.name);
    setFacEmail(admin.email);
    setFacRole(admin.role);
    setFacPassword(admin.password || '••••••••');
    setFacPocRoom(admin.pocRoom || 'Reactor');
    setFacTitle(admin.title || '');
    setIsFacilitatorModalOpen(true);
  };

  const handleSaveFacilitator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facId || !facName || !facPassword) return;

    if (currentEditFacilitator) {
      const updates: Partial<AdminUser> = {
        name: facName,
        email: facEmail,
        role: facRole,
        pocRoom: facRole === 'moderator' ? facPocRoom : undefined,
        title: facTitle,
        password: facPassword,
      };
      await GameDatabase.updateAdminUser(currentEditFacilitator.id, updates);
      setAdminUsers(prev => prev.map(a => (a.id === currentEditFacilitator.id ? { ...a, ...updates } : a)));
      addAuditLog(`Updated clearance credentials for Facilitator [${facId}].`);
    } else {
      const created = await GameDatabase.createAdminUser({
        facilitatorId: facId.toUpperCase(),
        username: facUsername.toLowerCase(),
        name: facName,
        email: facEmail || `${facUsername.toLowerCase()}@nexus.org`,
        role: facRole,
        password: facPassword,
        pocRoom: facRole === 'moderator' ? facPocRoom : undefined,
        title: facTitle,
      });
      setAdminUsers(prev => [created, ...prev.filter(a => a.facilitatorId !== created.facilitatorId)]);
      addAuditLog(`Granted Facilitator clearance code [${created.facilitatorId}] (${created.role}).`);
    }
    setIsFacilitatorModalOpen(false);
  };

  const handleDeleteFacilitator = async (id: string, name: string) => {
    if (!permissions?.canManageAdmins) return;
    if (window.confirm(`Revoke facilitator clearance code for [${name}]?`)) {
      await GameDatabase.deleteAdminUser(id);
      setAdminUsers(prev => prev.filter(a => a.id !== id && a.facilitatorId !== id));
      addAuditLog(`Revoked clearance for facilitator [${name}].`);
    }
  };

  // Filtering Teams
  const filteredTeams = teams.filter(team => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.leaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.badgeCode && team.badgeCode.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRoom = selectedRoomFilter === 'ALL' || team.assignedRoom === selectedRoomFilter;
    return matchesSearch && matchesRoom;
  });

  // Filtering Tasks
  const filteredTasks = tasks.filter(task => {
    return taskFilterRoom === 'ALL' || task.room === taskFilterRoom;
  });

  // ============================================================================
  // AUTHENTICATION GATE SCREEN
  // ============================================================================

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] text-neutral-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-neutral-300 rounded-3xl p-8 sm:p-10 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl border border-neutral-200 bg-white p-1 mx-auto mb-4 shadow-sm flex items-center justify-center">
              <img
                src="/logo.jpeg"
                alt="NEXUS Insignia"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 block mb-1">
              NEXUS OPERATIONS GATE
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Admin Login
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Enter your credentials to enter the operations deck
            </p>
          </div>

          {loginError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form
            onSubmit={async e => {
              e.preventDefault();
              setLoginError('');
              setIsLoggingIn(true);
              const res = await login(loginId, loginPassword);
              setIsLoggingIn(false);
              if (!res.success) {
                setLoginError(res.error || 'Authentication rejected. Verify your credentials.');
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1.5 uppercase tracking-wider">
                Username / Facilitator ID
              </label>
              <input
                type="text"
                placeholder="Enter username"
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black placeholder:text-neutral-400 transition"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black font-mono placeholder:text-neutral-400 transition"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-800 active:scale-98 transition shadow-sm mt-3 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? 'Verifying Credentials...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN DASHBOARD (Clean, Modern Architectural White SaaS Interface)
  // ============================================================================

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-neutral-900 font-sans pb-16">
      {/* 1. TOP NAVBAR */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl border border-neutral-200 bg-white p-0.5 shadow-sm flex items-center justify-center">
              <img
                src="/logo.jpeg"
                alt="NEXUS Insignia"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-neutral-900 tracking-tight">
                  Among Us Facilitator Deck
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                  <span className={`w-1.5 h-1.5 rounded-full ${eventStatus === 'running' ? 'bg-black animate-pulse' : 'bg-neutral-400'}`} />
                  {eventStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Facilitator Clearance Identity & User Controls */}
          <div className="flex items-center gap-3">
            <a
              href="/play"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 rounded-lg text-xs font-semibold shadow-xs transition"
              title="Launch Mobile Player Deck in new window"
            >
              <span>Player Deck</span>
              <span className="text-[10px]">↗</span>
            </a>

            <div className="flex items-center gap-3 pl-3 border-l border-neutral-200">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-xs font-bold text-neutral-900 leading-tight">
                    {user?.name}
                  </span>
                  <span className="font-mono text-[10px] bg-neutral-900 text-white px-1.5 py-0.5 rounded font-bold">
                    {user?.username || user?.id}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                  {permissions?.levelName}
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-700 hover:text-black rounded-lg text-xs font-semibold transition"
                title="Log Out Clearance Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. OVERVIEW METRICS STRIP */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
              <span>Match Clock</span>
              <Clock className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-neutral-900">
              {formatTimer(matchSeconds)}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1 font-mono">
              Status: {eventStatus}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
              <span>Registered Squads</span>
              <Users className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">{teams.length}</div>
            <div className="text-[11px] text-neutral-400 mt-1">
              {teams.filter(t => t.isImpostor).length} Assigned Impostor Squads
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
              <span>Station Tasks & Clues</span>
              <FileCode className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">{tasks.length} / {clues.length}</div>
            <div className="text-[11px] text-neutral-400 mt-1">
              {tasks.filter(t => t.status === 'completed').length} completed tasks across sectors
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
              <span>Facilitators in DB</span>
              <Shield className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">{adminUsers.length}</div>
            <div className="text-[11px] text-neutral-400 mt-1">
              Active clearance registry
            </div>
          </div>
        </div>
      </div>

      {/* 3. EVENT ACTION COMMAND BAR */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Primary Event Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-1">
                Event State:
              </span>

              {eventStatus !== 'running' ? (
                <button
                  onClick={eventStatus === 'paused' ? handleResumeEvent : handleStartEvent}
                  disabled={!permissions?.canStartEvent && !permissions?.canPauseEvent}
                  className="px-4 py-2 bg-black text-white hover:bg-neutral-800 disabled:opacity-40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{eventStatus === 'paused' ? 'Resume Match' : 'Start Match'}</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseEvent}
                  disabled={!permissions?.canPauseEvent}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 disabled:opacity-40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Match</span>
                </button>
              )}

              {eventStatus !== 'ended' && (
                <button
                  onClick={handleEndEvent}
                  disabled={!permissions?.canEndEvent}
                  className="px-3.5 py-2 bg-neutral-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-neutral-700 border border-neutral-200 disabled:opacity-40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>End Match</span>
                </button>
              )}

              {/* Impostor Power Freeze Switch */}
              <div className="h-6 w-px bg-neutral-200 mx-1 hidden sm:block" />

              <button
                onClick={handleToggleImpostorPowers}
                disabled={!permissions?.canToggleImpostorPowers}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                  impostorPowersActive
                    ? 'bg-neutral-100 border-neutral-200 text-neutral-800 hover:bg-neutral-200'
                    : 'bg-red-50 border-red-200 text-red-700'
                } disabled:opacity-40`}
              >
                {impostorPowersActive ? (
                  <>
                    <Flame className="w-3.5 h-3.5 text-neutral-700" />
                    <span>Freeze Impostor Powers</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-red-600" />
                    <span>Restore Impostor Powers</span>
                  </>
                )}
              </button>

              {/* Emergency Meeting Siren Trigger */}
              <button
                onClick={handleToggleEmergency}
                disabled={!permissions?.canCallEmergency}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                  emergencyActive
                    ? 'bg-red-600 text-white border-red-700 animate-pulse'
                    : 'bg-neutral-100 border-neutral-200 text-neutral-800 hover:bg-neutral-200'
                } disabled:opacity-40`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{emergencyActive ? 'Dismiss Emergency Meeting' : 'Sound Emergency Siren'}</span>
              </button>
            </div>

            {/* Sabotage Override Station Switchboard */}
            <div className="flex items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-1">
                Sabotage Alarm:
              </span>

              <div className="flex items-center gap-1.5">
                {activeSabotage ? (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    <span className="text-xs font-bold text-red-700 uppercase">
                      {activeSabotage}
                    </span>
                    <button
                      onClick={handleResolveSabotage}
                      className="ml-2 px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleTriggerSabotage('reactor')}
                      disabled={!permissions?.canTriggerSabotage}
                      className="py-1.5 px-2 bg-white border border-neutral-200 hover:border-black rounded-lg text-xs font-medium text-neutral-800 transition disabled:opacity-30"
                    >
                      Reactor
                    </button>
                    <button
                      onClick={() => handleTriggerSabotage('oxygen')}
                      disabled={!permissions?.canTriggerSabotage}
                      className="py-1.5 px-2 bg-white border border-neutral-200 hover:border-black rounded-lg text-xs font-medium text-neutral-800 transition disabled:opacity-30"
                    >
                      O2
                    </button>
                    <button
                      onClick={() => handleTriggerSabotage('lights')}
                      disabled={!permissions?.canTriggerSabotage}
                      className="py-1.5 px-2 bg-white border border-neutral-200 hover:border-black rounded-lg text-xs font-medium text-neutral-800 transition disabled:opacity-30"
                    >
                      Lights
                    </button>
                    <button
                      onClick={() => handleTriggerSabotage('comms')}
                      disabled={!permissions?.canTriggerSabotage}
                      className="py-1.5 px-2 bg-white border border-neutral-200 hover:border-black rounded-lg text-xs font-medium text-neutral-800 transition disabled:opacity-30"
                    >
                      Comms
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TABS NAVIGATION */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex border-b border-neutral-200 gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-3.5 text-sm font-semibold transition border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'matrix'
                ? 'border-black text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>Station Sector Matrix</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-mono">
              9 Rooms
            </span>
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className={`pb-3.5 text-sm font-semibold transition border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'teams'
                ? 'border-black text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>Squad Roster Manifest</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-mono">
              {teams.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-3.5 text-sm font-semibold transition border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'tasks'
                ? 'border-black text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>Tasks & Clues Manager</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-mono">
              {tasks.length + clues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('facilitators')}
            className={`pb-3.5 text-sm font-semibold transition border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'facilitators'
                ? 'border-black text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>Facilitator Clearance Directory</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-mono">
              {adminUsers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`pb-3.5 text-sm font-semibold transition border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'telemetry'
                ? 'border-black text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>Audit Trail</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-mono">
              {auditLogs.length}
            </span>
          </button>
        </div>
      </div>

      {/* 5. TAB VIEWS */}
      <main className="max-w-7xl mx-auto px-6 pt-6">
        {/* ========================================================================= */}
        {/* TAB 1: STATION SECTOR MATRIX */}
        {/* ========================================================================= */}
        {activeTab === 'matrix' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Skeld Room Allotment & Impostor Distribution
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Allot squads across 9 Skeld sectors with covert Impostor generation and live room reassignment.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowImpostorRoster(!showImpostorRoster)}
                  className="px-3.5 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 transition"
                >
                  {showImpostorRoster ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showImpostorRoster ? 'Mask Impostors' : 'Reveal Impostors'}</span>
                </button>

                <button
                  onClick={handleRandomizeRoomsAndImpostors}
                  disabled={!permissions?.canAllotRoomsAndImpostors}
                  className="px-4 py-2 bg-black text-white hover:bg-neutral-800 disabled:opacity-40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Randomize Rooms & Impostors</span>
                </button>
              </div>
            </div>

            {/* 9-Room Skeld Station Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {AMONG_US_ROOMS.map(room => {
                const roomInfo = ROOM_METADATA[room];
                const roomTeams = teams.filter(t => (t.assignedRoom || 'Cafeteria') === room);
                const roomTasks = tasks.filter(t => t.room === room);

                return (
                  <div
                    key={room}
                    className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{roomInfo.icon}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-sm text-neutral-900">{room}</h4>
                              <span className="font-mono text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                                {roomInfo.code}
                              </span>
                            </div>
                            <span className="text-[11px] text-neutral-500">{roomInfo.description}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-neutral-900 font-mono px-2 py-0.5 bg-neutral-100 rounded-full">
                          {roomTeams.length} {roomTeams.length === 1 ? 'squad' : 'squads'}
                        </span>
                      </div>

                      {/* Stationed Squads */}
                      <div className="space-y-2.5">
                        {roomTeams.map(t => (
                          <div
                            key={t.id}
                            className={`p-3 rounded-xl border transition ${
                              showImpostorRoster && t.isImpostor
                                ? 'bg-red-50/60 border-red-200'
                                : 'bg-neutral-50/70 border-neutral-200/60 hover:bg-neutral-100/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-neutral-900">{t.name}</span>
                                {showImpostorRoster && t.isImpostor && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold uppercase">
                                    <Flame className="w-2.5 h-2.5" /> Impostor
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-xs font-bold text-neutral-700">
                                {t.score} pts
                              </span>
                            </div>

                            {/* Impostor Player Identifier */}
                            {showImpostorRoster && t.isImpostor && t.impostorPlayerName && (
                              <div className="mt-1.5 flex items-center justify-between text-[11px] text-red-700 bg-red-100/60 px-2 py-1 rounded-lg">
                                <span className="font-semibold flex items-center gap-1">
                                  <Flame className="w-3 h-3" /> Agent: {t.impostorPlayerName}
                                </span>
                              </div>
                            )}

                            {/* Squad Quick Room Move */}
                            <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                              <span>Move sector:</span>
                              <select
                                value={t.assignedRoom || room}
                                onChange={e => handleReassignTeamRoom(t.id, e.target.value as RoomType)}
                                disabled={!permissions?.canEditTeam}
                                className="bg-transparent border-0 text-neutral-700 font-semibold cursor-pointer focus:outline-none text-[11px]"
                              >
                                {AMONG_US_ROOMS.map(r => (
                                  <option key={r} value={r}>
                                    → {r}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}

                        {roomTeams.length === 0 && (
                          <div className="text-center py-6 text-xs text-neutral-400 border border-dashed border-neutral-200 rounded-xl">
                            No squad stationed in {room}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Room Tasks Summary */}
                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                      <span>{roomTasks.length} console tasks</span>
                      <button
                        onClick={() => {
                          setActiveTab('tasks');
                          setTaskFilterRoom(room);
                        }}
                        className="text-neutral-700 hover:text-black font-semibold"
                      >
                        Manage Tasks →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SQUAD ROSTER MANIFEST */}
        {/* ========================================================================= */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Registered Squad Manifest
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Manage team registrations, commanders, sector stationing, and telemetry scores.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleResetScores}
                  disabled={!permissions?.canEditTeam}
                  className="px-3.5 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 transition disabled:opacity-40"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Scores</span>
                </button>

                <button
                  onClick={openAddTeamModal}
                  disabled={!permissions?.canAddTeam}
                  className="px-4 py-2 bg-black text-white hover:bg-neutral-800 disabled:opacity-40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Squad</span>
                </button>
              </div>
            </div>

            {/* Squads Table */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search squad name, leader, badge..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-500">Sector Filter:</span>
                  <select
                    value={selectedRoomFilter}
                    onChange={e => setSelectedRoomFilter(e.target.value)}
                    className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none"
                  >
                    <option value="ALL">All Sectors</option>
                    {AMONG_US_ROOMS.map(r => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-5">Squad & Badge</th>
                    <th className="py-3.5 px-4">Commander</th>
                    <th className="py-3.5 px-4">Station Sector</th>
                    <th className="py-3.5 px-4">Role Clearance</th>
                    <th className="py-3.5 px-4">Score</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredTeams.map(t => (
                    <tr key={t.id} className="hover:bg-neutral-50/60 transition">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-neutral-900">{t.name}</div>
                        <div className="text-[11px] font-mono text-neutral-400">{t.badgeCode || 'NX-PENDING'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-neutral-800 font-medium">{t.leaderName}</div>
                        <div className="text-[11px] text-neutral-400">{t.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                          {t.assignedRoom || 'Cafeteria'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {t.isImpostor ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 font-bold rounded-full text-[11px]">
                            <Flame className="w-3 h-3" /> Impostor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-700 font-medium rounded-full text-[11px]">
                            Crewmate
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                        {t.score} pts
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEditTeamModal(t)}
                            disabled={!permissions?.canEditTeam}
                            className="p-1.5 text-neutral-500 hover:text-black rounded-lg hover:bg-neutral-100 transition disabled:opacity-30"
                            title="Edit Squad"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(t.id, t.name)}
                            disabled={!permissions?.canDeleteTeam}
                            className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-30"
                            title="Delete Squad"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredTeams.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-neutral-400 text-xs">
                        No squads found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TASKS & CLUES MANAGER */}
        {/* ========================================================================= */}
        {activeTab === 'tasks' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Station Tasks & Mystery Dossiers
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Full facilitator control to add, edit, or purge tasks, clues, code snippets, and verification tokens.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleResetTasks}
                  disabled={!permissions?.canManageTasksAndClues}
                  className="px-3.5 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 transition disabled:opacity-40"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Tasks</span>
                </button>

                <button
                  onClick={openAddClueModal}
                  disabled={!permissions?.canManageTasksAndClues}
                  className="px-3.5 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 hover:bg-neutral-100 flex items-center gap-1.5 transition disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Case Clue</span>
                </button>

                <button
                  onClick={openAddTaskModal}
                  disabled={!permissions?.canManageTasksAndClues}
                  className="px-4 py-2 bg-black text-white hover:bg-neutral-800 disabled:opacity-40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Station Task</span>
                </button>
              </div>
            </div>

            {/* 1. Station Tasks Subsection */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-neutral-900">
                    Station Console Tasks ({filteredTasks.length})
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-neutral-500 font-semibold">Filter Sector:</span>
                  <select
                    value={taskFilterRoom}
                    onChange={e => setTaskFilterRoom(e.target.value)}
                    className="px-3 py-1 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none"
                  >
                    <option value="ALL">All 9 Sectors</option>
                    {AMONG_US_ROOMS.map(r => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map(task => (
                  <div
                    key={task.id}
                    className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-800">
                          {ROOM_METADATA[task.room]?.icon} {task.room}
                        </span>
                        <span className="font-mono text-xs font-bold text-neutral-900">
                          +{task.points} pts
                        </span>
                      </div>

                      <h5 className="font-bold text-sm text-neutral-900 mb-1">{task.title}</h5>
                      <p className="text-xs text-neutral-500 mb-3">{task.description}</p>

                      {task.clueHint && (
                        <div className="mb-2 p-2 rounded-lg bg-neutral-50 border border-neutral-100 text-[11px] text-neutral-600">
                          <strong className="text-neutral-900">Clue / Hint:</strong> {task.clueHint}
                        </div>
                      )}

                      {task.snippet && (
                        <div className="mb-3 font-mono text-[10px] bg-neutral-900 text-neutral-200 p-2.5 rounded-lg overflow-x-auto">
                          <code>{task.snippet}</code>
                        </div>
                      )}

                      {task.flagAnswer && (
                        <div className="text-[11px] font-mono text-neutral-400">
                          Flag: <span className="text-neutral-800 font-semibold">{task.flagAnswer}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          task.status === 'completed'
                            ? 'bg-black text-white'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {task.status.toUpperCase()}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditTaskModal(task)}
                          disabled={!permissions?.canManageTasksAndClues}
                          className="p-1.5 text-neutral-500 hover:text-black rounded-lg hover:bg-neutral-100 transition disabled:opacity-30"
                          title="Edit Task"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id, task.title)}
                          disabled={!permissions?.canManageTasksAndClues}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-30"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredTasks.length === 0 && (
                  <div className="col-span-3 text-center py-10 text-neutral-400 text-xs border border-dashed border-neutral-200 rounded-2xl bg-white">
                    No station tasks found for the selected sector.
                  </div>
                )}
              </div>
            </div>

            {/* 2. Tech Mystery Case Dossiers Subsection */}
            <div>
              <h4 className="font-bold text-sm text-neutral-900 mb-4">
                Tech Mystery Detective Dossiers ({clues.length})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clues.map(clue => (
                  <div
                    key={clue.id}
                    className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                          {clue.caseFile}
                        </span>
                        <span className="font-mono text-xs font-bold text-neutral-900">
                          +{clue.points} pts
                        </span>
                      </div>

                      <h5 className="font-bold text-sm text-neutral-900 mb-1">{clue.title}</h5>
                      <div className="text-[11px] text-neutral-400 mb-2">Location: {clue.location}</div>
                      <p className="text-xs text-neutral-600 mb-3">{clue.description}</p>

                      <div className="mb-2 font-mono text-[11px] bg-neutral-900 text-white p-2.5 rounded-lg overflow-x-auto">
                        {clue.puzzleContent}
                      </div>

                      {clue.hint && (
                        <div className="text-[11px] text-neutral-500 italic mb-2">
                          Hint: {clue.hint}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-neutral-500">
                        {clue.solvedByTeamIds?.length || 0} solved
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditClueModal(clue)}
                          disabled={!permissions?.canManageTasksAndClues}
                          className="p-1.5 text-neutral-500 hover:text-black rounded-lg hover:bg-neutral-100 transition disabled:opacity-30"
                          title="Edit Clue"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClue(clue.id, clue.title)}
                          disabled={!permissions?.canManageTasksAndClues}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-30"
                          title="Purge Clue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: FACILITATOR CLEARANCE DIRECTORY (Stored in Database) */}
        {/* ========================================================================= */}
        {activeTab === 'facilitators' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Facilitator Clearance Directory
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Facilitator credentials, clearance tier levels, security passcodes, and sector assignments stored in PostgreSQL.
                </p>
              </div>

              {permissions?.canManageAdmins && (
                <button
                  onClick={openAddFacilitatorModal}
                  className="px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Grant Clearance</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminUsers.map(admin => {
                const isPasswordRevealed = showPasswords[admin.id || admin.facilitatorId || ''];
                return (
                  <div
                    key={admin.id || admin.facilitatorId}
                    className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3 border-b border-neutral-100 pb-3">
                        <span className="font-mono text-xs font-bold text-neutral-900 bg-neutral-100 px-2 py-1 rounded-lg">
                          {admin.facilitatorId || admin.username}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            admin.role === 'super_admin'
                              ? 'bg-black text-white'
                              : admin.role === 'admin'
                              ? 'bg-neutral-800 text-white'
                              : 'bg-neutral-200 text-neutral-800'
                          }`}
                        >
                          {admin.role === 'super_admin'
                            ? 'Level 3 Master'
                            : admin.role === 'admin'
                            ? 'Level 2 Admin'
                            : 'Level 1 POC'}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-neutral-900">{admin.name}</h4>
                      <div className="text-xs text-neutral-500 mt-0.5">{admin.title || admin.role}</div>
                      <div className="text-xs font-mono text-neutral-400 mt-1">{admin.email}</div>

                      {admin.pocRoom && (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-50 border border-neutral-100 text-xs font-medium text-neutral-700">
                          <span>Assigned Sector:</span>
                          <strong className="text-neutral-900">{admin.pocRoom}</strong>
                        </div>
                      )}

                      {/* Security Passcode Display */}
                      <div className="mt-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/60 flex items-center justify-between text-xs font-mono">
                        <span className="text-neutral-400 text-[11px]">Passcode:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-800">
                            {isPasswordRevealed ? admin.password || 'master2026' : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const key = admin.id || admin.facilitatorId || '';
                              setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
                            }}
                            className="text-neutral-400 hover:text-black"
                            title="Toggle passcode visibility"
                          >
                            {isPasswordRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {permissions?.canManageAdmins && (
                      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditFacilitatorModal(admin)}
                          className="px-3 py-1.5 text-neutral-600 hover:text-black border border-neutral-200 hover:border-neutral-300 rounded-lg text-xs font-semibold transition"
                        >
                          Edit
                        </button>
                        {admin.role !== 'super_admin' && (
                          <button
                            onClick={() => handleDeleteFacilitator(admin.id || admin.facilitatorId || '', admin.name)}
                            className="px-3 py-1.5 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg text-xs font-semibold transition"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: AUDIT TRAIL */}
        {/* ========================================================================= */}
        {activeTab === 'telemetry' && (
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-3">
              Operational Action Log & Realtime Audit Trail
            </h3>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {auditLogs.map(log => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/60 flex flex-col sm:flex-row justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="text-neutral-400 font-mono mr-2.5">[{log.time}]</span>
                    <strong className="text-neutral-900 mr-2">{log.user}:</strong>
                    <span className="text-neutral-700">{log.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: ADD SQUAD */}
      {/* ========================================================================= */}
      {isAddTeamModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-7 w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4 mb-5">
              <h3 className="text-base font-bold text-neutral-900">Register New Squad</h3>
              <button
                onClick={() => setIsAddTeamModalOpen(false)}
                className="text-neutral-400 hover:text-black text-xs font-semibold"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleSaveNewTeam} className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Squad Name *</label>
                <input
                  type="text"
                  value={formTeamName}
                  onChange={e => setFormTeamName(e.target.value)}
                  placeholder="e.g. Red Infiltrators"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Commander Name *</label>
                  <input
                    type="text"
                    value={formLeaderName}
                    onChange={e => setFormLeaderName(e.target.value)}
                    placeholder="Alex Vance"
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Squad Personnel (Comma-separated)</label>
                <input
                  type="text"
                  value={formMembers}
                  onChange={e => setFormMembers(e.target.value)}
                  placeholder="Alex Vance, Jordan Lee, Taylor Swift"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Station Sector</label>
                  <select
                    value={formRoom}
                    onChange={e => setFormRoom(e.target.value as RoomType)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {AMONG_US_ROOMS.map(r => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Initial Points</label>
                  <input
                    type="number"
                    value={formScore}
                    onChange={e => setFormScore(Number(e.target.value))}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer border border-neutral-200 p-3 rounded-xl bg-neutral-50">
                  <input
                    type="checkbox"
                    checked={formIsImpostor}
                    onChange={e => setFormIsImpostor(e.target.checked)}
                    className="accent-black w-4 h-4 rounded"
                  />
                  <span className="text-xs font-semibold text-neutral-800">
                    Designate as Covert Impostor Squad
                  </span>
                </label>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddTeamModalOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-black text-white rounded-xl font-semibold hover:bg-neutral-800 shadow-sm"
                >
                  Save Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT SQUAD */}
      {/* ========================================================================= */}
      {isEditTeamModalOpen && currentEditTeam && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-7 w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4 mb-5">
              <h3 className="text-base font-bold text-neutral-900">
                Edit Squad: {currentEditTeam.name}
              </h3>
              <button
                onClick={() => setIsEditTeamModalOpen(false)}
                className="text-neutral-400 hover:text-black text-xs font-semibold"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleUpdateTeam} className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Squad Name</label>
                <input
                  type="text"
                  value={formTeamName}
                  onChange={e => setFormTeamName(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Commander Name</label>
                  <input
                    type="text"
                    value={formLeaderName}
                    onChange={e => setFormLeaderName(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Squad Personnel (Comma-separated)</label>
                <input
                  type="text"
                  value={formMembers}
                  onChange={e => setFormMembers(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Station Sector</label>
                  <select
                    value={formRoom}
                    onChange={e => setFormRoom(e.target.value as RoomType)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {AMONG_US_ROOMS.map(r => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Points</label>
                  <input
                    type="number"
                    value={formScore}
                    onChange={e => setFormScore(Number(e.target.value))}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer border border-neutral-200 p-3 rounded-xl bg-neutral-50">
                  <input
                    type="checkbox"
                    checked={formIsImpostor}
                    onChange={e => setFormIsImpostor(e.target.checked)}
                    className="accent-black w-4 h-4 rounded"
                  />
                  <span className="text-xs font-semibold text-neutral-800">
                    Designate as Covert Impostor Squad
                  </span>
                </label>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditTeamModalOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-black text-white rounded-xl font-semibold hover:bg-neutral-800 shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT STATION TASK */}
      {/* ========================================================================= */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-7 w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4 mb-5">
              <h3 className="text-base font-bold text-neutral-900">
                {currentEditTask ? `Edit Task: ${currentEditTask.title}` : 'Add New Station Task'}
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-neutral-400 hover:text-black text-xs font-semibold"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Task Title *</label>
                <input
                  type="text"
                  value={taskFormTitle}
                  onChange={e => setTaskFormTitle(e.target.value)}
                  placeholder="e.g. Calibrate Plasma Condenser"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Station Sector</label>
                  <select
                    value={taskFormRoom}
                    onChange={e => setTaskFormRoom(e.target.value as RoomType)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {AMONG_US_ROOMS.map(r => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Points</label>
                  <input
                    type="number"
                    value={taskFormPoints}
                    onChange={e => setTaskFormPoints(Number(e.target.value))}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Description / Briefing *</label>
                <textarea
                  rows={2}
                  value={taskFormDesc}
                  onChange={e => setTaskFormDesc(e.target.value)}
                  placeholder="Explain what the crewmate squad must inspect or configure."
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Clue / Detective Hint (Optional)</label>
                <input
                  type="text"
                  value={taskFormClueHint}
                  onChange={e => setTaskFormClueHint(e.target.value)}
                  placeholder="e.g. Look for the yellow toggle switch on terminal 3."
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Code Snippet / Puzzle Payload (Optional)</label>
                <textarea
                  rows={2}
                  value={taskFormSnippet}
                  onChange={e => setTaskFormSnippet(e.target.value)}
                  placeholder="const grid = calibrate(0x7F);"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Verification Flag / Passcode (Optional)</label>
                <input
                  type="text"
                  value={taskFormFlag}
                  onChange={e => setTaskFormFlag(e.target.value)}
                  placeholder="FLAG_CALIBRATION_OK"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-black text-white rounded-xl font-semibold hover:bg-neutral-800 shadow-sm"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT MYSTERY CLUE */}
      {/* ========================================================================= */}
      {isClueModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-7 w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4 mb-5">
              <h3 className="text-base font-bold text-neutral-900">
                {currentEditClue ? `Edit Dossier: ${currentEditClue.title}` : 'Add Detective Case Clue'}
              </h3>
              <button
                onClick={() => setIsClueModalOpen(false)}
                className="text-neutral-400 hover:text-black text-xs font-semibold"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleSaveClue} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Dossier Code *</label>
                  <input
                    type="text"
                    value={clueFormCaseFile}
                    onChange={e => setClueFormCaseFile(e.target.value)}
                    placeholder="DOSSIER #01"
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Difficulty</label>
                  <select
                    value={clueFormDifficulty}
                    onChange={e => setClueFormDifficulty(e.target.value as any)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="Novice">Novice</option>
                    <option value="Investigator">Investigator</option>
                    <option value="Cyber Detective">Cyber Detective</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Clue Title *</label>
                <input
                  type="text"
                  value={clueFormTitle}
                  onChange={e => setClueFormTitle(e.target.value)}
                  placeholder="e.g. The Caesar Shift of Patient Zero"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Location on Skeld</label>
                  <input
                    type="text"
                    value={clueFormLocation}
                    onChange={e => setClueFormLocation(e.target.value)}
                    placeholder="e.g. MedBay Bio-Terminal"
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Points</label>
                  <input
                    type="number"
                    value={clueFormPoints}
                    onChange={e => setClueFormPoints(Number(e.target.value))}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Description / Mystery Context *</label>
                <textarea
                  rows={2}
                  value={clueFormDesc}
                  onChange={e => setClueFormDesc(e.target.value)}
                  placeholder="Explain the anomaly or clue recovered at this station."
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Cipher Payload / Secret Text *</label>
                <textarea
                  rows={2}
                  value={clueFormPuzzle}
                  onChange={e => setClueFormPuzzle(e.target.value)}
                  placeholder="GUR_VZCBFGBE_VF_VAFVQR_GRPABYBTl"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Cryptographic Hint</label>
                <input
                  type="text"
                  value={clueFormHint}
                  onChange={e => setClueFormHint(e.target.value)}
                  placeholder="e.g. Rotate Latin letters by 13 positions (ROT-13)."
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsClueModalOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-black text-white rounded-xl font-semibold hover:bg-neutral-800 shadow-sm"
                >
                  Save Dossier Clue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT FACILITATOR CLEARANCE */}
      {/* ========================================================================= */}
      {isFacilitatorModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-7 w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4 mb-5">
              <h3 className="text-base font-bold text-neutral-900">
                {currentEditFacilitator
                  ? `Edit Facilitator: ${currentEditFacilitator.name}`
                  : 'Grant Facilitator Clearance'}
              </h3>
              <button
                onClick={() => setIsFacilitatorModalOpen(false)}
                className="text-neutral-400 hover:text-black text-xs font-semibold"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleSaveFacilitator} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Clearance ID Code *
                  </label>
                  <input
                    type="text"
                    value={facId}
                    onChange={e => setFacId(e.target.value.toUpperCase())}
                    placeholder="e.g. NX-POC-04"
                    disabled={Boolean(currentEditFacilitator)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black disabled:bg-neutral-100"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Clearance Tier *
                  </label>
                  <select
                    value={facRole}
                    onChange={e => setFacRole(e.target.value as AdminRole)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="super_admin">Level 3: Master Admin</option>
                    <option value="admin">Level 2: Event Admin</option>
                    <option value="moderator">Level 1: Sector POC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={facName}
                    onChange={e => setFacName(e.target.value)}
                    placeholder="Rohan Sharma"
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Username</label>
                  <input
                    type="text"
                    value={facUsername}
                    onChange={e => setFacUsername(e.target.value.toLowerCase())}
                    placeholder="rohan.admin"
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">Official Email</label>
                  <input
                    type="email"
                    value={facEmail}
                    onChange={e => setFacEmail(e.target.value)}
                    placeholder="rohan@nexus.org"
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                {facRole === 'moderator' ? (
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">Assigned POC Sector</label>
                    <select
                      value={facPocRoom}
                      onChange={e => setFacPocRoom(e.target.value as RoomType)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      {AMONG_US_ROOMS.map(r => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">Operational Title</label>
                    <input
                      type="text"
                      value={facTitle}
                      onChange={e => setFacTitle(e.target.value)}
                      placeholder="Lead Coordinator"
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Security Passcode *
                </label>
                <input
                  type="text"
                  value={facPassword}
                  onChange={e => setFacPassword(e.target.value)}
                  placeholder="Passcode for deck authentication"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFacilitatorModalOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-black text-white rounded-xl font-semibold hover:bg-neutral-800 shadow-sm"
                >
                  Save Clearance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
