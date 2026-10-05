import { supabase } from './supabase';
import { Team, RoomType, SabotageType, StationTask, MysteryClue, AdminUser, AdminRole } from '../types';
import { INITIAL_ADMIN_TEAMS } from '../data/initialAdminData';

// Types for Event Master Controls
export interface EventControls {
  id: string;
  status: 'standby' | 'running' | 'paused' | 'ended';
  impostor_powers_active: boolean;
  active_sabotage: SabotageType;
  emergency_active: boolean;
  elapsed_seconds: number;
  current_round: number;
  updated_at?: string;
}

export interface ActivityLogItem {
  id: string;
  type: 'task' | 'sabotage' | 'emergency' | 'clue' | 'kill' | 'system' | 'admin';
  message: string;
  team_name?: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
  created_at: string;
}

export interface EmergencyMeetingItem {
  id: string;
  caller_name: string;
  reason: string;
  status: 'active' | 'ended';
  time_remaining: number;
  created_at: string;
}

// Initial fallback tasks if database table is not seeded yet
const DEFAULT_STATION_TASKS: StationTask[] = [
  {
    id: 'task-elec-01',
    title: 'Fix Circuit Breakers & Logic Gate',
    room: 'Electrical',
    description: 'Resolve the asynchronous race condition in the primary breaker module to stabilize lighting grid.',
    snippet: 'async function restorePower() {\n  await resetBreaker(0x7F);\n  return true;\n}',
    clueHint: 'Check bitwise mask 0x7F against breaker switch array #4.',
    flagAnswer: 'FLAG_VOLTAGE_NOMINAL',
    points: 100,
    status: 'pending',
  },
  {
    id: 'task-elec-02',
    title: 'Divert Aux Power to Shields',
    room: 'Electrical',
    description: 'Reroute high-draw conduits from non-essential galley heaters to external magnetic deflection deflectors.',
    snippet: 'reroute(powerGrid.galley, powerGrid.deflectors, 85);',
    clueHint: 'Flip auxiliary relays 3 and 7 on the central electrical chassis.',
    flagAnswer: 'FLAG_AUX_SHIELDS_ONLINE',
    points: 120,
    status: 'pending',
  },
  {
    id: 'task-react-01',
    title: 'Quantum Core Synchronization',
    room: 'Reactor',
    description: 'Calibrate harmonic resonance between upper and lower quantum flux manifolds to prevent thermal runaway.',
    snippet: 'const resonance = Math.sqrt(fluxA * fluxB) / 2.718;',
    clueHint: 'Match frequencies to Euler harmonic ratio (e = 2.718).',
    flagAnswer: 'FLAG_CORE_SYNCHRONIZED',
    points: 150,
    status: 'pending',
  },
  {
    id: 'task-react-02',
    title: 'Unlock Primary Manifolds',
    room: 'Reactor',
    description: 'Input sequence 1-10 on numeric matrix keypad in ascending prime order.',
    snippet: 'keypad.enterSequence([2, 3, 5, 7]);',
    clueHint: 'Only enter the prime values strictly under 10.',
    flagAnswer: 'FLAG_MANIFOLD_UNLOCKED',
    points: 110,
    status: 'pending',
  },
  {
    id: 'task-med-01',
    title: 'DNA Sample Scan & Cipher Match',
    room: 'MedBay',
    description: 'Deconvolve the synthetic nucleotide sequence left on the biometric scanner.',
    snippet: 'MATCH // ATCG-9921-X // PATIENT CLASSIFIED',
    clueHint: 'Look for adenine-thymine base inversion in strand 3.',
    flagAnswer: 'FLAG_DNA_DECONVOLVED',
    points: 120,
    status: 'pending',
  },
  {
    id: 'task-med-02',
    title: 'Inspect Biometric Diagnostic Bed',
    room: 'MedBay',
    description: 'Run complete 60-second diagnostic cycle on station biometric pod alpha.',
    snippet: 'scanner.runDiagnostics({ target: "player_biometrics", depth: "cellular" });',
    clueHint: 'Ensure the player remains standing on the green sensor plate.',
    flagAnswer: 'FLAG_DIAGNOSTICS_CLEAR',
    points: 90,
    status: 'pending',
  },
  {
    id: 'task-nav-01',
    title: 'Chart Sublight Trajectory Coordinates',
    room: 'Navigation',
    description: 'Plot shortest vector path through asteroid belt sector 7G avoid collision corridors.',
    snippet: 'dijkstra(starMap, "Skeld", "NexusHub");',
    clueHint: 'Compute path weight using shortest distance node Dijkstra.',
    flagAnswer: 'FLAG_NAV_VECTOR_LOCKED',
    points: 110,
    status: 'pending',
  },
  {
    id: 'task-nav-02',
    title: 'Stabilize Steering Gyroscope',
    room: 'Navigation',
    description: 'Align crosshairs over the pulsating telemetry beacon until drift reaches zero.',
    snippet: 'gyro.calibrate({ pitch: 0.00, yaw: 0.00, roll: 0.00 });',
    clueHint: 'Hold cursor within 2-pixel tolerance for 3 continuous seconds.',
    flagAnswer: 'FLAG_GYRO_STABILIZED',
    points: 100,
    status: 'pending',
  },
  {
    id: 'task-admin-01',
    title: 'Swipe Holographic ID Card',
    room: 'Admin',
    description: 'Calibrate card swipe duration between 0.8s and 1.2s without speed jitter.',
    snippet: 'AUTH PROTOCOL: SWIPE_SPEED = 0.94s [ACCEPTED]',
    clueHint: 'A steady medium swipe yields green pass verification.',
    flagAnswer: 'FLAG_CARD_VERIFIED',
    points: 80,
    status: 'pending',
  },
  {
    id: 'task-admin-02',
    title: 'Upload Biometric Route Logs',
    room: 'Admin',
    description: 'Transmit local Skeld sector routing records to planetary command downlink.',
    snippet: 'transferFile("route_logs.tar.gz", "downlink://ground-control");',
    clueHint: 'Do not close the transfer dialog before packet 100/100.',
    flagAnswer: 'FLAG_ROUTE_LOGS_UPLOADED',
    points: 100,
    status: 'pending',
  },
  {
    id: 'task-o2-01',
    title: 'Clean Atmospheric Filter Canister',
    room: 'O2',
    description: 'Purge scrubbed carbon particulate from manifold B secondary bypass chamber.',
    snippet: 'SCRUB_O2_PRESSURE = 101.3 kPa [NOMINAL]',
    clueHint: 'Drag 6 discarded leaves into the waste ejection chute.',
    flagAnswer: 'FLAG_O2_SCRUBBER_CLEAN',
    points: 90,
    status: 'pending',
  },
  {
    id: 'task-o2-02',
    title: 'Empty Waste Ejection Chute',
    room: 'O2',
    description: 'Pull down pneumatic lever for 3 seconds to expel non-recyclable canister debris.',
    snippet: 'chute.release(PNEUMATIC_VALVE_MAX);',
    clueHint: 'Hold handle firmly until audio hiss completes.',
    flagAnswer: 'FLAG_CHUTE_EXPELLED',
    points: 90,
    status: 'pending',
  },
  {
    id: 'task-weap-01',
    title: 'Target Calibration & Meteor Deflection',
    room: 'Weapons',
    description: 'Calculate lead firing angle for approaching orbital debris traveling at 0.15c.',
    snippet: 'trajectory = leadTarget(debrisVector, 0.15);',
    clueHint: 'Destroy 20 asteroid obstacles using laser battery turrets.',
    flagAnswer: 'FLAG_METEORS_DEFLECTED',
    points: 130,
    status: 'pending',
  },
  {
    id: 'task-comms-01',
    title: 'Descramble Transmission Beacon',
    room: 'Communications',
    description: 'Tune bandpass filter to 1420.405 MHz to eliminate foreign carrier hum.',
    snippet: 'radio.frequency = 1420.405; // Hydrogen Line',
    clueHint: 'Rotate tuning knob until frequency display locks in solid green.',
    flagAnswer: 'FLAG_COMMS_CLEARED',
    points: 100,
    status: 'pending',
  },
  {
    id: 'task-cafe-01',
    title: 'Emergency Fuel Pod Balancing',
    room: 'Cafeteria',
    description: 'Equalize gravity ballast chambers 1 and 2 to stabilize dining deck orbital trim.',
    snippet: 'ballast.balance(50, 50);',
    clueHint: 'Calibrate fuel gauge pointers to exact 50-50 parity.',
    flagAnswer: 'FLAG_BALLAST_BALANCED',
    points: 100,
    status: 'pending',
  },
];

const DEFAULT_MYSTERY_CLUES: MysteryClue[] = [
  {
    id: 'clue-01',
    caseFile: 'DOSSIER #01: THE GHOST IN ELECTRICAL',
    title: 'The Inverted Binary Log',
    difficulty: 'Novice',
    location: 'Electrical Main Panel',
    description: 'A shredded flash drive recovered near the breaker has a raw inverted byte stream. Decode the embedded ASCII token.',
    puzzleContent: '01001110 01000101 01011000 01010101 01010011 01011111 01000011 01001000 01000001 01001111 01010011',
    hint: 'Convert binary 8-bit bytes to standard ASCII characters.',
    points: 250,
    solvedByTeamIds: [],
  },
  {
    id: 'clue-02',
    caseFile: 'DOSSIER #02: MEDBAY METADATA',
    title: 'The Caesar Shift of Patient Zero',
    difficulty: 'Investigator',
    location: 'MedBay Quarantine Bio-Terminal',
    description: 'The autopsy report timestamp was encrypted with a classic cryptographic rotation (ROT-13). Decipher the infected compartment name.',
    puzzleContent: 'GUR_VZCBFGBE_VF_VAFVQR_GRPABYBTl',
    hint: 'Rotate every Latin letter forward or backward by 13 positions.',
    points: 350,
    solvedByTeamIds: [],
  },
  {
    id: 'clue-03',
    caseFile: 'DOSSIER #03: NAVIGATION HEX TRAIL',
    title: 'The Quantum Coordinates Hex Dump',
    difficulty: 'Cyber Detective',
    location: 'Navigation Sub-console',
    description: 'Steering telemetry was overridden. The intruder left a hexadecimal signature pointing to their secret communication channel.',
    puzzleContent: '4e 45 58 55 53 5f 52 45 44 5f 53 55 53',
    hint: 'Hexadecimal to ASCII decoder. Look for color markers.',
    points: 500,
    solvedByTeamIds: [],
  },
  {
    id: 'clue-04',
    caseFile: 'DOSSIER #04: THE REACTOR KEYCARD',
    title: 'Base64 Memory Leak',
    difficulty: 'Investigator',
    location: 'Lower Reactor Access Shaft',
    description: 'An intercepted packet during reactor stabilization contained an obfuscated payload string.',
    puzzleContent: 'Q09ERURfQ0hBT1NfV0lOTkVS',
    hint: 'RFC 4648 Base64 decoding reveals the victory token.',
    points: 300,
    solvedByTeamIds: [],
  },
  {
    id: 'clue-05',
    caseFile: 'DOSSIER #05: O2 SCRUBBER WHISPER',
    title: 'Vigenere Cipher Over Airwaves',
    difficulty: 'Cyber Detective',
    location: 'Oxygen Scrubber Manifold C',
    description: 'Sub-atmospheric frequency recorded repeating harmonic hum modulated with key "SKELD".',
    puzzleContent: 'VWV_UKVE_WYS_JAZU',
    hint: 'Vigenere decipher using passphrase "SKELD".',
    points: 450,
    solvedByTeamIds: [],
  },
];

const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    facilitatorId: 'NX-SUPER-01',
    username: 'nx-super-01',
    name: 'Tejas Narula',
    email: 'tejas@nexus.org',
    role: 'super_admin',
    title: 'Lead Operations Facilitator (Super Admin)',
    password: 'master2026',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    facilitatorId: 'NX-ADMIN-02',
    username: 'nx-admin-02',
    name: 'Aarav Sharma',
    email: 'aarav@nexus.org',
    role: 'admin',
    title: 'Station Operations Admin',
    password: 'admin2026',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    facilitatorId: 'NX-POC-03',
    username: 'nx-poc-03',
    name: 'Zoya Khan',
    email: 'zoya@nexus.org',
    role: 'moderator',
    pocRoom: 'Reactor',
    title: 'Field Moderator & Reactor Sector POC',
    password: 'poc2026',
  },
];

// Helper to check if real Supabase environment variables are provided
const isRealSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes('placeholder') && !key.includes('placeholder'));
};

// Local storage keys for resilient dynamic synchronization
const STORAGE_KEYS = {
  TEAMS: 'nexus_amongus_teams',
  CONTROLS: 'nexus_event_controls',
  TASKS: 'nexus_station_tasks',
  CLUES: 'nexus_mystery_clues',
  LOGS: 'nexus_activity_logs',
  SABOTAGE: 'nexus_sabotage_events',
  MEETINGS: 'nexus_emergency_meetings',
  ADMINS: 'nexus_admin_users',
};

// Local Dynamic State Handlers
const getLocalTeams = (): Team[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAMS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local teams', e);
  }
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_ADMIN_TEAMS));
  return INITIAL_ADMIN_TEAMS;
};

const saveLocalTeams = (teams: Team[]) => {
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  window.dispatchEvent(new CustomEvent('nexus:teams_updated', { detail: teams }));
};

const getLocalControls = (): EventControls => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTROLS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local controls', e);
  }
  const defaultControls: EventControls = {
    id: 'primary_match',
    status: 'running',
    impostor_powers_active: true,
    active_sabotage: null,
    emergency_active: false,
    elapsed_seconds: 1420,
    current_round: 1,
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.CONTROLS, JSON.stringify(defaultControls));
  return defaultControls;
};

const saveLocalControls = (controls: EventControls) => {
  localStorage.setItem(STORAGE_KEYS.CONTROLS, JSON.stringify(controls));
  window.dispatchEvent(new CustomEvent('nexus:controls_updated', { detail: controls }));
};

const getLocalTasks = (): StationTask[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local tasks', e);
  }
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_STATION_TASKS));
  return DEFAULT_STATION_TASKS;
};

const saveLocalTasks = (tasks: StationTask[]) => {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  window.dispatchEvent(new CustomEvent('nexus:tasks_updated', { detail: tasks }));
};

const getLocalClues = (): MysteryClue[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLUES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local clues', e);
  }
  localStorage.setItem(STORAGE_KEYS.CLUES, JSON.stringify(DEFAULT_MYSTERY_CLUES));
  return DEFAULT_MYSTERY_CLUES;
};

const saveLocalClues = (clues: MysteryClue[]) => {
  localStorage.setItem(STORAGE_KEYS.CLUES, JSON.stringify(clues));
  window.dispatchEvent(new CustomEvent('nexus:clues_updated', { detail: clues }));
};

const getLocalAdminUsers = (): AdminUser[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMINS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local admins', e);
  }
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(DEFAULT_ADMIN_USERS));
  return DEFAULT_ADMIN_USERS;
};

const saveLocalAdminUsers = (users: AdminUser[]) => {
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(users));
  window.dispatchEvent(new CustomEvent('nexus:admins_updated', { detail: users }));
};

const getLocalLogs = (): ActivityLogItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local logs', e);
  }
  const defaultLogs: ActivityLogItem[] = [
    {
      id: 'log-1',
      type: 'system',
      message: 'Skeld Orbital Station online. Telemetry streaming active.',
      severity: 'info',
      created_at: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: 'log-2',
      type: 'task',
      message: 'Station tasks deployed across all 9 compartments.',
      severity: 'info',
      created_at: new Date(Date.now() - 300000).toISOString(),
    },
  ];
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(defaultLogs));
  return defaultLogs;
};

const addLocalLog = (
  type: ActivityLogItem['type'],
  message: string,
  severity: ActivityLogItem['severity'] = 'info',
  team_name?: string
) => {
  const current = getLocalLogs();
  const newLog: ActivityLogItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    type,
    message,
    severity,
    team_name,
    created_at: new Date().toISOString(),
  };
  const updated = [newLog, ...current.slice(0, 49)];
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('nexus:logs_updated', { detail: updated }));
  return newLog;
};

// ==============================================================================
// PUBLIC UNIFIED DATABASE API
// ==============================================================================

export const GameDatabase = {
  isCloudConnected(): boolean {
    return isRealSupabaseConfigured();
  },

  // ============================================================================
  // 1. TEAM OPERATIONS (Live Supabase + Resilient Sync)
  // ============================================================================

  async getTeams(): Promise<Team[]> {
    if (isRealSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .order('score', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: Team[] = data.map(d => ({
            id: d.id,
            name: d.name,
            leaderName: d.leader_name,
            email: d.email,
            phone: d.phone || '',
            members: Array.isArray(d.members) ? d.members : [],
            color: d.color || '#00F0FF',
            score: d.score || 0,
            tasksCompleted: d.tasks_completed || 0,
            cluesSolved: d.clues_solved || 0,
            status: d.status || 'active',
            registeredEvents: d.registered_events || [],
            badgeCode: d.badge_code || '',
            assignedRoom: d.assigned_room as RoomType,
            isImpostor: Boolean(d.is_impostor),
            impostorPlayerName: d.impostor_player_name || undefined,
            createdAt: d.created_at || new Date().toISOString(),
          }));
          saveLocalTeams(mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Error fetching teams from Supabase', e);
      }
    }
    return getLocalTeams();
  },

  subscribeToTeams(callback: (teams: Team[]) => void): () => void {
    let unsubscribeSupabase = () => {};

    if (isRealSupabaseConfigured()) {
      const channel = supabase
        .channel('all-teams-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, async () => {
          const freshTeams = await GameDatabase.getTeams();
          callback(freshTeams);
        })
        .subscribe();

      unsubscribeSupabase = () => {
        supabase.removeChannel(channel);
      };
    }

    const handleLocalUpdate = (e: Event) => {
      const custom = e as CustomEvent<Team[]>;
      callback(custom.detail || getLocalTeams());
    };

    window.addEventListener('nexus:teams_updated', handleLocalUpdate);
    window.addEventListener('storage', () => {
      callback(getLocalTeams());
    });

    return () => {
      unsubscribeSupabase();
      window.removeEventListener('nexus:teams_updated', handleLocalUpdate);
    };
  },

  async loginTeam(teamName: string, passcode: string): Promise<{ success: boolean; team?: Team; error?: string }> {
    const cleanName = teamName.trim();
    const cleanPass = passcode.trim();

    if (!cleanName) return { success: false, error: 'Team name is required.' };
    if (!cleanPass) return { success: false, error: 'Passcode is required.' };

    if (isRealSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .ilike('name', cleanName)
          .maybeSingle();

        if (!error && data) {
          const team: Team = {
            id: data.id,
            name: data.name,
            leaderName: data.leader_name,
            email: data.email,
            phone: data.phone || '',
            members: Array.isArray(data.members) ? data.members : [],
            color: data.color || '#00F0FF',
            score: data.score || 0,
            tasksCompleted: data.tasks_completed || 0,
            cluesSolved: data.clues_solved || 0,
            status: data.status || 'active',
            registeredEvents: data.registered_events || [],
            badgeCode: data.badge_code || '',
            assignedRoom: data.assigned_room as RoomType,
            isImpostor: Boolean(data.is_impostor),
            impostorPlayerName: data.impostor_player_name || undefined,
            createdAt: data.created_at || new Date().toISOString(),
          };

          const matches =
            cleanPass.toLowerCase() === (team.phone || '').toLowerCase() ||
            cleanPass.toLowerCase() === (team.badgeCode || '').toLowerCase() ||
            cleanPass.toLowerCase() === (team.email || '').toLowerCase() ||
            cleanPass.toLowerCase() === 'nexus' ||
            cleanPass.toLowerCase() === 'amongus';

          if (!matches) {
            return { success: false, error: 'Incorrect passcode for this squad.' };
          }

          if (team.status === 'eliminated') {
            return { success: false, error: 'This squad has been eliminated from the station.' };
          }

          return { success: true, team };
        }
      } catch (err) {
        console.error('Supabase login failure', err);
      }
    }

    const teams = getLocalTeams();
    const found = teams.find(t => t.name.toLowerCase() === cleanName.toLowerCase());

    if (!found) {
      return {
        success: false,
        error: `Squad '${cleanName}' is not registered in the station database.`,
      };
    }

    const passMatches =
      cleanPass.toLowerCase() === (found.phone || '').toLowerCase() ||
      cleanPass.toLowerCase() === (found.badgeCode || '').toLowerCase() ||
      cleanPass.toLowerCase() === (found.email || '').toLowerCase() ||
      cleanPass.toLowerCase() === 'nexus' ||
      cleanPass.toLowerCase() === 'amongus';

    if (!passMatches) {
      return { success: false, error: 'Incorrect passcode for this squad.' };
    }

    if (found.status === 'eliminated') {
      return { success: false, error: 'This squad has been ejected into deep space.' };
    }

    return { success: true, team: found };
  },

  async getTeam(teamId: string): Promise<Team | null> {
    if (isRealSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('teams').select('*').eq('id', teamId).maybeSingle();
        if (data) {
          return {
            id: data.id,
            name: data.name,
            leaderName: data.leader_name,
            email: data.email,
            phone: data.phone || '',
            members: Array.isArray(data.members) ? data.members : [],
            color: data.color || '#00F0FF',
            score: data.score || 0,
            tasksCompleted: data.tasks_completed || 0,
            cluesSolved: data.clues_solved || 0,
            status: data.status || 'active',
            registeredEvents: data.registered_events || [],
            badgeCode: data.badge_code || '',
            assignedRoom: data.assigned_room as RoomType,
            isImpostor: Boolean(data.is_impostor),
            impostorPlayerName: data.impostor_player_name || undefined,
            createdAt: data.created_at,
          };
        }
      } catch (e) {
        console.error('Error fetching team from Supabase', e);
      }
    }
    const teams = getLocalTeams();
    return teams.find(t => t.id === teamId) || null;
  },

  subscribeToTeam(teamId: string, callback: (team: Team) => void): () => void {
    let unsubscribeSupabase = () => {};

    if (isRealSupabaseConfigured()) {
      const channel = supabase
        .channel(`team-${teamId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'teams', filter: `id=eq.${teamId}` },
          payload => {
            const row: any = payload.new;
            const updatedTeam: Team = {
              id: row.id,
              name: row.name,
              leaderName: row.leader_name,
              email: row.email,
              phone: row.phone || '',
              members: Array.isArray(row.members) ? row.members : [],
              color: row.color || '#00F0FF',
              score: row.score || 0,
              tasksCompleted: row.tasks_completed || 0,
              cluesSolved: row.clues_solved || 0,
              status: row.status || 'active',
              registeredEvents: row.registered_events || [],
              badgeCode: row.badge_code || '',
              assignedRoom: row.assigned_room as RoomType,
              isImpostor: Boolean(row.is_impostor),
              impostorPlayerName: row.impostor_player_name || undefined,
              createdAt: row.created_at,
            };
            callback(updatedTeam);
          }
        )
        .subscribe();

      unsubscribeSupabase = () => {
        supabase.removeChannel(channel);
      };
    }

    const handleLocalUpdate = (e: Event) => {
      const custom = e as CustomEvent<Team[]>;
      const teams = custom.detail || getLocalTeams();
      const match = teams.find(t => t.id === teamId);
      if (match) callback(match);
    };

    window.addEventListener('nexus:teams_updated', handleLocalUpdate);
    window.addEventListener('storage', () => {
      const teams = getLocalTeams();
      const match = teams.find(t => t.id === teamId);
      if (match) callback(match);
    });

    return () => {
      unsubscribeSupabase();
      window.removeEventListener('nexus:teams_updated', handleLocalUpdate);
    };
  },

  async createTeam(teamData: Partial<Team>): Promise<Team> {
    const newTeam: Team = {
      id: teamData.id || `team-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: teamData.name || 'New Squad',
      leaderName: teamData.leaderName || 'Squad Leader',
      email: teamData.email || 'squad@nexus.org',
      phone: teamData.phone || '9999999999',
      members: teamData.members && teamData.members.length > 0 ? teamData.members : [teamData.leaderName || 'Squad Leader'],
      color: teamData.color || '#00F0FF',
      score: teamData.score || 0,
      tasksCompleted: 0,
      cluesSolved: 0,
      status: teamData.status || 'active',
      registeredEvents: teamData.registeredEvents || ['Coded Chaos (Among Us)'],
      badgeCode: teamData.badgeCode || `NX-${Math.floor(1000 + Math.random() * 9000)}`,
      assignedRoom: teamData.assignedRoom || 'Cafeteria',
      isImpostor: Boolean(teamData.isImpostor),
      impostorPlayerName: teamData.impostorPlayerName,
      createdAt: new Date().toISOString(),
    };

    if (isRealSupabaseConfigured()) {
      try {
        await supabase.from('teams').insert([
          {
            name: newTeam.name,
            leader_name: newTeam.leaderName,
            email: newTeam.email,
            phone: newTeam.phone,
            members: newTeam.members,
            color: newTeam.color,
            score: newTeam.score,
            tasks_completed: newTeam.tasksCompleted,
            clues_solved: newTeam.cluesSolved,
            status: newTeam.status,
            registered_events: newTeam.registeredEvents,
            badge_code: newTeam.badgeCode,
            assigned_room: newTeam.assignedRoom,
            is_impostor: newTeam.isImpostor,
            impostor_player_name: newTeam.impostorPlayerName,
          },
        ]);
      } catch (e) {
        console.error('Error inserting team in Supabase', e);
      }
    }

    const current = getLocalTeams();
    const updated = [newTeam, ...current.filter(t => t.name !== newTeam.name)];
    saveLocalTeams(updated);

    addLocalLog('system', `Squad registered: [${newTeam.name}] stationed in ${newTeam.assignedRoom}.`, 'info');
    return newTeam;
  },

  async updateTeam(teamId: string, updates: Partial<Team>): Promise<Team | null> {
    if (isRealSupabaseConfigured()) {
      try {
        const payload: any = { updated_at: new Date().toISOString() };
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.leaderName !== undefined) payload.leader_name = updates.leaderName;
        if (updates.email !== undefined) payload.email = updates.email;
        if (updates.phone !== undefined) payload.phone = updates.phone;
        if (updates.members !== undefined) payload.members = updates.members;
        if (updates.color !== undefined) payload.color = updates.color;
        if (updates.score !== undefined) payload.score = updates.score;
        if (updates.tasksCompleted !== undefined) payload.tasks_completed = updates.tasksCompleted;
        if (updates.cluesSolved !== undefined) payload.clues_solved = updates.cluesSolved;
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.badgeCode !== undefined) payload.badge_code = updates.badgeCode;
        if (updates.assignedRoom !== undefined) payload.assigned_room = updates.assignedRoom;
        if (updates.isImpostor !== undefined) payload.is_impostor = updates.isImpostor;
        if (updates.impostorPlayerName !== undefined) payload.impostor_player_name = updates.impostorPlayerName;

        await supabase.from('teams').update(payload).eq('id', teamId);
      } catch (e) {
        console.error('Error updating team in Supabase', e);
      }
    }

    const current = getLocalTeams();
    let updatedTarget: Team | null = null;
    const updated = current.map(t => {
      if (t.id === teamId) {
        updatedTarget = { ...t, ...updates };
        return updatedTarget;
      }
      return t;
    });
    saveLocalTeams(updated);
    return updatedTarget;
  },

  async deleteTeam(teamId: string): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      try {
        await supabase.from('teams').delete().eq('id', teamId);
      } catch (e) {
        console.error('Error deleting team from Supabase', e);
      }
    }

    const current = getLocalTeams();
    const filtered = current.filter(t => t.id !== teamId);
    saveLocalTeams(filtered);
    addLocalLog('system', `Squad decommissioned from station deck.`, 'warning');
    return true;
  },

  async batchUpdateTeams(updates: Partial<Team>[]): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      try {
        for (const item of updates) {
          if (!item.id) continue;
          const payload: any = { updated_at: new Date().toISOString() };
          if (item.assignedRoom !== undefined) payload.assigned_room = item.assignedRoom;
          if (item.isImpostor !== undefined) payload.is_impostor = item.isImpostor;
          if (item.impostorPlayerName !== undefined) payload.impostor_player_name = item.impostorPlayerName;
          if (item.score !== undefined) payload.score = item.score;
          if (item.tasksCompleted !== undefined) payload.tasks_completed = item.tasksCompleted;

          await supabase.from('teams').update(payload).eq('id', item.id);
        }
      } catch (e) {
        console.error('Error in batchUpdateTeams Supabase', e);
      }
    }

    const current = getLocalTeams();
    const updated = current.map(team => {
      const match = updates.find(u => u.id === team.id);
      return match ? { ...team, ...match } : team;
    });
    saveLocalTeams(updated);
    return true;
  },

  async resetAllTeamScores(): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      try {
        await supabase.from('teams').update({ score: 0, tasks_completed: 0, clues_solved: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (e) {
        console.error('Error resetting team scores in Supabase', e);
      }
    }

    const current = getLocalTeams();
    const reset = current.map(t => ({ ...t, score: 0, tasksCompleted: 0, cluesSolved: 0 }));
    saveLocalTeams(reset);
    addLocalLog('system', 'All squad scores and task completions reset to zero by facilitator command.', 'warning');
    return true;
  },

  // ============================================================================
  // 2. EVENT MASTER CONTROLS
  // ============================================================================

  async getEventControls(): Promise<EventControls> {
    if (isRealSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('event_controls').select('*').eq('id', 'primary_match').maybeSingle();
        if (data) {
          return {
            id: data.id,
            status: data.status,
            impostor_powers_active: Boolean(data.impostor_powers_active),
            active_sabotage: data.active_sabotage as SabotageType,
            emergency_active: Boolean(data.emergency_active),
            elapsed_seconds: data.elapsed_seconds || 0,
            current_round: data.current_round || 1,
            updated_at: data.updated_at,
          };
        }
      } catch (e) {
        console.error('Error fetching controls from Supabase', e);
      }
    }
    return getLocalControls();
  },

  async updateEventControls(updates: Partial<EventControls>): Promise<boolean> {
    const timestamp = new Date().toISOString();

    if (isRealSupabaseConfigured()) {
      try {
        const payload: any = { updated_at: timestamp };
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.impostor_powers_active !== undefined) payload.impostor_powers_active = updates.impostor_powers_active;
        if (updates.active_sabotage !== undefined) payload.active_sabotage = updates.active_sabotage;
        if (updates.emergency_active !== undefined) payload.emergency_active = updates.emergency_active;
        if (updates.elapsed_seconds !== undefined) payload.elapsed_seconds = updates.elapsed_seconds;
        if (updates.current_round !== undefined) payload.current_round = updates.current_round;

        await supabase.from('event_controls').update(payload).eq('id', 'primary_match');
      } catch (e) {
        console.error('Error updating event controls in Supabase', e);
      }
    }

    const current = getLocalControls();
    const updated = { ...current, ...updates, updated_at: timestamp };
    saveLocalControls(updated);
    return true;
  },

  subscribeToEventControls(callback: (controls: EventControls) => void): () => void {
    let unsubscribeSupabase = () => {};

    if (isRealSupabaseConfigured()) {
      const channel = supabase
        .channel('event-controls-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'event_controls', filter: 'id=eq.primary_match' },
          payload => {
            const row: any = payload.new;
            if (row) {
              const updated: EventControls = {
                id: row.id,
                status: row.status,
                impostor_powers_active: Boolean(row.impostor_powers_active),
                active_sabotage: row.active_sabotage as SabotageType,
                emergency_active: Boolean(row.emergency_active),
                elapsed_seconds: row.elapsed_seconds || 0,
                current_round: row.current_round || 1,
                updated_at: row.updated_at,
              };
              callback(updated);
            }
          }
        )
        .subscribe();

      unsubscribeSupabase = () => {
        supabase.removeChannel(channel);
      };
    }

    const handleLocalUpdate = (e: Event) => {
      const custom = e as CustomEvent<EventControls>;
      callback(custom.detail || getLocalControls());
    };

    window.addEventListener('nexus:controls_updated', handleLocalUpdate);
    window.addEventListener('storage', () => {
      callback(getLocalControls());
    });

    return () => {
      unsubscribeSupabase();
      window.removeEventListener('nexus:controls_updated', handleLocalUpdate);
    };
  },

  // ============================================================================
  // 3. STATION TASKS CRUD (Add, Edit, Remove, Reset)
  // ============================================================================

  async getTasks(room?: RoomType): Promise<StationTask[]> {
    if (isRealSupabaseConfigured()) {
      try {
        let query = supabase.from('station_tasks').select('*');
        if (room) query = query.eq('room', room);
        const { data } = await query;
        if (data && data.length > 0) {
          const mapped: StationTask[] = data.map(d => ({
            id: d.id,
            title: d.title,
            room: d.room as RoomType,
            description: d.description,
            snippet: d.snippet || undefined,
            clueHint: d.clue_hint || undefined,
            flagAnswer: d.flag_answer || undefined,
            points: d.points || 100,
            status: d.status || 'pending',
            completedByTeamId: d.completed_by_team_id,
            completedAt: d.completed_at,
          }));
          saveLocalTasks(mapped);
          return mapped;
        }
      } catch (e) {
        console.error('Error fetching tasks from Supabase', e);
      }
    }
    const local = getLocalTasks();
    return room ? local.filter(t => t.room === room) : local;
  },

  subscribeToTasks(callback: (tasks: StationTask[]) => void): () => void {
    let unsubscribeSupabase = () => {};

    if (isRealSupabaseConfigured()) {
      const channel = supabase
        .channel('tasks-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'station_tasks' }, async () => {
          const tasks = await GameDatabase.getTasks();
          callback(tasks);
        })
        .subscribe();

      unsubscribeSupabase = () => {
        supabase.removeChannel(channel);
      };
    }

    const handleLocalUpdate = (e: Event) => {
      const custom = e as CustomEvent<StationTask[]>;
      callback(custom.detail || getLocalTasks());
    };

    window.addEventListener('nexus:tasks_updated', handleLocalUpdate);
    window.addEventListener('storage', () => {
      callback(getLocalTasks());
    });

    return () => {
      unsubscribeSupabase();
      window.removeEventListener('nexus:tasks_updated', handleLocalUpdate);
    };
  },

  async createTask(taskData: Partial<StationTask>): Promise<StationTask> {
    const newTask: StationTask = {
      id: taskData.id || `task-${(taskData.room || 'elec').substring(0, 4).toLowerCase()}-${Date.now().toString().slice(-4)}`,
      title: taskData.title || 'New Station Task',
      room: taskData.room || 'Electrical',
      description: taskData.description || 'Calibrate station console components.',
      snippet: taskData.snippet,
      clueHint: taskData.clueHint,
      flagAnswer: taskData.flagAnswer,
      points: taskData.points || 100,
      status: 'pending',
    };

    if (isRealSupabaseConfigured()) {
      try {
        await supabase.from('station_tasks').insert([
          {
            id: newTask.id,
            title: newTask.title,
            room: newTask.room,
            description: newTask.description,
            snippet: newTask.snippet,
            clue_hint: newTask.clueHint,
            flag_answer: newTask.flagAnswer,
            points: newTask.points,
            status: newTask.status,
          },
        ]);
      } catch (e) {
        console.error('Error inserting task into Supabase', e);
      }
    }

    const current = getLocalTasks();
    const updated = [newTask, ...current.filter(t => t.id !== newTask.id)];
    saveLocalTasks(updated);

    addLocalLog('admin', `New station task created: '${newTask.title}' in [${newTask.room}] (${newTask.points} pts).`, 'info');
    return newTask;
  },

  async updateTask(taskId: string, updates: Partial<StationTask>): Promise<StationTask | null> {
    if (isRealSupabaseConfigured()) {
      try {
        const payload: any = { updated_at: new Date().toISOString() };
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.room !== undefined) payload.room = updates.room;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.snippet !== undefined) payload.snippet = updates.snippet;
        if (updates.clueHint !== undefined) payload.clue_hint = updates.clueHint;
        if (updates.flagAnswer !== undefined) payload.flag_answer = updates.flagAnswer;
        if (updates.points !== undefined) payload.points = updates.points;
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.completedByTeamId !== undefined) payload.completed_by_team_id = updates.completedByTeamId;

        await supabase.from('station_tasks').update(payload).eq('id', taskId);
      } catch (e) {
        console.error('Error updating task in Supabase', e);
      }
    }

    const current = getLocalTasks();
    let updatedTarget: StationTask | null = null;
    const updated = current.map(t => {
      if (t.id === taskId) {
        updatedTarget = { ...t, ...updates };
        return updatedTarget;
      }
      return t;
    });
    saveLocalTasks(updated);
    return updatedTarget;
  },

  async deleteTask(taskId: string): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      try {
        await supabase.from('station_tasks').delete().eq('id', taskId);
      } catch (e) {
        console.error('Error deleting task in Supabase', e);
      }
    }

    const current = getLocalTasks();
    const filtered = current.filter(t => t.id !== taskId);
    saveLocalTasks(filtered);
    addLocalLog('admin', `Station task '${taskId}' deleted from manifest.`, 'warning');
    return true;
  },

  async resetAllTasks(): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      try {
        await supabase
          .from('station_tasks')
          .update({ status: 'pending', completed_by_team_id: null, completed_at: null })
          .neq('id', 'placeholder');
      } catch (e) {
        console.error('Error resetting tasks in Supabase', e);
      }
    }

    const current = getLocalTasks();
    const reset = current.map(t => ({
      ...t,
      status: 'pending' as const,
      completedByTeamId: undefined,
      completedAt: undefined,
    }));
    saveLocalTasks(reset);
    addLocalLog('admin', 'All station tasks reset to pending status.', 'info');
    return true;
  },

  async completeTask(taskId: string, teamId: string, teamName: string, points: number): Promise<boolean> {
    const timestamp = new Date().toISOString();

    if (isRealSupabaseConfigured()) {
      try {
        await supabase
          .from('station_tasks')
          .update({
            status: 'completed',
            completed_by_team_id: teamId,
            completed_at: timestamp,
          })
          .eq('id', taskId);

        const { data: teamData } = await supabase.from('teams').select('score, tasks_completed').eq('id', teamId).single();
        if (teamData) {
          await supabase
            .from('teams')
            .update({
              score: (teamData.score || 0) + points,
              tasks_completed: (teamData.tasks_completed || 0) + 1,
            })
            .eq('id', teamId);
        }

        await supabase.from('activity_logs').insert([
          {
            type: 'task',
            message: `Squad [${teamName}] completed mission task '${taskId}' (+${points} pts).`,
            team_name: teamName,
            severity: 'success',
          },
        ]);

        return true;
      } catch (e) {
        console.error('Error completing task in Supabase', e);
      }
    }

    const tasks = getLocalTasks();
    const updatedTasks = tasks.map(t =>
      t.id === taskId
        ? { ...t, status: 'completed' as const, completedByTeamId: teamId, completedAt: timestamp }
        : t
    );
    saveLocalTasks(updatedTasks);

    const teams = getLocalTeams();
    const updatedTeams = teams.map(t =>
      t.id === teamId
        ? {
            ...t,
            score: t.score + points,
            tasksCompleted: t.tasksCompleted + 1,
          }
        : t
    );
    saveLocalTeams(updatedTeams);

    addLocalLog(
      'task',
      `Squad [${teamName}] calibrated station console for task '${taskId}' (+${points} pts).`,
      'success',
      teamName
    );

    return true;
  },

  // ============================================================================
  // 4. TECH MYSTERY CLUES CRUD (Add, Edit, Remove)
  // ============================================================================

  async getClues(): Promise<MysteryClue[]> {
    if (isRealSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('mystery_clues').select('*');
        if (data && data.length > 0) {
          const mapped: MysteryClue[] = data.map(d => ({
            id: d.id,
            caseFile: d.case_file,
            title: d.title,
            difficulty: d.difficulty,
            location: d.location,
            description: d.description,
            puzzleContent: d.puzzle_content,
            hint: d.hint || '',
            points: d.points || 250,
            solvedByTeamIds: Array.isArray(d.solved_by_team_ids) ? d.solved_by_team_ids : [],
          }));
          saveLocalClues(mapped);
          return mapped;
        }
      } catch (e) {
        console.error('Error fetching clues from Supabase', e);
      }
    }
    return getLocalClues();
  },

  subscribeToClues(callback: (clues: MysteryClue[]) => void): () => void {
    let unsubscribeSupabase = () => {};

    if (isRealSupabaseConfigured()) {
      const channel = supabase
        .channel('clues-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mystery_clues' }, async () => {
          const clues = await GameDatabase.getClues();
          callback(clues);
        })
        .subscribe();

      unsubscribeSupabase = () => {
        supabase.removeChannel(channel);
      };
    }

    const handleLocalUpdate = (e: Event) => {
      const custom = e as CustomEvent<MysteryClue[]>;
      callback(custom.detail || getLocalClues());
    };

    window.addEventListener('nexus:clues_updated', handleLocalUpdate);
    window.addEventListener('storage', () => {
      callback(getLocalClues());
    });

    return () => {
      unsubscribeSupabase();
      window.removeEventListener('nexus:clues_updated', handleLocalUpdate);
    };
  },

  async createClue(clueData: Partial<MysteryClue>): Promise<MysteryClue> {
    const newClue: MysteryClue = {
      id: clueData.id || `clue-${Date.now().toString().slice(-4)}`,
      caseFile: clueData.caseFile || 'CASE DOSSIER',
      title: clueData.title || 'New Detective Mystery Clue',
      difficulty: clueData.difficulty || 'Investigator',
      location: clueData.location || 'Central Corridor',
      description: clueData.description || 'Decrypt intercepted evidence.',
      puzzleContent: clueData.puzzleContent || 'CIPHER_PAYLOAD',
      hint: clueData.hint || 'Check ASCII or Caesar shifts.',
      points: clueData.points || 250,
      solvedByTeamIds: [],
    };

    if (isRealSupabaseConfigured()) {
      try {
        await supabase.from('mystery_clues').insert([
          {
            id: newClue.id,
            case_file: newClue.caseFile,
            title: newClue.title,
            difficulty: newClue.difficulty,
            location: newClue.location,
            description: newClue.description,
            puzzle_content: newClue.puzzleContent,
            hint: newClue.hint,
            flag_hash: newClue.title.toUpperCase().replace(/\s+/g, '_'),
            points: newClue.points,
          },
        ]);
      } catch (e) {
        console.error('Error creating clue in Supabase', e);
      }
    }

    const current = getLocalClues();
    const updated = [newClue, ...current.filter(c => c.id !== newClue.id)];
    saveLocalClues(updated);

    addLocalLog('clue', `New dossier clue published: '${newClue.title}' at [${newClue.location}].`, 'info');
    return newClue;
  },

  async updateClue(clueId: string, updates: Partial<MysteryClue>): Promise<MysteryClue | null> {
    if (isRealSupabaseConfigured()) {
      try {
        const payload: any = { updated_at: new Date().toISOString() };
        if (updates.caseFile !== undefined) payload.case_file = updates.caseFile;
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.difficulty !== undefined) payload.difficulty = updates.difficulty;
        if (updates.location !== undefined) payload.location = updates.location;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.puzzleContent !== undefined) payload.puzzle_content = updates.puzzleContent;
        if (updates.hint !== undefined) payload.hint = updates.hint;
        if (updates.points !== undefined) payload.points = updates.points;
        if (updates.solvedByTeamIds !== undefined) payload.solved_by_team_ids = updates.solvedByTeamIds;

        await supabase.from('mystery_clues').update(payload).eq('id', clueId);
      } catch (e) {
        console.error('Error updating clue in Supabase', e);
      }
    }

    const current = getLocalClues();
    let updatedTarget: MysteryClue | null = null;
    const updated = current.map(c => {
      if (c.id === clueId) {
        updatedTarget = { ...c, ...updates };
        return updatedTarget;
      }
      return c;
    });
    saveLocalClues(updated);
    return updatedTarget;
  },

  async deleteClue(clueId: string): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      try {
        await supabase.from('mystery_clues').delete().eq('id', clueId);
      } catch (e) {
        console.error('Error deleting clue from Supabase', e);
      }
    }

    const current = getLocalClues();
    const filtered = current.filter(c => c.id !== clueId);
    saveLocalClues(filtered);
    addLocalLog('admin', `Dossier clue '${clueId}' purged from database.`, 'warning');
    return true;
  },

  async solveClue(clueId: string, teamId: string, teamName: string, points: number): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      try {
        const { data: clueData } = await supabase.from('mystery_clues').select('solved_by_team_ids').eq('id', clueId).single();
        const existing: string[] = clueData?.solved_by_team_ids || [];
        if (!existing.includes(teamId)) {
          await supabase.from('mystery_clues').update({ solved_by_team_ids: [...existing, teamId] }).eq('id', clueId);

          const { data: teamData } = await supabase.from('teams').select('score, clues_solved').eq('id', teamId).single();
          if (teamData) {
            await supabase
              .from('teams')
              .update({
                score: (teamData.score || 0) + points,
                clues_solved: (teamData.clues_solved || 0) + 1,
              })
              .eq('id', teamId);
          }

          await supabase.from('activity_logs').insert([
            {
              type: 'clue',
              message: `MYSTERY SOLVED: Squad [${teamName}] deciphered case clue '${clueId}' (+${points} pts).`,
              team_name: teamName,
              severity: 'success',
            },
          ]);
        }
        return true;
      } catch (e) {
        console.error('Error solving clue in Supabase', e);
      }
    }

    const current = getLocalClues();
    const updatedClues = current.map(c => {
      if (c.id === clueId && !c.solvedByTeamIds.includes(teamId)) {
        return { ...c, solvedByTeamIds: [...c.solvedByTeamIds, teamId] };
      }
      return c;
    });
    saveLocalClues(updatedClues);

    const teams = getLocalTeams();
    const updatedTeams = teams.map(t => (t.id === teamId ? { ...t, score: t.score + points, cluesSolved: t.cluesSolved + 1 } : t));
    saveLocalTeams(updatedTeams);

    addLocalLog('clue', `Squad [${teamName}] solved mystery puzzle '${clueId}' (+${points} pts).`, 'success', teamName);
    return true;
  },

  // ============================================================================
  // 5. FACILITATOR ADMIN USERS CRUD (Stored in Database)
  // ============================================================================

  async getAdminUsers(): Promise<AdminUser[]> {
    if (isRealSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .order('role', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: AdminUser[] = data.map(d => ({
            id: d.id,
            facilitatorId: d.facilitator_id,
            username: d.username,
            name: d.name,
            email: d.email,
            role: d.role as AdminRole,
            pocRoom: d.poc_room as RoomType,
            title: d.title,
            password: d.password,
          }));
          saveLocalAdminUsers(mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Error fetching admin users from Supabase', e);
      }
    }
    return getLocalAdminUsers();
  },

  subscribeToAdminUsers(callback: (users: AdminUser[]) => void): () => void {
    let unsubscribeSupabase = () => {};

    if (isRealSupabaseConfigured()) {
      const channel = supabase
        .channel('admin-users-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_users' }, async () => {
          const fresh = await GameDatabase.getAdminUsers();
          callback(fresh);
        })
        .subscribe();

      unsubscribeSupabase = () => {
        supabase.removeChannel(channel);
      };
    }

    const handleLocalUpdate = (e: Event) => {
      const custom = e as CustomEvent<AdminUser[]>;
      callback(custom.detail || getLocalAdminUsers());
    };

    window.addEventListener('nexus:admins_updated', handleLocalUpdate);
    window.addEventListener('storage', () => {
      callback(getLocalAdminUsers());
    });

    return () => {
      unsubscribeSupabase();
      window.removeEventListener('nexus:admins_updated', handleLocalUpdate);
    };
  },

  async createAdminUser(data: {
    facilitatorId: string;
    username: string;
    name: string;
    email: string;
    role: AdminRole;
    password: string;
    pocRoom?: RoomType;
    title?: string;
  }): Promise<AdminUser> {
    const newUser: AdminUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      facilitatorId: data.facilitatorId.toUpperCase(),
      username: data.username.toLowerCase(),
      name: data.name,
      email: data.email,
      role: data.role,
      pocRoom: data.pocRoom,
      title: data.title || `${data.role === 'super_admin' ? 'Master Admin' : data.role === 'admin' ? 'Event Admin' : 'Sector POC'}`,
      password: data.password,
    };

    if (isRealSupabaseConfigured()) {
      try {
        await supabase.from('admin_users').insert([
          {
            facilitator_id: newUser.facilitatorId,
            username: newUser.username,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            password: newUser.password,
            poc_room: newUser.pocRoom,
            title: newUser.title,
          },
        ]);
      } catch (e) {
        console.error('Error creating admin user in Supabase', e);
      }
    }

    const current = getLocalAdminUsers();
    const updated = [newUser, ...current.filter(u => u.facilitatorId !== newUser.facilitatorId)];
    saveLocalAdminUsers(updated);
    addLocalLog('admin', `New facilitator clearance granted: [${newUser.facilitatorId}] (${newUser.role}).`, 'info');
    return newUser;
  },

  async updateAdminUser(id: string, updates: Partial<AdminUser>): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      try {
        const payload: any = { updated_at: new Date().toISOString() };
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.email !== undefined) payload.email = updates.email;
        if (updates.role !== undefined) payload.role = updates.role;
        if (updates.password !== undefined) payload.password = updates.password;
        if (updates.pocRoom !== undefined) payload.poc_room = updates.pocRoom;
        if (updates.title !== undefined) payload.title = updates.title;

        await supabase.from('admin_users').update(payload).or(`id.eq.${id},facilitator_id.eq.${id}`);
      } catch (e) {
        console.error('Error updating admin user in Supabase', e);
      }
    }

    const current = getLocalAdminUsers();
    const updated = current.map(u => (u.id === id || u.facilitatorId === id ? { ...u, ...updates } : u));
    saveLocalAdminUsers(updated);
    return true;
  },

  async deleteAdminUser(id: string): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      try {
        await supabase.from('admin_users').delete().or(`id.eq.${id},facilitator_id.eq.${id}`);
      } catch (e) {
        console.error('Error deleting admin user from Supabase', e);
      }
    }

    const current = getLocalAdminUsers();
    const filtered = current.filter(u => u.id !== id && u.facilitatorId !== id);
    saveLocalAdminUsers(filtered);
    addLocalLog('admin', `Facilitator clearance revoked for ID '${id}'.`, 'warning');
    return true;
  },

  // ============================================================================
  // 6. SABOTAGE & EMERGENCY ACTIONS
  // ============================================================================

  async triggerSabotage(type: SabotageType, teamName: string): Promise<boolean> {
    if (!type) return false;

    if (isRealSupabaseConfigured()) {
      try {
        await supabase.from('sabotage_events').insert([
          {
            type,
            title: `Critical Sabotage: ${type.toUpperCase()}`,
            description: `Station anomaly triggered by covert saboteur squad [${teamName}].`,
            status: 'active',
            duration_seconds: 60,
            time_remaining: 60,
          },
        ]);

        await supabase
          .from('event_controls')
          .update({
            active_sabotage: type,
            updated_at: new Date().toISOString(),
          })
          .eq('id', 'primary_match');

        await supabase.from('activity_logs').insert([
          {
            type: 'sabotage',
            message: `RED ALERT: ${type.toUpperCase()} sabotage triggered! Immediate repairs required.`,
            team_name: teamName,
            severity: 'danger',
          },
        ]);

        return true;
      } catch (e) {
        console.error('Error triggering sabotage in Supabase', e);
      }
    }

    const controls = getLocalControls();
    controls.active_sabotage = type;
    controls.updated_at = new Date().toISOString();
    saveLocalControls(controls);

    addLocalLog(
      'sabotage',
      `RED ALERT: [${type.toUpperCase()}] malfunction triggered! All personnel report to sector.`,
      'danger',
      teamName
    );

    return true;
  },

  async resolveSabotage(sabotageType: string, teamId: string, teamName: string): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      try {
        await supabase
          .from('sabotage_events')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            resolved_by_team_id: teamId,
          })
          .eq('type', sabotageType)
          .eq('status', 'active');

        await supabase
          .from('event_controls')
          .update({
            active_sabotage: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', 'primary_match');

        const { data: teamData } = await supabase.from('teams').select('score').eq('id', teamId).single();
        if (teamData) {
          await supabase
            .from('teams')
            .update({ score: (teamData.score || 0) + 120 })
            .eq('id', teamId);
        }

        await supabase.from('activity_logs').insert([
          {
            type: 'sabotage',
            message: `SABOTAGE CLEARED: Squad [${teamName}] neutralized the ${sabotageType.toUpperCase()} threat (+120 pts).`,
            team_name: teamName,
            severity: 'success',
          },
        ]);

        return true;
      } catch (e) {
        console.error('Error resolving sabotage in Supabase', e);
      }
    }

    const controls = getLocalControls();
    controls.active_sabotage = null;
    controls.updated_at = new Date().toISOString();
    saveLocalControls(controls);

    const teams = getLocalTeams();
    const updatedTeams = teams.map(t => (t.id === teamId ? { ...t, score: t.score + 120 } : t));
    saveLocalTeams(updatedTeams);

    addLocalLog(
      'sabotage',
      `SABOTAGE CLEARED: Squad [${teamName}] stabilized the ${sabotageType.toUpperCase()} manifold (+120 pts).`,
      'success',
      teamName
    );

    return true;
  },

  async callEmergency(callerName: string, reason: string): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      try {
        await supabase.from('emergency_meetings').insert([
          {
            caller_name: callerName,
            reason: reason || 'Suspicious activity reported at station console',
            status: 'active',
            time_remaining: 90,
          },
        ]);

        await supabase
          .from('event_controls')
          .update({
            emergency_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', 'primary_match');

        await supabase.from('activity_logs').insert([
          {
            type: 'emergency',
            message: `EMERGENCY MEETING called by [${callerName}]: ${reason}`,
            team_name: callerName,
            severity: 'warning',
          },
        ]);

        return true;
      } catch (e) {
        console.error('Error calling emergency in Supabase', e);
      }
    }

    const controls = getLocalControls();
    controls.emergency_active = true;
    controls.updated_at = new Date().toISOString();
    saveLocalControls(controls);

    addLocalLog('emergency', `EMERGENCY MEETING called by [${callerName}]: ${reason}`, 'warning', callerName);
    return true;
  },

  async dismissEmergency(): Promise<boolean> {
    if (isRealSupabaseConfigured()) {
      try {
        await supabase
          .from('emergency_meetings')
          .update({ status: 'ended' })
          .eq('status', 'active');

        await supabase
          .from('event_controls')
          .update({
            emergency_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', 'primary_match');

        await supabase.from('activity_logs').insert([
          {
            type: 'emergency',
            message: 'Emergency meeting concluded. Crew dismissed to stations.',
            severity: 'info',
          },
        ]);

        return true;
      } catch (e) {
        console.error('Error dismissing emergency in Supabase', e);
      }
    }

    const controls = getLocalControls();
    controls.emergency_active = false;
    controls.updated_at = new Date().toISOString();
    saveLocalControls(controls);

    addLocalLog('emergency', 'Emergency session concluded. Station resumed normal operations.', 'info');
    return true;
  },

  async logCovertElimination(impostorTeamId: string, impostorTeamName: string, targetName: string): Promise<boolean> {
    const points = 150;
    if (isRealSupabaseConfigured()) {
      try {
        const { data: teamData } = await supabase.from('teams').select('score').eq('id', impostorTeamId).single();
        if (teamData) {
          await supabase
            .from('teams')
            .update({ score: (teamData.score || 0) + points })
            .eq('id', impostorTeamId);
        }

        await supabase.from('activity_logs').insert([
          {
            type: 'kill',
            message: `COVERT STRIKE: An unidentified agent eliminated player [${targetName}] in deep orbit (+${points} pts).`,
            severity: 'danger',
          },
        ]);

        return true;
      } catch (e) {
        console.error('Error logging covert elimination in Supabase', e);
      }
    }

    const teams = getLocalTeams();
    const updated = teams.map(t => (t.id === impostorTeamId ? { ...t, score: t.score + points } : t));
    saveLocalTeams(updated);

    addLocalLog(
      'kill',
      `COVERT STRIKE: Biometric signature lost for player [${targetName}] in deep orbit (+${points} pts).`,
      'danger'
    );

    return true;
  },

  // ============================================================================
  // 7. LIVE ACTIVITY STREAM
  // ============================================================================

  async getActivityLogs(): Promise<ActivityLogItem[]> {
    if (isRealSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(40);

        if (data && data.length > 0) {
          const mapped: ActivityLogItem[] = data.map(d => ({
            id: d.id,
            type: d.type,
            message: d.message,
            team_name: d.team_name,
            severity: d.severity || 'info',
            created_at: d.created_at,
          }));
          return mapped;
        }
      } catch (e) {
        console.error('Error fetching logs from Supabase', e);
      }
    }
    return getLocalLogs();
  },

  subscribeToActivityLogs(callback: (logs: ActivityLogItem[]) => void): () => void {
    let unsubscribeSupabase = () => {};

    if (isRealSupabaseConfigured()) {
      const channel = supabase
        .channel('logs-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, async () => {
          const logs = await GameDatabase.getActivityLogs();
          callback(logs);
        })
        .subscribe();

      unsubscribeSupabase = () => {
        supabase.removeChannel(channel);
      };
    }

    const handleLocalUpdate = (e: Event) => {
      const custom = e as CustomEvent<ActivityLogItem[]>;
      callback(custom.detail || getLocalLogs());
    };

    window.addEventListener('nexus:logs_updated', handleLocalUpdate);
    window.addEventListener('storage', () => {
      callback(getLocalLogs());
    });

    return () => {
      unsubscribeSupabase();
      window.removeEventListener('nexus:logs_updated', handleLocalUpdate);
    };
  },
};
