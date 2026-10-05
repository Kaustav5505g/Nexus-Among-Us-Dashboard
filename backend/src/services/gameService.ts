import {
  Team,
  StationTask,
  MysteryClue,
  GameState,
  ActivityLogItem,
  SabotageType,
  SabotageState,
} from '../models/types';
import {
  initialTeams,
  initialTasks,
  initialMysteryClues,
  initialGameState,
  initialActivityLogs,
} from '../models/mockData';

class GameService {
  private teams: Team[] = [...initialTeams];
  private tasks: StationTask[] = [...initialTasks];
  private mysteryClues: MysteryClue[] = [...initialMysteryClues];
  private gameState: GameState = { ...initialGameState };
  private activityLogs: ActivityLogItem[] = [...initialActivityLogs];
  private sabotageTimer: NodeJS.Timeout | null = null;
  private emergencyTimer: NodeJS.Timeout | null = null;
  private socketBroadcastCallback: ((event: string, payload: any) => void) | null = null;

  public setSocketBroadcaster(cb: (event: string, payload: any) => void) {
    this.socketBroadcastCallback = cb;
  }

  private broadcast(event: string, payload: any) {
    if (this.socketBroadcastCallback) {
      this.socketBroadcastCallback(event, payload);
    }
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public getTeams(): Team[] {
    return [...this.teams].sort((a, b) => b.score - a.score);
  }

  public getTeamById(id: string): Team | undefined {
    return this.teams.find(t => t.id === id);
  }

  public registerTeam(data: {
    name: string;
    leaderName: string;
    email: string;
    phone: string;
    members: string[];
    color?: string;
  }): Team {
    const id = `team-${Date.now().toString(36)}`;
    const badgeCode = `NEXUS-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const colors = ['#00F0FF', '#FF0055', '#10B981', '#FBBF24', '#A855F7', '#EC4899', '#3B82F6'];
    const assignedColor = data.color || colors[this.teams.length % colors.length];

    const newTeam: Team = {
      id,
      name: data.name,
      leaderName: data.leaderName,
      email: data.email,
      phone: data.phone,
      members: data.members && data.members.length ? data.members : [data.leaderName],
      color: assignedColor,
      score: 0,
      tasksCompleted: 0,
      cluesSolved: 0,
      status: 'active',
      registeredEvents: ['Coded Chaos (Among Us)', 'Tech Mystery (Detective Room)'], // 1 Registration = 2 Events!
      badgeCode,
      createdAt: new Date().toISOString(),
    };

    this.teams.push(newTeam);
    this.addLog('system', `Squad [${newTeam.name}] joined the arena with Dual-Event Access Pass!`, newTeam.name, 'success');
    this.broadcast('teams:update', this.getTeams());
    return newTeam;
  }

  public getTasks(): StationTask[] {
    return this.tasks;
  }

  public completeTask(taskId: string, teamId: string): { success: boolean; task?: StationTask; message: string } {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      return { success: false, message: 'Task not found' };
    }

    if (task.status === 'completed') {
      return { success: false, message: 'Task already completed' };
    }

    const team = this.teams.find(t => t.id === teamId);
    if (!team) {
      return { success: false, message: 'Team not found' };
    }

    task.status = 'completed';
    task.completedByTeamId = team.id;
    task.completedAt = new Date().toISOString();

    team.tasksCompleted += 1;
    team.score += task.points;

    this.gameState.completedTasksCount = this.tasks.filter(t => t.status === 'completed').length;

    this.addLog('task', `[${team.name}] completed [${task.title}] in ${task.room} (+${task.points} pts)`, team.name, 'success');

    this.broadcast('task:update', task);
    this.broadcast('game:state', this.gameState);
    this.broadcast('teams:update', this.getTeams());

    return { success: true, task, message: 'Task completed successfully!' };
  }

  public triggerSabotage(type: SabotageType, customMessage?: string): SabotageState {
    if (this.sabotageTimer) {
      clearInterval(this.sabotageTimer);
      this.sabotageTimer = null;
    }

    let title = 'Sabotage Alarm';
    let description = 'Unknown anomaly detected on board.';
    let duration = 60;

    switch (type) {
      case 'reactor':
        title = 'CRITICAL: Reactor Meltdown!';
        description = 'Two crewmates must hold simultaneous stabilization pads in Reactor!';
        duration = 50;
        break;
      case 'oxygen':
        title = 'CRITICAL: Oxygen Depletion Alarm!';
        description = 'O2 levels dropping rapidly! Purge scrubbers in Admin & O2 rooms!';
        duration = 45;
        break;
      case 'lights':
        title = 'WARNING: Electrical Blackout!';
        description = 'Station visibility crippled. Flip circuit breakers in Electrical!';
        duration = 60;
        break;
      case 'comms':
        title = 'WARNING: Communications Jammed!';
        description = 'Task list & cameras offline. Re-tune wave frequency in Comms!';
        duration = 60;
        break;
    }

    if (customMessage) {
      description = customMessage;
    }

    this.gameState.sabotage = {
      active: true,
      type,
      title,
      description,
      durationSeconds: duration,
      timeRemaining: duration,
      triggeredAt: Date.now(),
    };

    this.addLog('sabotage', `IMPOSTOR SABOTAGE: ${title} - ${description}`, undefined, 'danger');
    this.broadcast('sabotage:alert', this.gameState.sabotage);
    this.broadcast('game:state', this.gameState);

    this.sabotageTimer = setInterval(() => {
      if (!this.gameState.sabotage.active) {
        if (this.sabotageTimer) clearInterval(this.sabotageTimer);
        return;
      }

      this.gameState.sabotage.timeRemaining -= 1;
      this.broadcast('sabotage:tick', { timeRemaining: this.gameState.sabotage.timeRemaining });

      if (this.gameState.sabotage.timeRemaining <= 0) {
        if (this.sabotageTimer) clearInterval(this.sabotageTimer);
        this.addLog('sabotage', `SABOTAGE TIMEOUT: Impostors achieve critical failure advantage!`, undefined, 'danger');
        this.gameState.sabotage.active = false;
        this.broadcast('game:state', this.gameState);
      }
    }, 1000);

    return this.gameState.sabotage;
  }

  public resolveSabotage(teamId?: string): SabotageState {
    if (this.sabotageTimer) {
      clearInterval(this.sabotageTimer);
      this.sabotageTimer = null;
    }

    const previousType = this.gameState.sabotage.type;
    this.gameState.sabotage = {
      active: false,
      type: null,
      title: 'Systems Nominal',
      description: 'Station systems stabilized.',
      durationSeconds: 60,
      timeRemaining: 0,
      triggeredAt: null,
    };

    let solverMsg = 'Station crew';
    if (teamId) {
      const team = this.teams.find(t => t.id === teamId);
      if (team) {
        team.score += 150;
        solverMsg = `Team [${team.name}]`;
      }
    }

    this.addLog('sabotage', `Sabotage resolved by ${solverMsg}! Critical systems restored (+150 pts).`, undefined, 'success');
    this.broadcast('sabotage:resolved', { resolvedBy: solverMsg, previousType });
    this.broadcast('game:state', this.gameState);
    this.broadcast('teams:update', this.getTeams());

    return this.gameState.sabotage;
  }

  public triggerEmergencyMeeting(caller: string, reason: string): GameState {
    if (this.emergencyTimer) {
      clearInterval(this.emergencyTimer);
      this.emergencyTimer = null;
    }

    // Resolve any active sabotage when meeting is called
    if (this.gameState.sabotage.active) {
      this.resolveSabotage();
    }

    this.gameState.status = 'emergency';
    this.gameState.emergency = {
      active: true,
      caller,
      reason: reason || 'Dead Body Reported / Suspect Activity Observed',
      timeRemaining: 90,
      votes: {},
    };

    this.addLog('emergency', `🚨 EMERGENCY MEETING CALLED by ${caller}: "${this.gameState.emergency.reason}"`, caller, 'danger');
    this.broadcast('emergency:called', this.gameState.emergency);
    this.broadcast('game:state', this.gameState);

    this.emergencyTimer = setInterval(() => {
      if (!this.gameState.emergency.active) {
        if (this.emergencyTimer) clearInterval(this.emergencyTimer);
        return;
      }

      this.gameState.emergency.timeRemaining -= 1;
      this.broadcast('emergency:tick', { timeRemaining: this.gameState.emergency.timeRemaining });

      if (this.gameState.emergency.timeRemaining <= 0) {
        this.endEmergencyMeeting();
      }
    }, 1000);

    return this.gameState;
  }

  public voteEmergency(voterTeamId: string, suspectName: string) {
    if (!this.gameState.emergency.active) return;
    this.gameState.emergency.votes[voterTeamId] = suspectName;
    this.broadcast('emergency:vote', { voterTeamId, suspectName, totalVotes: Object.keys(this.gameState.emergency.votes).length });
  }

  public endEmergencyMeeting(ejectedPlayer?: string): GameState {
    if (this.emergencyTimer) {
      clearInterval(this.emergencyTimer);
      this.emergencyTimer = null;
    }

    this.gameState.status = 'in_progress';
    this.gameState.emergency = {
      active: false,
      caller: null,
      reason: null,
      timeRemaining: 0,
      votes: {},
    };

    const msg = ejectedPlayer
      ? `Voting concluded. [${ejectedPlayer}] was ejected into the cosmos!`
      : `Voting concluded with no ejection (Tie or Skipped).`;

    this.addLog('emergency', msg, undefined, 'info');
    this.broadcast('emergency:ended', { ejectedPlayer, message: msg });
    this.broadcast('game:state', this.gameState);

    return this.gameState;
  }

  public getMysteryClues(): MysteryClue[] {
    return this.mysteryClues;
  }

  public verifyMysteryAnswer(clueId: string, teamId: string, answer: string): { success: boolean; message: string; pointsAwarded?: number } {
    const clue = this.mysteryClues.find(c => c.id === clueId);
    if (!clue) {
      return { success: false, message: 'Clue dossier not found.' };
    }

    const team = this.teams.find(t => t.id === teamId);
    if (!team) {
      return { success: false, message: 'Invalid team ID.' };
    }

    if (clue.solvedByTeamIds.includes(teamId)) {
      return { success: false, message: 'Your squad has already cracked this case file!' };
    }

    const normalizedInput = answer.trim().toUpperCase().replace(/[\s-]+/g, '_');
    const normalizedTarget = clue.flagHash.trim().toUpperCase();

    if (normalizedInput === normalizedTarget) {
      clue.solvedByTeamIds.push(teamId);
      team.cluesSolved += 1;
      team.score += clue.points;

      this.addLog('clue', `DETECTIVE BREAKTHROUGH: Team [${team.name}] decrypted [${clue.title}] (+${clue.points} pts)`, team.name, 'success');

      this.broadcast('clue:solved', { clueId, teamId, teamName: team.name, points: clue.points });
      this.broadcast('teams:update', this.getTeams());

      return {
        success: true,
        message: `CORRECT! Decryption successful. You earned ${clue.points} detective points!`,
        pointsAwarded: clue.points,
      };
    } else {
      return {
        success: false,
        message: 'Decryption failed: Key hash mismatch. Inspect the clue and hint again.',
      };
    }
  }

  public getActivityLogs(): ActivityLogItem[] {
    return this.activityLogs;
  }

  public addLog(
    type: ActivityLogItem['type'],
    message: string,
    teamName?: string,
    severity: ActivityLogItem['severity'] = 'info'
  ) {
    const logItem: ActivityLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type,
      message,
      teamName,
      severity,
    };
    this.activityLogs.unshift(logItem);
    if (this.activityLogs.length > 50) {
      this.activityLogs.pop();
    }
    this.broadcast('activity:new', logItem);
  }

  public resetMatch(): GameState {
    this.tasks = initialTasks.map(t => ({
      ...t,
      status: 'pending',
      completedByTeamId: undefined,
      completedAt: undefined,
    }));

    this.mysteryClues = initialMysteryClues.map(c => ({
      ...c,
      solvedByTeamIds: [],
    }));

    this.teams.forEach(t => {
      t.score = 0;
      t.tasksCompleted = 0;
      t.cluesSolved = 0;
      t.status = 'active';
    });

    this.gameState = {
      ...initialGameState,
      status: 'in_progress',
      completedTasksCount: 0,
      startedAt: new Date().toISOString(),
    };

    this.addLog('system', 'Game Master has reset the match. All boards zeroed.', undefined, 'warning');
    this.broadcast('game:reset', { state: this.gameState, teams: this.teams, tasks: this.tasks });
    return this.gameState;
  }
}

export const gameService = new GameService();
