-- ==============================================================================
-- NEXUS Among Us: Coded Chaos & Tech Mystery
-- File 03: Row Level Security (RLS) & Realtime Publication Setup
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystery_clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sabotage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_controls ENABLE ROW LEVEL SECURITY;

-- 2. DROP PREVIOUS RESTRICTIVE POLICIES IF EXIST
DROP POLICY IF EXISTS "Allow public read on teams" ON public.teams;
DROP POLICY IF EXISTS "Allow public insert for team registration" ON public.teams;
DROP POLICY IF EXISTS "Allow public all on teams" ON public.teams;

DROP POLICY IF EXISTS "Allow public read on station_tasks" ON public.station_tasks;
DROP POLICY IF EXISTS "Allow public all on station_tasks" ON public.station_tasks;

DROP POLICY IF EXISTS "Allow public read on mystery_clues" ON public.mystery_clues;
DROP POLICY IF EXISTS "Allow public all on mystery_clues" ON public.mystery_clues;

DROP POLICY IF EXISTS "Allow public read on sabotage_events" ON public.sabotage_events;
DROP POLICY IF EXISTS "Allow public all on sabotage_events" ON public.sabotage_events;

DROP POLICY IF EXISTS "Allow public read on emergency_meetings" ON public.emergency_meetings;
DROP POLICY IF EXISTS "Allow public all on emergency_meetings" ON public.emergency_meetings;

DROP POLICY IF EXISTS "Allow public read on activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow public insert on activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow public all on activity_logs" ON public.activity_logs;

DROP POLICY IF EXISTS "Allow public read on admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow public all on admin_users" ON public.admin_users;

DROP POLICY IF EXISTS "Allow public read on event_controls" ON public.event_controls;
DROP POLICY IF EXISTS "Allow public all on event_controls" ON public.event_controls;

-- 3. PERMISSIVE EVENT OPERATION POLICIES
-- Allows both anonymous web clients (Players & Facilitators) and service role full CRUD capabilities during event
CREATE POLICY "Allow public all on teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on station_tasks" ON public.station_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on mystery_clues" ON public.mystery_clues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on sabotage_events" ON public.sabotage_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on emergency_meetings" ON public.emergency_meetings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on activity_logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on admin_users" ON public.admin_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on event_controls" ON public.event_controls FOR ALL USING (true) WITH CHECK (true);

-- 4. ENABLE SUPABASE REALTIME PUBLICATION
DO $$
BEGIN
    -- Add tables to supabase_realtime publication if not already added
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
