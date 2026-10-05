# 🗄️ Setting Up Supabase for NEXUS Dashboard

Follow this guide to initialize the PostgreSQL database and real-time streaming publication on **Supabase**.

---

## 1. Create a Supabase Project

1. Navigate to [https://supabase.com](https://supabase.com) and create an account or sign in.
2. Click **New Project**.
3. Choose your Organization, enter Project Name (e.g. `nexus-among-us-dashboard`), and generate a strong database password.
4. Select the region closest to your venue/users.
5. Click **Create new project** and wait 1-2 minutes for provisioning.

---

## 2. Execute Database Schema & Realtime Setup

1. In your Supabase Project Dashboard, click on the **SQL Editor** icon in the left navigation sidebar.
2. Click **New query**.
3. Open [`supabase/schema.sql`](../supabase/schema.sql) from this repository, copy its entire contents, and paste it into the SQL Editor.
4. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).
   - This creates tables: `teams`, `station_tasks`, `mystery_clues`, `sabotage_events`, `emergency_meetings`, and `activity_logs`.
   - It sets up Row Level Security (RLS) policies for public reading and secure insertions.
   - It attaches tables to `supabase_realtime` publication.

---

## 3. Seed Initial Game & Mystery Data

1. In the **SQL Editor**, open another **New query**.
2. Open [`supabase/seed.sql`](../supabase/seed.sql) from this repository, copy and paste its contents.
3. Click **Run**.
   - Populates initial station tasks (Electrical, MedBay, Reactor, Admin, Navigation).
   - Populates initial Tech Mystery dossiers and ciphers (Binary, ROT-13, Hex dump, Base64).

---

## 4. Retrieve API Credentials

1. Go to **Project Settings** (gear icon) -> **API**.
2. Under **Project URL**, copy the URL (e.g. `https://your-ref.supabase.co`).
3. Under **Project API keys**:
   - Copy the `anon` `public` key (for frontend).
   - Copy the `service_role` `secret` key (for backend admin operations — *never expose in frontend*).

---

## 5. Configure Local & Production Environment

Add these credentials to your environment files:

### Local Development (`.env`):
```env
VITE_SUPABASE_URL=https://your-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
```

### Vercel Deployment:
Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Project Settings -> Environment Variables** in the Vercel dashboard.
