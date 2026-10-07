# System Architecture & Design

The **NEXUS Among Us Dashboard** is built as an enterprise-grade real-time web application designed to orchestrate two parallel competitive club flagship events:
1. **Coded Chaos** (Interactive Among Us-themed physical/digital station competition with sector rooms, individual squads, 3-port Impostor powers, and sabotage countermeasures)
2. **Tech Mystery** (Forensic detective riddles, cipher decryptions, and evidence dossiers)

For an exhaustive technical deep-dive and backend handoff specifications, see [`docs/ARCHITECTURE_AND_INTEGRATION_GUIDE.md`](./ARCHITECTURE_AND_INTEGRATION_GUIDE.md).

---

## 🏛 High-Level Architecture

```
                    +-------------------------------------------------------+
                    |           Client Terminals & Operations Console       |
                    |   • Admin Operations Console (AmongUsAdmin.tsx)       |
                    |   • Player Login (index2.html)                        |
                    |   • Live Player Terminal (player.html)                |
                    +---------------------------+---------------------------+
                                                |
                                    HTTP / REST | WebSocket / Supabase Realtime
                                                v
                    +-------------------------------------------------------+
                    |                 Node.js + Express API                 |
                    |               & Supabase Cloud Database               |
                    +---------------------------+---------------------------+
                                                |
                            +-------------------+-------------------+
                            |                                       |
                            v                                       v
                 +--------------------+                   +--------------------+
                 | In-Memory Session  |                   | Supabase Storage   |
                 |   & Room Manager   |                   | (Teams, Rooms,     |
                 |  (Active Effects)  |                   |  Powers & Logs)    |
                 +--------------------+                   +--------------------+
```

---

## 📁 Repository Structure

```
Nexus-Among-Us-Dashboard/
├── backend/
│   ├── src/
│   │   ├── config/           # Supabase service role client
│   │   ├── controllers/      # Route request/response logic
│   │   ├── models/           # Data models & initial state
│   │   ├── routes/           # REST endpoints
│   │   ├── services/         # Game logic, state transitions, scoring
│   │   ├── sockets/          # Socket.io handlers & broadcast triggers
│   │   └── index.ts          # Server entrypoint
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/               # Static assets & favicons
│   ├── src/
│   │   ├── components/       # HUD widgets, modals, radars, feeds
│   │   ├── context/          # Admin auth & socket state providers
│   │   ├── lib/              # AllocationDatabase, Supabase client
│   │   ├── pages/            # Admin Console (AmongUsAdmin.tsx), Hub, Mystery
│   │   ├── types/            # TypeScript interfaces
│   │   └── main.tsx
│   ├── index.html            # Main administrative entry point
│   ├── index2.html           # Player credentials login gateway
│   ├── player.html           # Station terminal for players ("To be made by backend team")
│   ├── package.json
│   └── vite.config.ts
├── supabase/
│   └── schema.sql            # Unified DDL, RLS policies, seeds & realtime publication
├── docs/                     # Specifications and architectural guides
└── .github/                  # CI/CD and contribution templates
```

---

## ⚡ Core Operational Features

1. **Dynamic Sector Rooms & Zones**: Physical sector rooms (`Room 1`, `Room 2`, etc.) grouped into operational zones with dedicated Points of Contact (POCs).
2. **Individual Squads & Player Rosters**: Each team has a unique code (`NX-T1`...) with individual player records, contact details, and sector room inheritance.
3. **Room Allocation**: Drag & drop assignment, manual reallocations, and round-robin auto-allotment across active sectors.
4. **Impostor Allotment Engine**: Exactly 1 team per sector room is designated as the covert Impostor squad via cryptographically secure random roll or manual Admin override.
5. **3-Port Impostor Power System**: Impostors possess 3 customizable power ports (e.g. *Sabotage Lights*, *Terminal Freeze*, *Comms Blackout*) with real-time target selection, cooldowns, and admin controls (Pause, Resume, Change, Clear, Reset CD).
6. **Hostile Effect Pipeline**: Targeted strikes freeze and lock victim squad terminals with visual warning banners and live countdowns.
7. **Telemetry & Audit Logs**: High-resolution event logging tracking impostor appointments, power activations, and system state.

---

## 🛡 Security & Resilience

- **Zero Hardcoded Data**: All users, powers, rooms, and teams are dynamically managed in Supabase PostgreSQL.
- **Fail-Safe Offline Mode**: Client state caches locally in `AllocationDatabase` and syncs asynchronously to Supabase.
- **Role-Based Access Control**: `super_admin`, `admin`, and `moderator` permissions protect administrative capabilities.
- **CORS Configured**: Restricted to permitted origin(s) in production.
