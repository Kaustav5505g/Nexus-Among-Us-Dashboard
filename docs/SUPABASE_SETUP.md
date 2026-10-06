# 🗄️ Setting Up Supabase for NEXUS Dashboard

Follow this guide to initialize the PostgreSQL database and real-time streaming publication on **Supabase** using our **single unified schema script**.

---

## 1. Create a Supabase Project

1. Navigate to [https://supabase.com](https://supabase.com) and create an account or sign in.
2. Click **New Project**.
3. Choose your Organization, enter Project Name (e.g. `nexus-among-us-dashboard`), and generate a strong database password.
4. Select the region closest to your venue/users.
5. Click **Create new project** and wait 1-2 minutes for provisioning.

---

## 2. Execute Database Schema or Update Script

### Option A: Updating an Existing Database (Recommended)
If your Supabase project is already set up and you need to add the new **Sector Rooms**, **Powers Library**, **Team Codes**, and **3-Port Impostor Powers**:
1. In your Supabase Project Dashboard, click on **SQL Editor** -> **New query**.
2. Open migration [`supabase/migrations/20261007000000_add_rooms_and_powers.sql`](../supabase/migrations/20261007000000_add_rooms_and_powers.sql) (or [`supabase/schema.sql`](../supabase/schema.sql)).
3. Paste the contents into the SQL Editor and click **Run**.
   - Creates `public.rooms` and `public.powers_library`.
   - Adds `team_code`, `assigned_room_id`, `assigned_room_name`, `assigned_zone`, `power_ports`, and `active_effects` to `public.teams`.
   - Adds `team_id`, `target_team_id`, `target_team_name`, `room_name`, `power_name`, and `port_index` to `public.activity_logs`.
   - Adds RLS policies and Realtime publication hooks for the new tables.
   - Populates initial room definitions and the standard power library.

### Option B: Fresh Database Setup
For a brand-new Supabase project:
1. Open [`supabase/schema.sql`](../supabase/schema.sql), copy its entire contents, and paste it into the SQL Editor.
2. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).
   - Automatically provisions all 8 tables, indexes, RLS policies, seeds, and Realtime streaming publication.

---

## 3. Retrieve API Credentials

1. Go to **Project Settings** (gear icon) -> **API**.
2. Under **Project URL**, copy the URL (e.g. `https://your-ref.supabase.co`).
3. Under **Project API keys**:
   - Copy the `anon` `public` key (for frontend).
   - Copy the `service_role` `secret` key (for backend admin operations — *never expose in frontend*).

---

## 4. Configure Local & Production Environment

Add these credentials to your environment files:

### Local Development (`frontend/.env`):
```env
VITE_SUPABASE_URL=https://your-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
```

### Production Deployment (Vercel / Cloud):
Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Project Settings -> Environment Variables** in your hosting dashboard.

---

## 5. Verification Checklist

To confirm your Supabase database is connected and operational:
1. Open the Supabase **Table Editor** and verify data exists in:
   - `rooms` (e.g., Room 1, Room 2, Reactor, Electrical, Cafeteria, Navigation)
   - `powers_library` (e.g., Sabotage Lights, Terminal Freeze, Comms Blackout)
   - `admin_users` (Facilitator accounts)
2. Log into the Admin Console (`frontend/index.html`) using a facilitator account.
3. Perform any allocation or power configuration. Changes will synchronize to your Supabase tables in real time.
