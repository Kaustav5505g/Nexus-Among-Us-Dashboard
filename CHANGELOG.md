# Changelog

All notable changes to the **NEXUS Among Us & Tech Mystery Platform** will be documented in this file.

> [!IMPORTANT]
> **COMPULSORY CONTRIBUTOR RULE**:
> **Every human contributor and AI agent MUST log their changes in this file.**
> Pull requests or commits that modify functionality, styling, database schemas, or configurations without an accompanying entry in `CHANGELOG.md` will be rejected by repository maintainers (**@Tejas-Narula** and **@synthreaper**).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Database-backed player portal**: Added validated Team ID/player-name sign-in and session refresh backed by Supabase, including current team role, room allocation, and event session details. Configured the separate login, admin, and player Vite pages and local API proxy.
- **Supabase environment configuration**: Backend and Vite load the repository-root `.env`; checked-in examples contain placeholders only.
- **Rooms and powers schema**: Added the rooms/powers migration and database-backed admin powers and room management support.
- **Room-Level Impostor Allotment Engine**:
  - Added support for rooms containing any number of teams ($N$ teams per room), where 1 entire team in the room is designated as the **IMPOSTOR** team while the remaining teams act as **CREWMATE** teams.
  - **🎲 Random Impostor Roll**: 1-click cryptographically secure random roll using `window.crypto.getRandomValues` to select 1 team out of all teams in that room as the Impostor.
  - **Custom Admin Override**: Admin can manually assign or override the room Impostor via a dedicated dropdown selector on each room card, or toggle individual teams via "Make Impostor" / "Make Crew" buttons.
  - **Clear Admin Visibility**: Prominent Impostor status banner on each room card (`Room Impostor: [Team Name (NX-T...)]` or `None set`) and dedicated team badges (`IMPOSTOR` vs `Crewmate`).
- **Player Terminal Role Dispatch & Sabotage Power Console (`frontend/player.html`)**:
  - Connected player portal so all members of an authenticated team see their designated role (**ROLE: IMPOSTOR** or **ROLE: CREWMATE**), alongside the requested notice *"To be made by backend team"*.
  - **Interactive Impostor Sabotage Console**: Impostor teams can execute live sabotages (*Sabotage Lights*, *Door Lockdown*, *Comms Blackout*, *Fake Task Signal*) with active cooldown timers.
  - **Crewmate Action Console**: Crewmate teams have dedicated action buttons (*Report Suspicion*, *Submit Clue Decipher*).
  - **Real-Time Synchronization**: Player terminal automatically synchronizes role changes across browser tabs/devices within 3 seconds using `localStorage` event listeners and polling.
- **Real-Time Admin Activity & Audit Logs Deck (`5. Activity Logs` in `AmongUsAdmin.tsx`)**:
  - Added dedicated Activity Logs tab streaming real-time event logs, including Impostor power activations, admin role rolls/overrides, team logins, and system events.
  - Auto-refreshes every 3 seconds to capture live player actions.
  - Category filter pills (`All`, `Powers`, `Role Assignments`, `Sabotages`, `Logins`, `System`), keyword search bar, CSV export (`nexus_audit_logs.csv`), and clear logs capability.
- **Player Login Telemetry & Role Detection (`frontend/index2.html`)**:
  - Authenticated team logins automatically record a login event with the detected team role into `nexus_activity_logs_v2`.
  - Dynamic warp animation alerting users of their detected role before redirecting to `player.html`.
- **Master Admin User Management Panel**: Added dedicated `4. User Panel` in `AmongUsAdmin.tsx` accessible exclusively by Master Admin (`super_admin`).
  - Master Admin can create, edit, and delete **Sub-Admins** and **Moderators**.
  - Includes full credentials creation (Facilitator ID, Name, Email, Login Password, Designation, and Sector/Room Assignment).
  - One-click role switcher dropdown to instantly promote or demote staff between Sub-Admin and Moderator roles.
  - Integration with `AllocationDatabase.getStaffUsers()` and `AdminAuthContext` so newly created sub-admins and moderators can immediately sign in.
  - Protection guard ensuring the primary Master Admin account cannot be altered or accidentally deleted.
- **Player Team ID Authentication System**: Connected `frontend/index2.html` player login directly to the application database (`nexus_teams_v2` / initial teams). Players log in using their assigned Team ID (e.g. `NX-T1`, `NX-T2`).
- **Official Team ID Badges & Export in Admin Panel**: Added distinct `teamCode` identifiers (e.g. `NX-T1`, `NX-T2`) to teams across `types`, `initialAdminData`, `gameDatabase`, and the Admin UI card badges and CSV export.
- **Dedicated Player Terminal Placeholder (`frontend/player.html`)**: Created minimal black & white player terminal page displaying the requested notice: *"To be made by backend team"*, along with authenticated team details (Team Name, Official Team ID, Allocated Room, Sector Zone, and Assigned POC/Contact).
- **Vite Multi-Page Build Configuration**: Configured `frontend/vite.config.ts` `rollupOptions.input` to bundle `index.html` (Admin), `index2.html` (Player Login Portal), and `player.html` (Player Terminal).

### Changed
- **Modern Crisp Black & White Interface (Zero Paper Texture)**: Replaced retro paper textures and newsprint artifacts with a sleek, modern, flat black-and-white interface (`#ffffff` surfaces, pure `#000000` text/buttons, clean border dividers, and subtle rounded corners).
- **Removed Demo Logins**: Eliminated all pre-filled demo logins, demo helper buttons, and credentials hints. Login inputs now start completely blank for real event authentication.
- **Ultra-Simplified Zero-Bloat Admin Workflow**: Rebuilt the interface into a completely intuitive 3-step controller (`1. Room Allocation`, `2. Teams & Players`, `3. Rooms & POCs`) with clean button labels and zero unnecessary menus or modals.
- **Among Us Individual Player Architecture**: Restructured teams to treat all members as equal individual persons/crewmates (no hierarchical leader requirements). Teams can be created with a simple list of participants and easily allocated to rooms.
- **Editable Rooms, Zones & POCs**: Added ability to define and edit room names (e.g. `Room 1`, `Room 2`, `Lab 102`), assign campus zones, capacity limits, and assign Points of Contact (POCs) with direct phone contacts.
- **Interactive Room Allocation Matrix**: Added visual room allocation board with 1-click team assignment, smart round-robin auto-allotment across rooms, unassign controls, and instant CSV roster export.
- **Streamlined Application Entrypoint**: Simplified `App.tsx` routing so the Admin Operations Deck is rendered directly on root (`/`), `/admin`, and `/dashboard`.

### Removed
- **Marketing Homepage**: Removed the 1200-line broadsheet marketing homepage and promotional widgets from `App.tsx`.
- **Mobile Player Mission Deck**: Removed `PlayerMission.tsx` and all `/play` routes.
- **Docker Infrastructure**: Removed `docker-compose.yml`, `backend/Dockerfile`, and `frontend/Dockerfile`.
- **Dependabot Configuration**: Removed `.github/dependabot.yml`.
- **Legacy Admin Clutter**: Purged obsolete game engines, sabotages, emergency meetings, and task simulation clutter from the admin interface.

### Security
- **CodeQL Alert #4 & #5 (Insecure Randomness / CWE-338)**: Replaced pseudo-random `Math.random()` in `AmongUsAdmin.tsx` and `gameDatabase.ts` with cryptographically secure `window.crypto.getRandomValues()` for covert role allotment, sector shuffling, and badge code generation.
- **CodeQL Alert #6 (Clear-Text Storage of Sensitive Information)**: Sanitized admin user records in `gameDatabase.ts` prior to caching in `localStorage` to strip credentials, and removed clear-text password fields from default fallback profiles.
- **CodeQL Alert #2 (Missing Rate Limiting)**: Integrated `express-rate-limit` on the forensic clue verification endpoint (`/api/mystery/verify`) to safeguard against brute-force attacks.
- **CodeQL Alert #1 (Permissive CORS Configuration)**: Replaced wildcard `*` with strict origin validation in backend `index.ts` across Express HTTP and Socket.IO servers.
- **CodeQL Alert #7 & #8 (Workflow Permissions)**: Added top-level `permissions: contents: read` blocks across all GitHub Actions workflows (`ci.yml` and `security.yml`).

---

## [1.3.0] - 2026-10-06

### Added
- **Compulsory Changelog Protocol**: Added `CHANGELOG.md` with strict CI verification requiring all contributors and AI agents to record modifications.
- **"Buy 1 Get 1 Free" (BOGO) Mega Campaign**:
  - Sticky top flash bulletin announcing the ₹25 combo offer (Pay once, play BOTH Among Us on 9th Oct and Sherlock Holmes on 10th Oct).
  - Front-page official decree card with animated flame, ₹30,000 bounty callout, and direct registration button.
  - Telemetry meter highlighting `🔥 1+1 MEGA OFFER PASS: ₹25 TOTAL`.
  - Dossier Exhibit #01 dedicated to the BOGO pass, and Exhibit #06 highlighting double winning probability at zero extra cost.
  - Comparison matrix row detailing the free second event entry.
- **Editorial Archival Paper & Ink Black & White Aesthetic**:
  - Tactile newsprint canvas (`#f6f4ee`) with subtle paper-grid micro-texture.
  - High-contrast printer's ink typography, solid rules, double hairlines, and brutalist paper cards (`.paper-card`) with physical drop shadows (`shadow-[4px_4px_0px_#111111]`).
  - Physical ink stamp badges (`.stamp-red`, `.stamp-black`, `.stamp-gold`).
- **Full Portrait Poster Presentation**:
  - Preserved authentic vertical aspect ratios (`aspect-[2/3]`) for both official posters (`poster-among-us.jpg` and `poster-sherlock.jpg`), displaying full illustrations, character artwork, date, time, venue, and QR codes without cropping.
  - High-resolution modal Lightbox for expanding posters.
- **Tactile Interactive Stations**:
  - Skeld Station Console: Interactive task toggles (*Fix Wiring*, *Upload Data*, *Calibrate Engine*, *Divert Power*) with audio effects.
  - Industrial Red Emergency Buzzer with caution striping, siren audio, and screen-wide alert banner.
  - 221B London Detective Cipher Terminal with forensic hint toggle and keyword decryption (*Moriarty*, *Nexus*, *Impostor*).
- **Live Countdown Clock**: Real-time ticker counting down to 9 October 2026, 12:00 PM IST (TechIdeate'26 Kickoff).
- **Governance & CI Automation**:
  - `.github/workflows/pr-guardian.yml`: Automated PR inspection enforcing maintainer verification and blocking loose SQL migrations.
  - `.github/workflows/security.yml`: Automated scans for exposed secrets, JWT tokens, and dependency vulnerabilities.
  - `.github/dependabot.yml`: Automated weekly dependency reviews assigned to maintainers.

### Changed
- **Admin Login & Dashboard Branding**:
  - Replaced generic black `NX` square with official **NEXUS insignia** (`/logo.jpeg`) on both the login gate card and top navigation bar.
  - Simplified Admin login to only require Username / Facilitator ID and Password.
- **CODEOWNERS**: Restricted repository-wide code ownership strictly to **@Tejas-Narula** and **@synthreaper**.
- **Documentation**: Updated `CONTRIBUTING.md`, `SECURITY.md`, and `docs/SUPABASE_SETUP.md` with strict anti-slop, single-schema, and maintainer-approval directives.

### Removed
- **Admin Clearance Tiers**: Removed the reference list of facilitator test tiers and clearance codes from the login card for clean minimalism.
- **Redundant Supabase Files**: Deleted fragmented SQL migration files (`01_schema.sql`, `02_seed.sql`, `03_realtime_and_rls.sql`, `FIX_DATABASE_MIGRATION.sql`, `seed.sql`, `COMPLETE_SUPABASE_SETUP.sql`).

### Security
- **Unified Single-Schema Architecture**: Consolidated the entire database schema, UUID extensions, performance indexes, RLS policies, real-time publications, and seeds into a single canonical file: `supabase/schema.sql`.
- **Branch & Maintainer Protection**: Established approval requirements from `@Tejas-Narula` or `@synthreaper` on all PRs and configuration changes.

---

## [1.2.0] - 2026-10-05

### Added
- **Dual Flagship Universe**: Integrated Sherlock Holmes Tech Mystery alongside Among Us Coded Chaos.
- **Supabase Realtime Database Integration**: Connected teams, station tasks, sabotage alarms, and facilitator logs to PostgreSQL backend.
- **Mobile Mission Deck (`/play`)**: Dedicated tactical player screen for mobile phones with QR badge scanner, room check-in, and task tracking.
- **Auditing & Event Logs**: Facilitator action trail and meeting call records.

---

## [1.0.0] - 2026-10-01

### Added
- Initial release of Among Us Coded Chaos Facilitator Deck for TechIdeate'26.
- Interactive station task manager and room allocation controls.
- Local storage fallback engine and offline simulation mode.
