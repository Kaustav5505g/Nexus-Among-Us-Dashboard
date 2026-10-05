-- ==============================================================================
-- NEXUS Among Us: Coded Chaos & Tech Mystery
-- Supabase PostgreSQL Schema & Realtime Setup
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TEAMS TABLE (Dual-event registrations: Coded Chaos + Tech Mystery)
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_score ON public.teams (score DESC);
CREATE INDEX IF NOT EXISTS idx_teams_room ON public.teams (assigned_room);

-- 2. STATION TASKS & SECTOR PUZZLES TABLE
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

CREATE INDEX IF NOT EXISTS idx_tasks_room ON public.station_tasks (room);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.station_tasks (status);

-- 3. TECH MYSTERY CLUES & CASE DOSSIERS TABLE
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

-- 4. SABOTAGE ALARM EVENTS TABLE
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

-- 5. EMERGENCY MEETINGS TABLE
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

-- 6. LIVE ACTIVITY AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('task', 'sabotage', 'emergency', 'clue', 'kill', 'system', 'admin')),
    message TEXT NOT NULL,
    team_name TEXT,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'danger', 'success')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs (created_at DESC);

-- 7. ADMIN USERS & FACILITATOR CREDENTIALS TABLE (Stored in Database)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facilitator_id TEXT NOT NULL UNIQUE,
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

CREATE INDEX IF NOT EXISTS idx_admin_facilitator_id ON public.admin_users (facilitator_id);

-- 8. EVENT MASTER CONTROLS TABLE
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

-- Retroactive migrations for pre-existing tables
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

ALTER TABLE public.station_tasks ADD COLUMN IF NOT EXISTS snippet TEXT;
ALTER TABLE public.station_tasks ADD COLUMN IF NOT EXISTS clue_hint TEXT;
ALTER TABLE public.station_tasks ADD COLUMN IF NOT EXISTS flag_answer TEXT;
ALTER TABLE public.station_tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS assigned_room TEXT DEFAULT 'Cafeteria';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS is_impostor BOOLEAN DEFAULT false;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS impostor_player_name TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS badge_code TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.event_controls ADD COLUMN IF NOT EXISTS impostor_powers_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.event_controls ADD COLUMN IF NOT EXISTS active_sabotage TEXT;
ALTER TABLE public.event_controls ADD COLUMN IF NOT EXISTS emergency_active BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.event_controls ADD COLUMN IF NOT EXISTS elapsed_seconds INT NOT NULL DEFAULT 0;
ALTER TABLE public.event_controls ADD COLUMN IF NOT EXISTS current_round INT NOT NULL DEFAULT 1;
ALTER TABLE public.event_controls ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystery_clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sabotage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_controls ENABLE ROW LEVEL SECURITY;

-- Allow full CRUD for anon and service role during event
CREATE POLICY "Allow public all on teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on station_tasks" ON public.station_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on mystery_clues" ON public.mystery_clues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on sabotage_events" ON public.sabotage_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on emergency_meetings" ON public.emergency_meetings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on activity_logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on admin_users" ON public.admin_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on event_controls" ON public.event_controls FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- SUPABASE REALTIME REPLICATION CONFIGURATION
-- ==============================================================================

DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
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
