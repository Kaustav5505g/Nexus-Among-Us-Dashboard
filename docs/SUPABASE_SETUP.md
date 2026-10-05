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

## 2. Execute Single Unified Database Script

We have consolidated the entire database schema, security policies, real-time publication, and initial seeds into a **single canonical file**:

1. In your Supabase Project Dashboard, click on the **SQL Editor** icon in the left navigation sidebar.
2. Click **New query**.
3. Open [`supabase/schema.sql`](../supabase/schema.sql) from this repository, copy its entire contents, and paste it into the SQL Editor.
4. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).
   - Automatically provisions all tables: `teams`, `station_tasks`, `mystery_clues`, `sabotage_events`, `meeting_sessions`, `admin_users`, `audit_logs`, `player_progress`, and `activity_logs`.
   - Automatically enables UUID extension and performance indexes.
   - Automatically sets up Row Level Security (RLS) policies.
   - Automatically attaches tables to `supabase_realtime` publication.
   - Automatically seeds all station tasks, room definitions, and facilitator profiles.

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

### Local Development (`.env`):
```env
VITE_SUPABASE_URL=https://your-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
```

### Vercel Deployment:
Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Project Settings -> Environment Variables** in the Vercel dashboard.
