-- ==============================================================================
-- NEXUS Among Us: Coded Chaos & Tech Mystery
-- COMPLETE ALL-IN-ONE SUPABASE DATABASE SETUP & MIGRATION SCRIPT
-- Paste this entire script into your Supabase SQL Editor and click "RUN"
-- Handles both fresh setups AND existing tables with older schemas automatically
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. TABLE DEFINITIONS (DDL)
-- ==============================================================================

-- 1.1 TEAMS TABLE (Dual-event registrations: Coded Chaos + Tech Mystery)
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    leader_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    members JSONB DEFAULT '[]'::jsonb,
    color TEXT DEFAULT '#00F0FF',
    score INT DEFAULT 0,
    tasks_completed INT DEFAULT 0,
    clues_solved INT DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'eliminated', 'winner')),
    registered_events TEXT[] DEFAULT ARRAY['Coded Chaos (Among Us)', 'Tech Mystery (Detective Room)'],
    badge_code TEXT UNIQUE,
    assigned_room TEXT DEFAULT 'Cafeteria',
    is_impostor BOOLEAN DEFAULT false,
    impostor_player_name TEXT,
    team_code TEXT UNIQUE,
    assigned_room_id TEXT,
    assigned_room_name TEXT,
    assigned_zone TEXT,
    power_ports JSONB DEFAULT '[]'::jsonb,
    active_effects JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all teams columns exist on pre-existing tables
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS team_code TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS assigned_room_id TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS assigned_room_name TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS assigned_zone TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS power_ports JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS active_effects JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS assigned_room TEXT DEFAULT 'Room 1';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS is_impostor BOOLEAN DEFAULT false;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS impostor_player_name TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS badge_code TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_teams_score ON public.teams (score DESC);
CREATE INDEX IF NOT EXISTS idx_teams_room ON public.teams (assigned_room);
CREATE INDEX IF NOT EXISTS idx_teams_code ON public.teams (team_code);

-- 1.2 SECTOR ROOMS & ZONES TABLE (Dynamic Rooms, Capacities, & Assigned POCs)
CREATE TABLE IF NOT EXISTS public.rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    zone TEXT NOT NULL,
    capacity INT DEFAULT 20,
    poc_name TEXT,
    poc_contact TEXT,
    poc_email TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS poc_name TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS poc_contact TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS poc_email TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_rooms_zone ON public.rooms (zone);

-- 1.3 STANDARD POWERS LIBRARY TABLE (3 Ports of Power, Cooldowns & Target Rules)
CREATE TABLE IF NOT EXISTS public.powers_library (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    cooldown_seconds INT NOT NULL DEFAULT 30,
    duration_seconds INT NOT NULL DEFAULT 20,
    target_required BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'paused', 'disabled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 STATION TASKS & SECTOR PUZZLES TABLE
CREATE TABLE IF NOT EXISTS public.station_tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    room TEXT NOT NULL,
    description TEXT NOT NULL,
    snippet TEXT,
    clue_hint TEXT,
    flag_answer TEXT,
    points INT DEFAULT 100,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    completed_by_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all station_tasks columns exist on pre-existing tables
ALTER TABLE public.station_tasks ADD COLUMN IF NOT EXISTS snippet TEXT;
ALTER TABLE public.station_tasks ADD COLUMN IF NOT EXISTS clue_hint TEXT;
ALTER TABLE public.station_tasks ADD COLUMN IF NOT EXISTS flag_answer TEXT;
ALTER TABLE public.station_tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_tasks_room ON public.station_tasks (room);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.station_tasks (status);

-- 1.3 TECH MYSTERY CLUES & CASE DOSSIERS TABLE
CREATE TABLE IF NOT EXISTS public.mystery_clues (
    id TEXT PRIMARY KEY,
    case_file TEXT NOT NULL,
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Novice', 'Investigator', 'Cyber Detective')),
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    puzzle_content TEXT NOT NULL,
    hint TEXT,
    flag_hash TEXT NOT NULL,
    points INT DEFAULT 250,
    solved_by_team_ids UUID[] DEFAULT ARRAY[]::UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mystery_clues ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 1.4 SABOTAGE ALARM EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.sabotage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('reactor', 'oxygen', 'lights', 'comms')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    duration_seconds INT DEFAULT 60,
    time_remaining INT DEFAULT 60,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'expired')),
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL
);

-- 1.5 EMERGENCY MEETINGS TABLE
CREATE TABLE IF NOT EXISTS public.emergency_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caller_name TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended')),
    ejected_player TEXT,
    votes JSONB DEFAULT '{}'::jsonb,
    time_remaining INT DEFAULT 90,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 LIVE ACTIVITY AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('task', 'sabotage', 'emergency', 'clue', 'kill', 'system', 'admin', 'power', 'impostor_assign', 'login')),
    message TEXT NOT NULL,
    team_name TEXT,
    team_id TEXT,
    target_team_id TEXT,
    target_team_name TEXT,
    room_name TEXT,
    power_name TEXT,
    port_index INT,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'danger', 'success')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS team_id TEXT;
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS target_team_id TEXT;
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS target_team_name TEXT;
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS room_name TEXT;
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS power_name TEXT;
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS port_index INT;
ALTER TABLE public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_type_check;
ALTER TABLE public.activity_logs ADD CONSTRAINT activity_logs_type_check CHECK (type IN ('task', 'sabotage', 'emergency', 'clue', 'kill', 'system', 'admin', 'power', 'impostor_assign', 'login'));

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs (created_at DESC);

-- 1.7 ADMIN USERS & FACILITATOR CREDENTIALS TABLE (Stored in Database)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facilitator_id TEXT UNIQUE,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator')),
    password TEXT NOT NULL DEFAULT 'admin2026',
    poc_room TEXT,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all admin_users columns exist on pre-existing tables BEFORE index creation
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS facilitator_id TEXT;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS password TEXT NOT NULL DEFAULT 'admin2026';
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS poc_room TEXT;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'admin_users_facilitator_id_key'
    ) THEN
        BEGIN
            ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_facilitator_id_key UNIQUE (facilitator_id);
        EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
        END;
    END IF;
END $$;

-- Populate facilitator_id for existing records where it might be null
UPDATE public.admin_users
SET facilitator_id = CASE
    WHEN role = 'super_admin' THEN 'NX-SUPER-01'
    WHEN role = 'admin' THEN 'NX-ADMIN-02'
    WHEN role = 'moderator' THEN 'NX-POC-03'
    ELSE 'NX-FAC-' || SUBSTRING(id::text, 1, 4)
END
WHERE facilitator_id IS NULL;

-- Now safe to create index on facilitator_id
CREATE INDEX IF NOT EXISTS idx_admin_facilitator_id ON public.admin_users (facilitator_id);

-- 1.8 EVENT MASTER CONTROLS TABLE
CREATE TABLE IF NOT EXISTS public.event_controls (
    id TEXT PRIMARY KEY DEFAULT 'primary_match',
    status TEXT NOT NULL DEFAULT 'standby' CHECK (status IN ('standby', 'running', 'paused', 'ended')),
    impostor_powers_active BOOLEAN NOT NULL DEFAULT true,
    elapsed_seconds INT NOT NULL DEFAULT 0,
    current_round INT NOT NULL DEFAULT 1,
    active_sabotage TEXT,
    emergency_active BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.event_controls ADD COLUMN IF NOT EXISTS impostor_powers_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.event_controls ADD COLUMN IF NOT EXISTS active_sabotage TEXT;
ALTER TABLE public.event_controls ADD COLUMN IF NOT EXISTS emergency_active BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.event_controls ADD COLUMN IF NOT EXISTS elapsed_seconds INT NOT NULL DEFAULT 0;
ALTER TABLE public.event_controls ADD COLUMN IF NOT EXISTS current_round INT NOT NULL DEFAULT 1;
ALTER TABLE public.event_controls ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.powers_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystery_clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sabotage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_controls ENABLE ROW LEVEL SECURITY;

-- Reset prior policies to ensure clean state
DROP POLICY IF EXISTS "Allow public all on teams" ON public.teams;
DROP POLICY IF EXISTS "Allow public all on rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public all on powers_library" ON public.powers_library;
DROP POLICY IF EXISTS "Allow public all on station_tasks" ON public.station_tasks;
DROP POLICY IF EXISTS "Allow public all on mystery_clues" ON public.mystery_clues;
DROP POLICY IF EXISTS "Allow public all on sabotage_events" ON public.sabotage_events;
DROP POLICY IF EXISTS "Allow public all on emergency_meetings" ON public.emergency_meetings;
DROP POLICY IF EXISTS "Allow public all on activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow public all on admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow public all on event_controls" ON public.event_controls;

DROP POLICY IF EXISTS "Allow public read on teams" ON public.teams;
DROP POLICY IF EXISTS "Allow public read on rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public read on powers_library" ON public.powers_library;
DROP POLICY IF EXISTS "Allow public read on station_tasks" ON public.station_tasks;
DROP POLICY IF EXISTS "Allow public read on mystery_clues" ON public.mystery_clues;
DROP POLICY IF EXISTS "Allow public read on sabotage_events" ON public.sabotage_events;
DROP POLICY IF EXISTS "Allow public read on emergency_meetings" ON public.emergency_meetings;
DROP POLICY IF EXISTS "Allow public read on activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow public read on admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow public read on event_controls" ON public.event_controls;

-- Full CRUD permissions for anon web apps and service role
CREATE POLICY "Allow public all on teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on rooms" ON public.rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on powers_library" ON public.powers_library FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on station_tasks" ON public.station_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on mystery_clues" ON public.mystery_clues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on sabotage_events" ON public.sabotage_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on emergency_meetings" ON public.emergency_meetings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on activity_logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on admin_users" ON public.admin_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on event_controls" ON public.event_controls FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 3. REALTIME REPLICATION CONFIGURATION
-- ==============================================================================

DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.powers_library;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.station_tasks;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.mystery_clues;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.sabotage_events;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_meetings;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_users;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.event_controls;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

-- ==============================================================================
-- 4. SEED DATA (Credentials, Tasks, Clues, Teams, Controls)
-- ==============================================================================

-- 4.1 Facilitator Credentials
INSERT INTO public.admin_users (id, facilitator_id, username, name, email, role, password, poc_room, title)
VALUES
    (
        'a0000000-0000-0000-0000-000000000001',
        'NX-SUPER-01',
        'nx-super-01',
        'Tejas Narula',
        'tejas@nexus.org',
        'super_admin',
        'master2026',
        NULL,
        'Lead Operations Facilitator (Super Admin)'
    ),
    (
        'a0000000-0000-0000-0000-000000000002',
        'NX-ADMIN-02',
        'nx-admin-02',
        'Aarav Sharma',
        'aarav@nexus.org',
        'admin',
        'admin2026',
        NULL,
        'Station Operations Admin'
    ),
    (
        'a0000000-0000-0000-0000-000000000003',
        'NX-POC-03',
        'nx-poc-03',
        'Zoya Khan',
        'zoya@nexus.org',
        'moderator',
        'poc2026',
        'Reactor',
        'Field Moderator & Reactor Sector POC'
    )
ON CONFLICT (username) DO UPDATE SET
    facilitator_id = EXCLUDED.facilitator_id,
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    password = EXCLUDED.password,
    poc_room = EXCLUDED.poc_room,
    title = EXCLUDED.title;

-- 4.2 Event Controls
INSERT INTO public.event_controls (id, status, impostor_powers_active, elapsed_seconds, current_round, active_sabotage, emergency_active)
VALUES
    ('primary_match', 'running', true, 1420, 1, NULL, false)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    impostor_powers_active = EXCLUDED.impostor_powers_active;

-- 4.3 Station Tasks Across All 9 Rooms
INSERT INTO public.station_tasks (id, title, room, description, snippet, clue_hint, flag_answer, points, status)
VALUES
    (
        'task-elec-01',
        'Fix Circuit Breakers & Logic Gate',
        'Electrical',
        'Resolve the asynchronous race condition in the primary breaker module to stabilize lighting grid.',
        'async function restorePower() {\n  await resetBreaker(0x7F);\n  return true;\n}',
        'Check bitwise mask 0x7F against breaker switch array #4.',
        'FLAG_VOLTAGE_NOMINAL',
        100,
        'pending'
    ),
    (
        'task-elec-02',
        'Divert Aux Power to Shields',
        'Electrical',
        'Reroute high-draw conduits from non-essential galley heaters to external magnetic deflection deflectors.',
        'reroute(powerGrid.galley, powerGrid.deflectors, 85);',
        'Flip auxiliary relays 3 and 7 on the central electrical chassis.',
        'FLAG_AUX_SHIELDS_ONLINE',
        120,
        'pending'
    ),
    (
        'task-react-01',
        'Quantum Core Synchronization',
        'Reactor',
        'Calibrate harmonic resonance between upper and lower quantum flux manifolds to prevent thermal runaway.',
        'const resonance = Math.sqrt(fluxA * fluxB) / 2.718;',
        'Match frequencies to Euler harmonic ratio (e = 2.718).',
        'FLAG_CORE_SYNCHRONIZED',
        150,
        'pending'
    ),
    (
        'task-react-02',
        'Unlock Primary Manifolds',
        'Reactor',
        'Input sequence 1-10 on numeric matrix keypad in ascending prime order.',
        'keypad.enterSequence([2, 3, 5, 7]);',
        'Only enter the prime values strictly under 10.',
        'FLAG_MANIFOLD_UNLOCKED',
        110,
        'pending'
    ),
    (
        'task-med-01',
        'DNA Sample Scan & Cipher Match',
        'MedBay',
        'Deconvolve the synthetic nucleotide sequence left on the biometric scanner.',
        'MATCH // ATCG-9921-X // PATIENT CLASSIFIED',
        'Look for adenine-thymine base inversion in strand 3.',
        'FLAG_DNA_DECONVOLVED',
        120,
        'pending'
    ),
    (
        'task-med-02',
        'Inspect Biometric Diagnostic Bed',
        'MedBay',
        'Run complete 60-second diagnostic cycle on station biometric pod alpha.',
        'scanner.runDiagnostics({ target: "player_biometrics", depth: "cellular" });',
        'Ensure the player remains standing on the green sensor plate.',
        'FLAG_DIAGNOSTICS_CLEAR',
        90,
        'pending'
    ),
    (
        'task-nav-01',
        'Chart Sublight Trajectory Coordinates',
        'Navigation',
        'Plot shortest vector path through asteroid belt sector 7G avoid collision corridors.',
        'dijkstra(starMap, "Skeld", "NexusHub");',
        'Compute path weight using shortest distance node Dijkstra.',
        'FLAG_NAV_VECTOR_LOCKED',
        110,
        'pending'
    ),
    (
        'task-nav-02',
        'Stabilize Steering Gyroscope',
        'Navigation',
        'Align crosshairs over the pulsating telemetry beacon until drift reaches zero.',
        'gyro.calibrate({ pitch: 0.00, yaw: 0.00, roll: 0.00 });',
        'Hold cursor within 2-pixel tolerance for 3 continuous seconds.',
        'FLAG_GYRO_STABILIZED',
        100,
        'pending'
    ),
    (
        'task-admin-01',
        'Swipe Holographic ID Card',
        'Admin',
        'Calibrate card swipe duration between 0.8s and 1.2s without speed jitter.',
        'AUTH PROTOCOL: SWIPE_SPEED = 0.94s [ACCEPTED]',
        'A steady medium swipe yields green pass verification.',
        'FLAG_CARD_VERIFIED',
        80,
        'pending'
    ),
    (
        'task-admin-02',
        'Upload Biometric Route Logs',
        'Admin',
        'Transmit local Skeld sector routing records to planetary command downlink.',
        'transferFile("route_logs.tar.gz", "downlink://ground-control");',
        'Do not close the transfer dialog before packet 100/100.',
        'FLAG_ROUTE_LOGS_UPLOADED',
        100,
        'pending'
    ),
    (
        'task-o2-01',
        'Clean Atmospheric Filter Canister',
        'O2',
        'Purge scrubbed carbon particulate from manifold B secondary bypass chamber.',
        'SCRUB_O2_PRESSURE = 101.3 kPa [NOMINAL]',
        'Drag 6 discarded leaves into the waste ejection chute.',
        'FLAG_O2_SCRUBBER_CLEAN',
        90,
        'pending'
    ),
    (
        'task-o2-02',
        'Empty Waste Ejection Chute',
        'O2',
        'Pull down pneumatic lever for 3 seconds to expel non-recyclable canister debris.',
        'chute.release(PNEUMATIC_VALVE_MAX);',
        'Hold handle firmly until audio hiss completes.',
        'FLAG_CHUTE_EXPELLED',
        90,
        'pending'
    ),
    (
        'task-weap-01',
        'Target Calibration & Meteor Deflection',
        'Weapons',
        'Calculate lead firing angle for approaching orbital debris traveling at 0.15c.',
        'trajectory = leadTarget(debrisVector, 0.15);',
        'Destroy 20 asteroid obstacles using laser battery turrets.',
        'FLAG_METEORS_DEFLECTED',
        130,
        'pending'
    ),
    (
        'task-comms-01',
        'Descramble Transmission Beacon',
        'Communications',
        'Tune bandpass filter to 1420.405 MHz to eliminate foreign carrier hum.',
        'radio.frequency = 1420.405; // Hydrogen Line',
        'Rotate tuning knob until frequency display locks in solid green.',
        'FLAG_COMMS_CLEARED',
        100,
        'pending'
    ),
    (
        'task-cafe-01',
        'Emergency Fuel Pod Balancing',
        'Cafeteria',
        'Equalize gravity ballast chambers 1 and 2 to stabilize dining deck orbital trim.',
        'ballast.balance(50, 50);',
        'Calibrate fuel gauge pointers to exact 50-50 parity.',
        'FLAG_BALLAST_BALANCED',
        100,
        'pending'
    )
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    room = EXCLUDED.room,
    description = EXCLUDED.description,
    snippet = EXCLUDED.snippet,
    clue_hint = EXCLUDED.clue_hint,
    flag_answer = EXCLUDED.flag_answer,
    points = EXCLUDED.points;

-- 4.4 Mystery Clues & Dossiers
INSERT INTO public.mystery_clues (id, case_file, title, difficulty, location, description, puzzle_content, hint, flag_hash, points)
VALUES
    (
        'clue-01',
        'DOSSIER #01: THE GHOST IN ELECTRICAL',
        'The Inverted Binary Log',
        'Novice',
        'Electrical Main Panel',
        'A shredded flash drive recovered near the breaker has a raw inverted byte stream. Decode the embedded ASCII token.',
        '01001110 01000101 01011000 01010101 01010011 01011111 01000011 01001000 01000001 01001111 01010011',
        'Convert binary 8-bit bytes to standard ASCII characters.',
        'NEXUS_CHAOS',
        250
    ),
    (
        'clue-02',
        'DOSSIER #02: MEDBAY METADATA',
        'The Caesar Shift of Patient Zero',
        'Investigator',
        'MedBay Quarantine Bio-Terminal',
        'The autopsy report timestamp was encrypted with a classic cryptographic rotation (ROT-13). Decipher the infected compartment name.',
        'GUR_VZCBFGBE_VF_VAFVQR_GRPABYBTl',
        'Rotate every Latin letter forward or backward by 13 positions.',
        'THE_IMPOSTOR_IS_INSIDE_TECHNOLOGY',
        350
    ),
    (
        'clue-03',
        'DOSSIER #03: NAVIGATION HEX TRAIL',
        'The Quantum Coordinates Hex Dump',
        'Cyber Detective',
        'Navigation Sub-console',
        'Steering telemetry was overridden. The intruder left a hexadecimal signature pointing to their secret communication channel.',
        '4e 45 58 55 53 5f 52 45 44 5f 53 55 53',
        'Hexadecimal to ASCII decoder. Look for color markers.',
        'NEXUS_RED_SUS',
        500
    ),
    (
        'clue-04',
        'DOSSIER #04: THE REACTOR KEYCARD',
        'Base64 Memory Leak',
        'Investigator',
        'Lower Reactor Access Shaft',
        'An intercepted packet during reactor stabilization contained an obfuscated payload string.',
        'Q09ERURfQ0hBT1NfV0lOTkVS',
        'RFC 4648 Base64 decoding reveals the victory token.',
        'CODED_CHAOS_WINNER',
        300
    ),
    (
        'clue-05',
        'DOSSIER #05: O2 SCRUBBER WHISPER',
        'Vigenere Cipher Over Airwaves',
        'Cyber Detective',
        'Oxygen Scrubber Manifold C',
        'Sub-atmospheric frequency recorded repeating harmonic hum modulated with key "SKELD".',
        'VWV_UKVE_WYS_JAZU',
        'Vigenere decipher using passphrase "SKELD".',
        'THE_CORE_HAS_FALLEN',
        450
    )
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    case_file = EXCLUDED.case_file,
    difficulty = EXCLUDED.difficulty,
    location = EXCLUDED.location,
    description = EXCLUDED.description,
    puzzle_content = EXCLUDED.puzzle_content,
    hint = EXCLUDED.hint,
    flag_hash = EXCLUDED.flag_hash,
    points = EXCLUDED.points;

-- 4.5 Teams Initial Allotment
INSERT INTO public.teams (id, name, leader_name, email, phone, members, color, score, tasks_completed, clues_solved, status, badge_code, assigned_room, is_impostor, impostor_player_name)
VALUES
    (
        'b0000000-0000-0000-0000-000000000001',
        'Cyber Phantoms',
        'Arjun Verma',
        'arjun@nexus.org',
        '9876543210',
        '["Arjun Verma", "Priya Singh", "Rohan Mehta", "Ananya Roy"]'::jsonb,
        '#00F0FF',
        1850,
        14,
        3,
        'active',
        'NX-7841',
        'Electrical',
        true,
        'Rohan Mehta'
    ),
    (
        'b0000000-0000-0000-0000-000000000002',
        'Quantum Breakers',
        'Sara Chen',
        'sara@nexus.org',
        '9876543211',
        '["Sara Chen", "Dev Patel", "Meera Joshi"]'::jsonb,
        '#7000FF',
        1620,
        11,
        2,
        'active',
        'NX-9923',
        'Reactor',
        false,
        NULL
    ),
    (
        'b0000000-0000-0000-0000-000000000003',
        'Binary Raiders',
        'Kabir Sen',
        'kabir@nexus.org',
        '9876543212',
        '["Kabir Sen", "Tara Alvi", "Karan Kapoor", "Simran Kaur"]'::jsonb,
        '#FF0055',
        1490,
        9,
        2,
        'active',
        'NX-3312',
        'MedBay',
        false,
        NULL
    ),
    (
        'b0000000-0000-0000-0000-000000000004',
        'Glitch Mob',
        'Nikhil Rao',
        'nikhil@nexus.org',
        '9876543213',
        '["Nikhil Rao", "Sneha Nair", "Aakash Gupta"]'::jsonb,
        '#FFE600',
        1380,
        8,
        1,
        'active',
        'NX-6654',
        'Navigation',
        true,
        'Sneha Nair'
    ),
    (
        'b0000000-0000-0000-0000-000000000005',
        'Null Pointers',
        'Farhan Zaidi',
        'farhan@nexus.org',
        '9876543214',
        '["Farhan Zaidi", "Ishaan Malhotra", "Rhea Pillai"]'::jsonb,
        '#00FF66',
        1210,
        7,
        1,
        'active',
        'NX-1149',
        'Admin',
        false,
        NULL
    ),
    (
        'b0000000-0000-0000-0000-000000000006',
        'Zero Day Ops',
        'Aditi Deshmukh',
        'aditi@nexus.org',
        '9876543215',
        '["Aditi Deshmukh", "Vikram Rathore", "Kavya Menon"]'::jsonb,
        '#FF6600',
        1050,
        6,
        1,
        'active',
        'NX-5521',
        'Weapons',
        false,
        NULL
    )
ON CONFLICT (name) DO UPDATE SET
    leader_name = EXCLUDED.leader_name,
    score = EXCLUDED.score,
    assigned_room = EXCLUDED.assigned_room,
    is_impostor = EXCLUDED.is_impostor,
    impostor_player_name = EXCLUDED.impostor_player_name;

-- 4.6 Sector Rooms Initial Seed
INSERT INTO public.rooms (id, name, zone, capacity, poc_name, poc_contact, poc_email, notes)
VALUES
    ('room-1', 'Room 1', 'Zone A', 20, 'Aarav Sharma', '+91 98111 22334', 'aarav@nexus.org', 'Main Hall'),
    ('room-2', 'Room 2', 'Zone A', 20, 'Zoya Khan', '+91 98222 33445', 'zoya@nexus.org', 'Lobby Annex'),
    ('room-3', 'Room 3', 'Zone B', 18, 'Devansh Joshi', '+91 98333 44556', 'devansh@nexus.org', 'Lab 102'),
    ('room-4', 'Room 4', 'Zone B', 18, 'Priya Bhatia', '+91 98444 55667', 'priya@nexus.org', 'Room 104'),
    ('room-5', 'Room 5', 'Zone C', 15, 'Kabir Verma', '+91 98555 66778', 'kabir@nexus.org', 'Lab 201'),
    ('room-6', 'Room 6', 'Zone C', 15, 'Tanya Roy', '+91 98666 77889', 'tanya@nexus.org', 'Workshop Area')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    zone = EXCLUDED.zone,
    capacity = EXCLUDED.capacity,
    poc_name = EXCLUDED.poc_name,
    poc_contact = EXCLUDED.poc_contact,
    poc_email = EXCLUDED.poc_email;

-- 4.7 Standard Powers Library Initial Seed
INSERT INTO public.powers_library (id, name, description, cooldown_seconds, duration_seconds, target_required, status)
VALUES
    ('sabotage-lights', 'Sabotage Lights', 'Kill sector power, plunging the room into darkness.', 30, 20, false, 'ready'),
    ('terminal-freeze', 'Terminal Freeze', 'Freeze target crewmate team terminal, disabling all actions for 30s.', 45, 30, true, 'ready'),
    ('comms-blackout', 'Comms Blackout', 'Disrupt radio signals and clue deciphering for target crewmate team.', 40, 25, true, 'ready'),
    ('door-lockdown', 'Door Lockdown', 'Seal sector doors and freeze room movement for target crewmates.', 60, 35, true, 'ready'),
    ('fake-clue-inject', 'Fake Clue Inject', 'Transmit corrupted forensic clue decipher to confuse target crewmates.', 35, 20, true, 'ready'),
    ('radio-jammer', 'Radio Jammer', 'Jam coordinator hotline and emergency signals for target crewmate team.', 50, 30, true, 'ready')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    cooldown_seconds = EXCLUDED.cooldown_seconds,
    duration_seconds = EXCLUDED.duration_seconds,
    target_required = EXCLUDED.target_required;

-- 4.8 System Initial Activity Log
INSERT INTO public.activity_logs (type, message, severity)
VALUES ('system', 'NEXUS Skeld Station Database online. Rooms, Powers Library, Master schemas and realtime replication ready.', 'info');
