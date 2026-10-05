-- ==============================================================================
-- NEXUS Among Us: IMMEDIATE FIX & COLUMN MIGRATION SCRIPT
-- Run this in your Supabase SQL Editor to instantly add missing columns
-- and insert all seed data without errors!
-- ==============================================================================

-- 1. FIX: Add missing columns to admin_users
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS facilitator_id TEXT;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS password TEXT NOT NULL DEFAULT 'admin2026';
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS poc_room TEXT;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add unique constraint on facilitator_id if not present
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

-- Populate facilitator_id for any rows where it might be null
UPDATE public.admin_users
SET facilitator_id = CASE
    WHEN role = 'super_admin' THEN 'NX-SUPER-01'
    WHEN role = 'admin' THEN 'NX-ADMIN-02'
    WHEN role = 'moderator' THEN 'NX-POC-03'
    ELSE 'NX-FAC-' || SUBSTRING(id::text, 1, 4)
END
WHERE facilitator_id IS NULL;

-- 2. FIX: Add missing columns to station_tasks
ALTER TABLE public.station_tasks ADD COLUMN IF NOT EXISTS snippet TEXT;
ALTER TABLE public.station_tasks ADD COLUMN IF NOT EXISTS clue_hint TEXT;
ALTER TABLE public.station_tasks ADD COLUMN IF NOT EXISTS flag_answer TEXT;
ALTER TABLE public.station_tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. FIX: Add missing columns to teams
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS assigned_room TEXT DEFAULT 'Cafeteria';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS is_impostor BOOLEAN DEFAULT false;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS impostor_player_name TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS badge_code TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. FIX: Add missing columns to event_controls
ALTER TABLE public.event_controls ADD COLUMN IF NOT EXISTS impostor_powers_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.event_controls ADD COLUMN IF NOT EXISTS active_sabotage TEXT;
ALTER TABLE public.event_controls ADD COLUMN IF NOT EXISTS emergency_active BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.event_controls ADD COLUMN IF NOT EXISTS elapsed_seconds INT NOT NULL DEFAULT 0;
ALTER TABLE public.event_controls ADD COLUMN IF NOT EXISTS current_round INT NOT NULL DEFAULT 1;
ALTER TABLE public.event_controls ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. UPSERT OFFICIAL FACILITATOR CREDENTIALS
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

-- 6. ENSURE RLS ALLOWS ADMIN AND WEB APP READ & WRITE
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystery_clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sabotage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_controls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all on admin_users" ON public.admin_users;
CREATE POLICY "Allow public all on admin_users" ON public.admin_users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on teams" ON public.teams;
CREATE POLICY "Allow public all on teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on station_tasks" ON public.station_tasks;
CREATE POLICY "Allow public all on station_tasks" ON public.station_tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on event_controls" ON public.event_controls;
CREATE POLICY "Allow public all on event_controls" ON public.event_controls FOR ALL USING (true) WITH CHECK (true);

-- SUCCESS CONFIRMATION
SELECT 'NEXUS Database Migration Complete: All columns, credentials and policies successfully applied!' AS status;
