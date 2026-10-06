# NEXUS Project Task & Module Assignment Board

Use this board to track task distribution across club members. Team members can claim open tasks by creating a feature branch and opening an issue or PR.

---

## 🎨 Operations & Frontend Modules (`/frontend`)

| Module ID | Task Description | Priority | Assignee | Status |
|---|---|---|---|---|
| `FE-01` | **Dynamic Sector Rooms & Zones**: Dynamic room creation, capacity counters, and assigned POCs | High | Core Team | **Completed** |
| `FE-02` | **Teams & Player Roster Engine**: Individual player records, room allocation, and auto-allot | High | Core Team | **Completed** |
| `FE-03` | **Impostor Selection Engine**: Cryptographic random roll + Admin custom override per room | High | Core Team | **Completed** |
| `FE-04` | **3-Port Impostor Power Console**: Port 1/2/3 triggers, cooldown timers, and target selector modal | High | Core Team | **Completed** |
| `FE-05` | **Power Port Admin Controls**: Live pause, resume, reconfigure modal, delete, and CD reset | High | Core Team | **Completed** |
| `FE-06` | **Crewmate Hostile Alert Banner**: Real-time victim lockout notification and countdown timer | High | Core Team | **Completed** |
| `FE-07` | **Staff RBAC System**: Master Admin, Station Admin, and Field Moderator role management | High | Core Team | **Completed** |
| `FE-08` | **High-Resolution Telemetry Logs**: Audit event feed with action filtering and severity indicators | Medium | Core Team | **Completed** |
| `FE-09` | **Player Login & Terminal**: Team code authentication and terminal interface | High | Core Team | **Completed** |

---

## ⚙️ Backend Roadmap & Next Phase (`/backend`)

*See [`docs/ARCHITECTURE_AND_INTEGRATION_GUIDE.md`](./ARCHITECTURE_AND_INTEGRATION_GUIDE.md) for full implementation blueprint.*

| Module ID | Task Description | Priority | Assignee | Status |
|---|---|---|---|---|
| `BE-01` | **Interactive Crewmate Gameplay Engine**: Multi-room station mini-games & digital task validators | High | *Backend Team* | *To Be Made* |
| `BE-02` | **Interactive Impostor Gameplay Engine**: Server-side cooldown timers, anti-cheat, and kill cooldowns | High | *Backend Team* | *To Be Made* |
| `BE-03` | **Live Meeting & Voting Server**: WebSocket room voting, tally verification, and ejection sequence | High | *Backend Team* | *To Be Made* |
| `BE-04` | **Supabase Realtime Sync Bridge**: WebSocket listener syncing `public.activity_logs` & hostile effects | High | *Backend Team* | *To Be Made* |
| `BE-05` | **Tech Mystery Cryptographic Flag Validator**: Automated forensic hash checking API | Medium | *Backend Team* | *To Be Made* |

---

## 📝 Content & Field Operations (`/docs`)

| Module ID | Task Description | Priority | Assignee | Status |
|---|---|---|---|---|
| `MC-01` | Draft 5 additional Tech Mystery ciphers (Hex, Base64, Steganography) | Medium | *Content Team* | Open |
| `MC-02` | Print physical room QR codes and station briefing sheets for venue POCs | High | *Operations Team* | Ready |
| `MC-03` | Finalize Among Us rulebook printouts for team captains | High | *Operations Team* | **Completed** |
