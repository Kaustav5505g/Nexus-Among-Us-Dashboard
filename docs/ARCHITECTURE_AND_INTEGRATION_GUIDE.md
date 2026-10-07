# NEXUS Among Us Dashboard • Architecture & Integration Guide

**Document Version**: 2.0.0
**Target Audience**: Nexus Technical Leads, Full-Stack Developers, Backend Game Engineers, DevOps
**Maintainers**: `@Tejas-Narula`, `@synthreaper`

---

## 1. Executive System Overview

The **NEXUS Among Us Dashboard** is an enterprise-grade real-time system designed to run a hybrid digital/physical station mystery event (*Coded Chaos* and *Tech Mystery*). The system coordinates hundreds of participants divided into squads, allocated across physical sector rooms (e.g., *Room 1*, *Room 2*, *Reactor*, *Electrical*, *Cafeteria*, etc.) grouped into operational zones (*Zone A*, *Zone B*, etc.).

Key operational tenets:
1. **Zero Hardcoded Data**: All users, administrators, sector rooms, teams, player rosters, powers, and logs are completely dynamic. They are managed through Supabase PostgreSQL and synced reactively with client storage.
2. **Robust Fault Tolerance**: The dashboard utilizes a dual-tier persistence layer. High-frequency UI interactions execute instantly against an optimized local client cache (`AllocationDatabase`) while syncing asynchronously to Supabase. Even in the event of venue network degradation, the admin panel and terminals remain operational without crashing.
3. **Impostor Allotment & 3-Port Power Mechanics**: In every sector room, exactly one team is designated as the covert Impostor team—either via cryptographically secure random selection or manual Admin override. Impostor teams possess **3 customizable power ports** that trigger hostile station disruptions (e.g., *Sabotage Lights*, *Terminal Freeze*, *Comms Blackout*) with real-time target selection and countdown locks on victim terminals.
4. **Backend Team Handoff Architecture**: The player terminal (`frontend/player.html`) serves as an authenticated station client displaying role detection, hostile threat status, and power triggers, with the live interactive multiplayer game engines designed for implementation by the backend team.

---

## 2. High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------------------------+
|                                      OPERATIONS LAYER (FRONTEND)                                  |
|                                                                                                   |
|  +---------------------------+   +---------------------------+   +-----------------------------+  |
|  | Admin Operations Console  |   |    Player Login Portal    |   |   Live Player Terminal      |  |
|  |  (frontend/index.html /   |   |   (frontend/index2.html)  |   |   (frontend/player.html)    |  |
|  |     AmongUsAdmin.tsx)     |   +-------------+-------------+   +--------------+--------------+  |
|  +-------------+-------------+                 |                                |                 |
|                |                               | Team Code & Credentials       |                 |
|                |                               v                                | Hostile Effects |
|                |                   +-------------------------+                  | & Power Actions |
|                |                   | Local Session Storage   |                  |                 |
|                |                   | (Authenticated Squad)   |                  |                 |
|                |                   +-------------+-----------+                  |                 |
|                |                                 |                              |                 |
|                v                                 v                              v                 |
|  +---------------------------------------------------------------------------------------------+  |
|  |                               AllocationDatabase (Local State Engine)                       |  |
|  |  - Reactive Cache: Rooms, Teams, Players, Power Ports, Active Effects, Staff, Activity Logs|  |
|  +-----------------------------------------------+---------------------------------------------+  |
+--------------------------------------------------|------------------------------------------------+
                                                   |
                                                   | Asynchronous Non-Blocking Sync
                                                   v
+---------------------------------------------------------------------------------------------------+
|                                     DATA & BACKEND PLATFORM                                      |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  |                              Supabase PostgreSQL Cloud Database                             |  |
|  |                                                                                             |  |
|  |  +-----------------------+  +-----------------------+  +---------------------------------+  |  |
|  |  |     public.rooms      |  |     public.teams      |  |      public.powers_library      |  |  |
|  |  +-----------------------+  +-----------------------+  +---------------------------------+  |  |
|  |  |   public.admin_users  |  | public.activity_logs  |  | public.station_tasks / clues    |  |  |
|  |  +-----------------------+  +-----------------------+  +---------------------------------+  |  |
|  |                                                                                             |  |
|  |           RLS Security • Realtime Publication (`supabase_realtime`) • B-Tree Indexes        |  |
|  +-----------------------------------------------+---------------------------------------------+  |
|                                                  |                                                |
|                                                  v                                                |
|  +---------------------------------------------------------------------------------------------+  |
|  |                         Node.js / Express Game API & Socket.IO Engine                       |  |
|  |                   (To be expanded by Backend Team for Multiplayer Logic)                    |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Core Subsystems & Operational Workflows

### 3.1 Authentication & Role-Based Access Control (RBAC)

All staff credentials and permission scopes are stored in `public.admin_users`:

| Role | Permissions & Privileges |
|---|---|
| `super_admin` (Master Admin) | Full administrative access: create/edit/delete rooms, create/import teams, edit player rosters, allot rooms, roll/override Impostors, configure 3 power ports, pause/resume/delete powers, manage staff accounts (create sub-admins and moderators), view and clear telemetry logs. |
| `admin` (Station Admin) | Operational access: room allotment, team management, player rosters, roll/override Impostors, trigger and manage power ports, view logs. Cannot delete or alter master administrator accounts. |
| `moderator` (Sector POC) | Field coordinator access: view allocated rooms and squads, verify tasks, report incident logs, view team rosters for their assigned physical sector room. |

#### Database Representation (`admin_users`)
- `id` (UUID)
- `facilitator_id` (TEXT, unique e.g., `NX-SUPER-01`)
- `username` (TEXT, unique)
- `name` (TEXT)
- `email` (TEXT)
- `role` (TEXT: `super_admin` | `admin` | `moderator`)
- `title` (TEXT, e.g. "Lead Operations Facilitator")
- `password_hash` (TEXT)
- `poc_room` (TEXT, optional room assignment)

---

### 3.2 Sector Rooms & Zone Architecture

Physical gameplay spaces are mapped dynamically in `public.rooms`:
- **ID & Nomenclature**: e.g., `room-1` ("Room 1"), `room-2` ("Room 2"), `room-react` ("Reactor Core").
- **Zone Clustering**: Rooms belong to operational zones (e.g., `Zone A`, `Zone B`, `Tech Wing`) for coordinated lighting or power sabotages.
- **Capacity Controls**: Each room tracks capacity (e.g., 20 players) with live occupancy counters calculated by summing assigned squad members.
- **Dedicated Point of Contact (POC)**: Each room record stores `poc_name`, `poc_contact` (phone), `poc_email`, and `notes`.

When a room's name or zone is modified in the Admin Console, the change automatically cascades to all teams and players currently allocated to that room.

---

### 3.3 Teams & Player Roster Structure

Teams are distinct individual squads (not pre-grouped factions). Each team possesses:
- **`team_code`**: Unique identifier (e.g., `NX-T1`, `NX-T2`, `NX-T3`).
- **`name`**: Squad designation (e.g., *Cyber Crew*, *Quantum Phantoms*).
- **`leader_name`**, **`phone`**, **`email`**: Contact information for team coordination.
- **`members` & `memberDetails`**: An array of individual player records (`PlayerMember`):
  ```typescript
  interface PlayerMember {
    id: string;
    name: string;
    regNo?: string;
    phone?: string;
    email?: string;
    isLeader?: boolean;
    assignedRoomId?: string;
    assignedRoomName?: string;
    assignedZone?: string;
  }
  ```
- **Room Inheritance**: By default, team members inherit the room assignment of their parent team. Admin facilitators can also reallocate individual members to different sector rooms if squad members are deployed on separate station missions.

---

### 3.4 Room Allocation Engine

The Admin Panel (`AmongUsAdmin.tsx`) provides three room allocation mechanisms:
1. **Direct Drag / Drop & Dropdown Assignment**: Facilitators can assign any team to any room instantly via room selector dropdowns on team cards.
2. **Auto-Allotment Algorithm (`autoAllotUnassignedTeams`)**: Evenly distributes all unassigned teams across available active rooms in round-robin sequence to ensure balanced player loads across physical sectors.
3. **Allocation Reset (`resetAllAllocations`)**: Unbinds all teams and players from rooms with a single confirmation, resetting state for new event rounds.

---

### 3.5 Impostor Allotment Engine

In each sector room, teams compete in a local sub-arena. The system ensures that exactly one team per room is designated as the covert Impostor squad:
1. **Cryptographic Random Roll (`rollRandomImpostorInRoom`)**:
   - Uses `window.crypto.getRandomValues` to generate cryptographically unbiased randomness.
   - Selects one team from all squads assigned to the target room.
   - Designates the selected team as `isImpostor: true` and initializes its 3 Power Ports.
   - Automatically sets all other teams in the same room to `isImpostor: false`.
   - Logs an audit event with severity `danger`.
2. **Admin Custom Override (`handleSelectRoomImpostor`)**:
   - The facilitator can manually select any specific squad from the room's dropdown to be the Impostor.
   - Setting a team as Impostor automatically demotes any previous Impostor team in that room back to Crewmate status.
   - The option "All Crewmates (No Impostor)" resets the room to clean status.

---

### 3.6 The 3-Port Impostor Power System

Impostor squads have access to **3 distinct Power Ports** (`port: 1 | 2 | 3`). These ports are synchronized across the database and displayed on both the Admin Console and the Player Terminal:

```typescript
interface ImpostorPowerPort {
  port: 1 | 2 | 3;
  id: string;
  name: string;
  description: string;
  cooldownSeconds: number;
  durationSeconds?: number;
  lastUsedTimestamp?: number;
  status: 'ready' | 'cooldown' | 'paused' | 'disabled';
  targetRequired: boolean;
}
```

#### Standard Powers Library (`public.powers_library`)
- **Sabotage Lights** (`sabotage-lights`): Kills sector lighting; room-wide disruption (no single target required). 30s Cooldown, 20s Duration.
- **Terminal Freeze** (`terminal-freeze`): Freezes the target crewmate team terminal, disabling all actions. 45s Cooldown, 30s Duration. Target required.
- **Comms Blackout** (`comms-blackout`): Disrupts radio signals and clue deciphering for target crewmate team. 40s Cooldown, 25s Duration. Target required.
- **Door Lockdown** (`door-lockdown`): Seals sector doors and restricts room movement for target crewmates. 60s Cooldown, 35s Duration. Target required.
- **Fake Clue Inject** (`fake-clue-inject`): Injects corrupted forensic clues to misdirect target detectives. 35s Cooldown, 20s Duration. Target required.
- **Radio Jammer** (`radio-jammer`): Jams coordinator hotline and emergency beacon for target team. 50s Cooldown, 30s Duration. Target required.

#### Admin Real-Time Power Controls
Facilitators possess total control over Impostor power ports directly from the room cards in the Admin Panel:
1. **Pause / Resume Port**: Freezes an individual port's readiness (`status: 'paused'`), preventing the Impostor from triggering it.
2. **Change / Reconfigure Port**: Opens the *Configure Power Port* modal. Facilitators can swap the port's ability to any library preset or create a completely custom power on the fly with custom cooldown, duration, and targeting requirements.
3. **Delete / Clear Port**: Clears the port (`status: 'disabled'`), restricting the Impostor to remaining ports.
4. **Reset Cooldowns**: Instantly sets all 3 ports back to `ready` status with 0s remaining cooldown.

---

### 3.7 Target Selection & Hostile Effect Pipeline

When an Impostor team activates a targeted power from their terminal (`frontend/player.html`):
1. **Target Identification**: The system queries all other teams assigned to the same sector room (`assignedRoomId === impostor.assignedRoomId && teamId !== impostor.id`).
2. **Target Modal**: A selection modal prompts the Impostor: `"⚡ TARGET CREWMATE: Select squad in [Room Name]"`.
3. **Effect Dispatch**: Upon selection, `useImpostorPowerWithTarget()` executes:
   - Sets the Impostor's port to `status: 'cooldown'` with `lastUsedTimestamp = Date.now()`.
   - Appends a `TeamActiveEffect` to the target team's `activeEffects` array:
     ```typescript
     interface TeamActiveEffect {
       id: string;
       powerName: string;
       description: string;
       appliedAt: number;
       expiresAt: number;
       sourceTeamName: string;
     }
     ```
   - Emits an activity log item linking the Impostor squad, victim squad, and sector room.
4. **Victim Reaction**: On the victim squad's terminal (`player.html`), the **Hostile Alert Banner** triggers:
   - Visual pulsing warning: `⚠️ HOSTILE IMPOSTOR POWER ACTIVE`.
   - Displays the attacking power name, description, and dynamic real-time countdown timer (`00:XX Remaining`).
   - Disables station actions until the effect expires.

---

## 4. Supabase Cloud Database Architecture

The entire cloud database schema is consolidated in [`supabase/schema.sql`](../supabase/schema.sql).

### Key Tables & Columns

#### 1. `public.teams`
```sql
CREATE TABLE public.teams (
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
    assigned_room TEXT DEFAULT 'Room 1',
    is_impostor BOOLEAN DEFAULT false,
    impostor_player_name TEXT,
    team_code TEXT UNIQUE,
    assigned_room_id TEXT,
    assigned_room_name TEXT,
    assigned_zone TEXT,
    power_ports JSONB DEFAULT '[]'::jsonb,
    active_effects JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. `public.rooms`
```sql
CREATE TABLE public.rooms (
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
```

#### 3. `public.powers_library`
```sql
CREATE TABLE public.powers_library (
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
```

#### 4. `public.admin_users`
```sql
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facilitator_id TEXT UNIQUE,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator')),
    password_hash TEXT,
    title TEXT,
    poc_room TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. `public.activity_logs`
```sql
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('task', 'sabotage', 'emergency', 'clue', 'kill', 'system', 'admin', 'power', 'impostor_assign', 'login')),
    message TEXT NOT NULL,
    team_name TEXT,
    team_id TEXT,
    target_team_id TEXT,
    target_team_name TEXT,
    room_name TEXT,
    power_name TEXT,
    port_index INT,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'danger', 'success')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Backend Team Handoff & Implementation Blueprint

### 5.1 Objectives for the Backend Team

The frontend and administrative infrastructure are complete:
- Admin panel enables dynamic team/room creation, role roll/override, and power port management.
- Player login (`index2.html`) routes teams to the Player Terminal (`player.html`).
- The player terminal displays role authentication (`IMPOSTOR` vs `CREWMATE`), 3-port power triggering, target selection, hostile effects, and carries the banner:
  > **"To be made by backend team"**

The backend team is tasked with building the **interactive multiplayer game engine** that executes the match mechanics when players sit at their terminals.

### 5.2 Required Backend Components

```
backend/src/
├── controllers/
│   ├── matchController.ts      # Match start, phase transitions, victory checks
│   ├── impostorController.ts   # Power validation, cooldown timer verification, target lock
│   ├── taskController.ts       # Physical/digital task completion verification & QR codes
│   └── meetingController.ts    # Emergency button siren, voting round, ejection logic
├── models/
│   └── ...                     # TypeScript interfaces aligned with schema.sql
├── services/
│   ├── matchEngine.ts          # Match state machine (Lobby -> Running -> Meeting -> Ended)
│   └── powerEngine.ts          # Cooldown countdowns and server-side effect dispatch
├── sockets/
│   ├── matchSocket.ts          # Realtime WebSocket channels
│   └── ...
└── index.ts
```

### 5.3 Realtime Event Specifications

| WebSocket / Channel Event | Direction | Payload | Description |
|---|---|---|---|
| `power:activate` | Client -> Server | `{ teamId, port, targetTeamId }` | Impostor triggers a power. Server validates cooldown, applies effect, emits log, broadcasts update. |
| `power:effect_applied` | Server -> Broadcast | `{ targetTeamId, effect }` | Pushes hostile effect to victim client terminal with active countdown. |
| `power:effect_cleared` | Server -> Broadcast | `{ targetTeamId, effectId }` | Removes hostile effect when duration expires. |
| `task:submit` | Client -> Server | `{ teamId, taskId, proofCode }` | Submits task completion for validation and point increment. |
| `emergency:trigger` | Client -> Server | `{ callerTeamId, reason }` | Initiates Emergency Meeting siren, suspends powers, and starts debate countdown. |
| `emergency:vote` | Client -> Server | `{ voterTeamId, suspectedTeamId }` | Submits team vote for ejection during emergency meeting. |

### 5.4 Anti-Cheat & Server-Side Validation Rules
1. **Cooldown Enforcement**: Validate `Date.now() >= lastUsedTimestamp + cooldownSeconds * 1000` before authorizing power execution.
2. **Role Verification**: Confirm that `team.isImpostor === true` in database session before permitting `power:activate`.
3. **Room Proximity Validation**: Ensure `targetTeam.assignedRoomId === impostorTeam.assignedRoomId`. An Impostor cannot strike a crewmate team in a different physical sector.
4. **Action Lockout**: When a team has an active effect in `active_effects` where `expiresAt > Date.now()`, reject any `task:submit` requests.

---

## 6. Verification & Troubleshooting

### Local Cache Reset
If an administrator wishes to wipe local test state and repopulate cleanly from Supabase:
```javascript
// Run in browser DevTools Console on Admin page:
localStorage.clear();
location.reload();
```
Upon reload, `AllocationDatabase.syncAllFromSupabase()` automatically re-fetches canonical records from Supabase PostgreSQL.

### Verifying Build Integrity
Always confirm frontend and backend builds pass cleanly before committing changes:
```powershell
npm --prefix frontend run build
npm --prefix backend run build
```
