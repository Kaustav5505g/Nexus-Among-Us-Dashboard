# System Architecture & Design

The **NEXUS Among Us Dashboard** is built as an enterprise-grade real-time web application designed to orchestrate two parallel competitive club events:
1. **Coded Chaos** (Interactive Among Us-themed physical/digital competition with tasks, sabotages, and impostors)
2. **Tech Mystery** (Forensic detective riddles, cipher decryptions, and evidence dossier)

---

## 🏛 High-Level Architecture

```
                   +-----------------------------------+
                   |   Client Browser (Spectator/Host) |
                   +-----------------+-----------------+
                                     |
                         HTTP / REST | WebSocket (Socket.io)
                                     v
                   +-----------------------------------+
                   |       Node.js + Express API       |
                   |      Real-Time Game Engine        |
                   +-----------------+-----------------+
                                     |
                 +-------------------+-------------------+
                 |                                       |
                 v                                       v
      +--------------------+                   +--------------------+
      | In-Memory Session  |                   | Event State Store  |
      |   & Room Manager   |                   |  (Teams & Scores)  |
      +--------------------+                   +--------------------+
```

---

## 📁 Repository Structure

```
Nexus-Among-Us-Dashboard/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route request/response logic
│   │   ├── models/           # Data models & initial state
│   │   ├── routes/           # REST endpoints
│   │   ├── services/         # Game logic, state transitions, scoring
│   │   ├── sockets/          # Socket.io handlers & broadcast triggers
│   │   └── index.ts          # Server entrypoint
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/       # HUD widgets, modals, radars, feeds
│   │   ├── context/          # Socket.io provider & live state hook
│   │   ├── pages/            # Views (Arena, Mystery, Leaderboard, Admin, Reg)
│   │   ├── types/            # TypeScript interfaces
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── docs/                     # Specifications and guides
└── .github/                  # CI/CD and contribution templates
```

---

## ⚡ Real-Time WebSocket Protocol

The backend maintains bidirectional communication via Socket.io for immediate state propagation:

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `game:state` | Server -> Client | Full GameState | Initial state synchronization upon connect |
| `task:complete` | Client -> Server | `{ taskId, teamId }` | Marks a crewmate task as completed |
| `sabotage:trigger` | Admin -> Server -> Broadcast | `{ type, message, duration }` | Triggers alarms (Lights, O2, Reactor) |
| `sabotage:resolve` | Admin/Client -> Broadcast | `{ type }` | Resolves the ongoing sabotage |
| `emergency:call` | Client/Admin -> Broadcast | `{ caller, reason }` | Initiates Emergency Meeting siren & modal |
| `emergency:end` | Admin -> Broadcast | `{}` | Ends the emergency meeting |
| `mystery:solve` | Client -> Server | `{ clueId, teamId, answer }` | Submits forensic decryption key |
| `score:update` | Server -> Broadcast | Array of Teams | Real-time leaderboard re-ranking |

---

## 🛡 Security & Resilience

- **CORS Configured**: Restricted to permitted origin(s) in production.
- **Fail-safe In-Memory Persistence**: Graceful fallback data with deterministic state recovery.
- **Input Validation**: Schema sanity checks for team signups and game actions.
