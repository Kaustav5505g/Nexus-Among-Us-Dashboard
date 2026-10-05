# 🚀 NEXUS Among Us Dashboard

<div align="center">

![NEXUS Banner](https://img.shields.io/badge/NEXUS-Club%20Event-red?style=for-the-badge&logo=target)
![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18-cyan?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)
![Socket.io](https://img.shields.io/badge/Socket.IO-Realtime-black?style=for-the-badge&logo=socketdotio)
![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)

<br/>

### 🚨 **NEXUS IS BRINGING THE CHAOS!** 🚨
**Ready to put your brains, instincts & detective skills to the test? 👀🔥**

[🕹️ Coded Chaos Registration](https://tinyurl.com/bdfp2emu) • [🕵🏻‍♀️ Tech Mystery Registration](https://tinyurl.com/45sbus6m) • [Contributing Guide](./CONTRIBUTING.md) • [Git Workflow](./docs/GIT_WORKFLOW.md)

</div>

---

## 🎁 Special Event Announcement

> ### 🎁 **REGISTER FOR ONE EVENT & GET THE SECOND EVENT ABSOLUTELY FREE!** 🎁
>
> **Yes, you read that right. ONE REGISTRATION = TWO EVENTS! 🤯🔥**
> 
> So grab your team, register NOW and get ready for a day full of chaos, clues, challenges & competition!
> 
> 📌 **Don’t miss out. Register now!**  
> ⚡ **Two events. One registration. Double the fun.** ⚡

| Event | Focus | Registration Link |
|---|---|---|
| 🕹️ **CODED CHAOS** | *Among Us: Coded Chaos* — Physical & digital station tasks, sabotages, and impostor deduction | [Register Here](https://tinyurl.com/bdfp2emu) |
| 🕵🏻‍♀️ **TECH MYSTERY** | *Can you crack the mystery?* — Forensic riddles, cipher decoders, and digital evidence cases | [Register Here](https://tinyurl.com/45sbus6m) |

---

## 📖 Overview

The **NEXUS Among Us Dashboard** is an enterprise-grade real-time web platform engineered by the **NEXUS Club** to orchestrate two simultaneous competitive club flagship events:
1. **Coded Chaos (Among Us Arena)**: Real-time station map, task matrix, sabotage alarms (Reactor Meltdown, Oxygen Depletion, Lights), and emergency meeting voting protocol.
2. **Tech Mystery (Detective Arena)**: Evidence dossier, forensic terminal, cipher flag verification (ROT13, Base64, Hexadecimal, Binary).
3. **Live Spectator & Leaderboard Hub**: Low-latency WebSocket synchronization between players, spectator projectors, and Game Master facilitators.

---

## 📂 Repository Structure

This repository is structured as a monorepo configured for seamless multi-developer club collaboration:

```
Nexus-Among-Us-Dashboard/
├── .github/                      # GitHub Collaboration & Automation
│   ├── workflows/ci.yml          # GitHub Actions CI build & verification
│   ├── ISSUE_TEMPLATE/           # Structured bug, feature, and task templates
│   │   ├── bug_report.yml
│   │   ├── feature_request.yml
│   │   └── task_assignment.yml   # Template for assigning modules to club members
│   ├── PULL_REQUEST_TEMPLATE.md  # Standardized PR checklist
│   └── CODEOWNERS                # Sub-team code ownership routing
├── backend/                      # Node.js + Express + TypeScript + Socket.IO
│   ├── src/
│   │   ├── controllers/          # Route business logic (teams, game, mystery, admin)
│   │   ├── models/               # TypeScript interfaces & initial match mock data
│   │   ├── routes/               # Express REST route endpoints
│   │   ├── services/             # Game engine, sabotage alarms, scoring
│   │   ├── sockets/              # Socket.IO client/server event handlers
│   │   └── index.ts              # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/                     # React 18 + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/           # UI components, modals, HUD widgets
│   │   ├── pages/                # Views (Arena, Mystery, Hub, Leaderboard)
│   │   ├── types/                # Shared frontend TypeScript interfaces
│   │   ├── App.tsx               # Main application routing & event hub
│   │   └── main.tsx              # React mounting root
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docs/                         # Team Documentation & Playbooks
│   ├── ARCHITECTURE.md           # System design & WebSocket event protocol
│   ├── API_SPECS.md              # REST & WebSocket endpoint specifications
│   ├── GAME_RULES.md             # Official competition rules & scoring formula
│   ├── GIT_WORKFLOW.md           # Multi-user git branching & contribution guide
│   ├── TASK_BOARD.md             # Module tracking & developer task distribution
│   └── EVENT_INFO.md             # NEXUS promotional kit & links
├── docker-compose.yml            # Multi-container Docker orchestration
├── CONTRIBUTING.md               # Club contributor guidelines
├── CODE_OF_CONDUCT.md           # Contributor Covenant v2.1
├── SECURITY.md                   # Security vulnerability reporting
├── LICENSE                       # MIT License
└── package.json                  # Root runner script for frontend + backend
```

---

## 👥 Multi-User Collaboration Guide

To ensure everyone can develop smoothly without merge conflicts or overlapping code:

1. **Read the Guides**:
   - Check [GIT_WORKFLOW.md](./docs/GIT_WORKFLOW.md) for branch naming (`feat/frontend-...`, `feat/backend-...`).
   - Check [TASK_BOARD.md](./docs/TASK_BOARD.md) to claim an unassigned task.
2. **Never push directly to `main`**:
   - Always branch off `main`: `git checkout -b feat/your-feature`
   - Keep commits descriptive: `feat(frontend): add sabotage alarm HUD`
3. **Submit a Pull Request**:
   - Push to your branch and open a PR using the [Pull Request Template](./.github/PULL_REQUEST_TEMPLATE.md).
   - Tag reviewers from the team.

---

## ⚡ Quickstart & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Tejas-Narula/Nexus-Among-Us-Dashboard.git
cd Nexus-Among-Us-Dashboard
```

### 2. Install All Dependencies
Install dependencies across root, backend, and frontend with a single command:
```bash
npm run install:all
```

### 3. Configure Environment Variables
Copy the sample environment files:
```bash
# Backend configuration
cp backend/.env.example backend/.env

# Frontend configuration
cp frontend/.env.example frontend/.env
```

### 4. Run Development Servers Concurrently
Start both the Express backend (`http://localhost:5000`) and Vite frontend (`http://localhost:5173`) together:
```bash
npm run dev
```

Alternatively, you can run services individually:
```bash
# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend
```

---

## 🐳 Docker Deployment

To spin up the entire production stack (Frontend + Backend) with Docker:
```bash
docker-compose up --build
```
- Access Frontend: `http://localhost:5173`
- Access Backend API: `http://localhost:5000/api/health`

---

## 📡 Core API Summary

Detailed specifications are available in [API_SPECS.md](./docs/API_SPECS.md).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service uptime and health diagnostics |
| `GET` | `/api/teams` | Retrieve leaderboard and registered squads |
| `POST` | `/api/teams/register` | Register squad for bundled dual-event pass |
| `GET` | `/api/game/state` | Current match state, tasks, sabotage status |
| `POST` | `/api/game/tasks/:id/complete` | Mark station task complete |
| `POST` | `/api/game/emergency` | Trigger Emergency Meeting siren |
| `GET` | `/api/mystery/clues` | Retrieve Tech Mystery forensic case dossiers |
| `POST` | `/api/mystery/verify` | Submit decrypted cipher flag |
| `POST` | `/api/admin/sabotage` | Trigger or resolve sabotage (Reactor/O2/Lights/Comms) |

---

## 🛡️ License & Credits

- Built by the **NEXUS Club Core Technical Team** for the 2026 NEXUS Annual Tech Fest.
- Released under the [MIT License](./LICENSE).
