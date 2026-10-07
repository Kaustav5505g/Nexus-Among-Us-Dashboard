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

## 2. Execute the Database Schema and Feature Migration

For a new Supabase project, run the complete schema. If you already have a project, run the rooms and powers migration after the base schema to add the newer admin allocation and power features.

1. In your Supabase Project Dashboard, click on the **SQL Editor** icon in the left navigation sidebar.
2. Click **New query**.
3. Open [`supabase/schema.sql`](../supabase/schema.sql) from this repository, copy its entire contents, and paste it into the SQL Editor.
4. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).
   - Provisions the teams, rooms, powers library, event controls, task, clue, sabotage, emergency, admin, and activity log tables used by the application.
   - Automatically enables UUID extension and performance indexes.
   - Automatically sets up Row Level Security (RLS) policies.
   - Automatically attaches tables to `supabase_realtime` publication.
   - Seeds station tasks, room definitions, powers, and facilitator profiles.
5. For an existing database, also run [`supabase/migrations/20261007000000_add_rooms_and_powers.sql`](../supabase/migrations/20261007000000_add_rooms_and_powers.sql).

---

## 3. Retrieve API Credentials

1. Go to **Project Settings** (gear icon) -> **API**.
2. Under **Project URL**, copy the URL (e.g. `https://your-ref.supabase.co`).
3. Under **Project API keys**:
   - Copy the `anon` `public` key (for frontend).
   - Copy the `service_role` `secret` key (for backend admin operations — *never expose in frontend*).

---

## 4. Configure Local & Production Environment

Create the repository-root `.env` from `.env.example`. The backend reads `SUPABASE_URL` and `SUPABASE_ANON_KEY` (or a server-only `SUPABASE_SERVICE_ROLE_KEY`). Vite reads the `VITE_`-prefixed values from the same root file:

```env
SUPABASE_URL=https://your-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_URL=https://your-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The root `.env` is gitignored. Never expose a service-role key in frontend variables or commit credentials. For production, set the backend and frontend variables in your hosting provider's environment settings.
