# REST & WebSocket API Specification

**Base URL**: `http://localhost:5000/api`
**Reference Document**: [`docs/ARCHITECTURE_AND_INTEGRATION_GUIDE.md`](./ARCHITECTURE_AND_INTEGRATION_GUIDE.md)

---

## 📡 REST Endpoints

### 1. System Health & Environment
- **`GET /api/health`**
  - Returns server status, active connections, and database sync status.
  - Response:
    ```json
    {
      "status": "online",
      "timestamp": "2026-10-06T00:00:00.000Z",
      "database": "connected",
      "activeTeams": 12,
      "activeRooms": 6
    }
    ```

---

### 2. Sector Rooms & Zones
- **`GET /api/rooms`**
  - Retrieves all active sector rooms, zones, capacities, and assigned POCs.
- **`POST /api/rooms`**
  - Creates a new sector room.
  - Body: `{ "name": "Room 7", "zone": "Zone C", "capacity": 20, "pocName": "Alex", "pocContact": "9876543210" }`
- **`PUT /api/rooms/:id`**
  - Updates room name, zone, capacity, or POC info. Automatically updates allocated teams.
- **`DELETE /api/rooms/:id`**
  - Removes a sector room and unallocates assigned squads.

---

### 3. Teams & Player Rosters
- **`GET /api/teams`**
  - Returns all registered squads, room assignments, impostor designations, and active effects.
- **`POST /api/teams`**
  - Registers/creates a team squad with player roster.
  - Body:
    ```json
    {
      "name": "Cyber Crew",
      "leaderName": "Alex Vance",
      "email": "alex@nexus.org",
      "phone": "+91 98765 43210",
      "playerList": [
        { "name": "Alex Vance", "regNo": "23BCE1001", "phone": "+91 98765 43210" },
        { "name": "Jordan Lee", "regNo": "23BCE1002" }
      ]
    }
    ```
- **`PUT /api/teams/:id/room`**
  - Reallocates a team to a target room.
  - Body: `{ "roomId": "room-1" }`
- **`POST /api/teams/auto-allot`**
  - Distributes all unallocated teams evenly across active rooms.

---

### 4. Impostor Allotment & 3-Port Powers
- **`POST /api/rooms/:id/impostor/roll`**
  - Cryptographically rolls a random Impostor squad from teams in the specified room.
- **`PUT /api/rooms/:id/impostor/override`**
  - Manually designates a specific squad in the room as the Impostor.
  - Body: `{ "teamId": "team-1" }`
- **`GET /api/powers/library`**
  - Fetches the standard library of Impostor powers.
- **`PUT /api/teams/:id/powers/:port`**
  - Configures power on port 1, 2, or 3 (name, cooldown, duration, target requirement).
- **`POST /api/teams/:id/powers/:port/pause`**
  - Pauses or resumes an Impostor power port.
  - Body: `{ "paused": true }`
- **`POST /api/teams/:id/powers/:port/use`**
  - Triggers an Impostor power. If targeted, applies hostile effect to `targetTeamId`.
  - Body: `{ "targetTeamId": "team-2" }`

---

### 5. Staff Administration & RBAC
- **`POST /api/admin/login`**
  - Authenticates staff member credentials against `public.admin_users`.
- **`GET /api/admin/users`**
  - Lists facilitator accounts (Master Admin only).
- **`POST /api/admin/users`**
  - Creates a new sub-admin or moderator account.

---

### 6. Activity & Telemetry Logs
- **`GET /api/logs`**
  - Retrieves activity audit logs with filtering by severity or action type.
- **`DELETE /api/logs`**
  - Clears activity logs (Master Admin only).

---

## ⚡ WebSocket / Realtime Protocol

| Channel / Event | Direction | Payload | Description |
|---|---|---|---|
| `power:activate` | Client -> Server | `{ teamId, port, targetTeamId }` | Impostor triggers power port |
| `power:hostile_effect` | Server -> Broadcast | `{ targetTeamId, effect }` | Pushes hostile banner and action lock to victim terminal |
| `room:allotment_changed` | Server -> Broadcast | `{ roomId, teams }` | Notifies clients of room reallocations |
| `impostor:designated` | Server -> Broadcast | `{ roomId, impostorTeamId }` | Notifies room of Impostor designation |
