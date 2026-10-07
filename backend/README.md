# NEXUS Dashboard Backend

Express + TypeScript REST & WebSocket engine powering the **NEXUS Among Us: Coded Chaos & Tech Mystery** events.

## Features
- Real-time room, task, and team synchronization via **Socket.IO**
- Sabotage engine (Lights, Reactor Meltdown, Oxygen Depletion, Communications Jammer) with countdown alarms
- Emergency Meeting siren and voting broadcast protocol
- Tech Mystery forensic case file verification & cipher decoders
- Bundled team registration & pass issuance (1 Registration = 2 Events)
- Admin / Game Master control endpoints for event facilitators

## Player portal

The player portal signs in through `POST /api/teams/login` using a Team ID
(`badge_code` or team UUID) and a player name listed in `teams.members` or
`teams.leader_name`. The portal refreshes the validated team allocation, role,
room, and `event_controls` session through `POST /api/teams/session`.

Configure `SUPABASE_URL` and either `SUPABASE_SERVICE_ROLE_KEY` or
`SUPABASE_ANON_KEY` in the backend environment. The database must have the
`teams` and `event_controls` tables from `supabase/schema.sql`, including the
`primary_match` session row. Vite proxies `/api` to the backend on port 5000 in
development; set `VITE_API_BASE_URL` when the deployed backend is hosted at a
different origin.

## Quickstart

```bash
# Install dependencies
npm install

# Start in development mode with auto-reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```
