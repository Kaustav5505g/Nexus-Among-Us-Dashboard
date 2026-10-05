# REST & WebSocket API Specification

Base URL: `http://localhost:5000/api`

---

## 📡 REST Endpoints

### 1. System Health
- **`GET /api/health`**
  - Returns server uptime, active connections, and event status.
  - Response:
    ```json
    {
      "status": "online",
      "timestamp": "2026-10-06T00:00:00.000Z",
      "activeTeams": 12,
      "event": "NEXUS Coded Chaos & Tech Mystery"
    }
    ```

---

### 2. Teams & Registration
- **`GET /api/teams`**
  - Returns list of registered squads, points, and status.
- **`POST /api/teams/register`**
  - Register team with bundled access (1 registration = 2 events).
  - Body:
    ```json
    {
      "teamName": "Cyber Crew",
      "leaderName": "Alex Vance",
      "email": "alex@nexus.org",
      "phone": "+91 98765 43210",
      "members": ["Alex Vance", "Jordan Lee", "Taylor Swift", "Sam Altman"],
      "registeredEvents": ["Coded Chaos", "Tech Mystery"]
    }
    ```
- **`GET /api/teams/:id`**
  - Retrieve details, QR badge, and task log for a specific team.

---

### 3. Coded Chaos (Among Us Engine)
- **`GET /api/game/state`**
  - Returns current match state: tasks completed, sabotage status, meeting state.
- **`POST /api/game/tasks/:id/complete`**
  - Mark task complete for team, awards points.
- **`POST /api/game/emergency`**
  - Trigger emergency meeting siren.

---

### 4. Tech Mystery (Detective Arena)
- **`GET /api/mystery/clues`**
  - List available clues and forensic evidence dossier.
- **`POST /api/mystery/verify`**
  - Submit decrypted answer / flag.
  - Body:
    ```json
    {
      "teamId": "team-1",
      "clueId": "clue-03",
      "flag": "CIPHER_NEXUS_OMEGA"
    }
    ```

---

### 5. Host & Game Master Admin
- **`POST /api/admin/sabotage`**
  - Trigger or cancel sabotage (Lights, Reactor Meltdown, O2, Comms).
- **`POST /api/admin/reset`**
  - Reset match state or clear boards.
- **`POST /api/admin/broadcast`**
  - Broadcast emergency warning banner across all spectator screens.
