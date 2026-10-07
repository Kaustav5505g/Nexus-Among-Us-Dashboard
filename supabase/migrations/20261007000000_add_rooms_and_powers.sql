-- ==============================================================================
-- NEXUS Among Us: Migration 20261007000000
-- Add Sector Rooms, Powers Library, Enhanced Team Codes & Impostor Ports
-- ==============================================================================

-- 1. SECTOR ROOMS & ZONES TABLE (Dynamic Rooms, Capacities, & Assigned POCs)
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

-- 2. STANDARD POWERS LIBRARY TABLE (3 Ports of Power, Cooldowns & Target Rules)
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

-- 3. ENHANCE TEAMS TABLE (Team Codes, Sector Room & Zone Mappings, 3-Port Powers, Active Effects)
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

CREATE INDEX IF NOT EXISTS idx_teams_code ON public.teams (team_code);
CREATE INDEX IF NOT EXISTS idx_teams_room_id ON public.teams (assigned_room_id);

-- 4. ENHANCE ACTIVITY LOGS TABLE (Team ID, Target Tracking, Room Name, Power Ports)
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS team_id TEXT;
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS target_team_id TEXT;
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS target_team_name TEXT;
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS room_name TEXT;
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS power_name TEXT;
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS port_index INT;

-- Update activity_logs type check constraint
ALTER TABLE public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_type_check;
ALTER TABLE public.activity_logs ADD CONSTRAINT activity_logs_type_check
    CHECK (type IN ('task', 'sabotage', 'emergency', 'clue', 'kill', 'system', 'admin', 'power', 'impostor_assign', 'login'));

-- 5. ROW LEVEL SECURITY (RLS) FOR NEW TABLES
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.powers_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view rooms" ON public.rooms;
CREATE POLICY "Public can view rooms" ON public.rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role has full access to rooms" ON public.rooms;
CREATE POLICY "Service role has full access to rooms" ON public.rooms FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can view powers_library" ON public.powers_library;
CREATE POLICY "Public can view powers_library" ON public.powers_library FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role has full access to powers_library" ON public.powers_library;
CREATE POLICY "Service role has full access to powers_library" ON public.powers_library FOR ALL USING (true);

-- 6. ADD NEW TABLES TO REALTIME PUBLICATION
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'rooms'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'powers_library'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.powers_library;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- 7. SEED INITIAL SECTOR ROOMS
INSERT INTO public.rooms (id, name, zone, capacity, poc_name, poc_contact, poc_email, notes)
VALUES
    ('room-1', 'Room 1 (Command Hub)', 'Zone A', 20, 'Alex Vance', '+91 98765 00001', 'alex@nexus.org', 'Primary entrance briefing room'),
    ('room-2', 'Room 2 (Logic Labs)', 'Zone A', 20, 'Jordan Lee', '+91 98765 00002', 'jordan@nexus.org', 'Debugging terminal room'),
    ('room-3', 'Room 3 (Data Vault)', 'Zone B', 25, 'Taylor Swift', '+91 98765 00003', 'taylor@nexus.org', 'Server racks and storage'),
    ('room-4', 'Room 4 (Cyber Security)', 'Zone B', 20, 'Sam Altman', '+91 98765 00004', 'sam@nexus.org', 'Forensics terminal'),
    ('room-5', 'Room 5 (Research Deck)', 'Zone C', 25, 'Elena Rostova', '+91 98765 00005', 'elena@nexus.org', 'Bio and algorithmic analysis'),
    ('room-6', 'Room 6 (Operations Deck)', 'Zone C', 30, 'Vikram Malhotra', '+91 98765 00006', 'vikram@nexus.org', 'Emergency meeting auditorium')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    zone = EXCLUDED.zone,
    capacity = EXCLUDED.capacity,
    poc_name = EXCLUDED.poc_name,
    poc_contact = EXCLUDED.poc_contact,
    poc_email = EXCLUDED.poc_email,
    updated_at = NOW();

-- 8. SEED STANDARD POWERS LIBRARY
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
    target_required = EXCLUDED.target_required,
    status = EXCLUDED.status,
    updated_at = NOW();
