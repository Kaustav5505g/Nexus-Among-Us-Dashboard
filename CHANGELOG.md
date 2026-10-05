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
### Security
- **CodeQL Alert #4 & #5 (Insecure Randomness / CWE-338)**: Replaced pseudo-random `Math.random()` in `AmongUsAdmin.tsx` and `gameDatabase.ts` with cryptographically secure `window.crypto.getRandomValues()` for covert role allotment, sector shuffling, and badge code generation.
- **CodeQL Alert #6 (Clear-Text Storage of Sensitive Information)**: Sanitized admin user records in `gameDatabase.ts` prior to caching in `localStorage` to strip credentials, and removed clear-text password fields from default fallback profiles.
- **CodeQL Alert #2 (Missing Rate Limiting)**: Integrated `express-rate-limit` on the forensic clue verification endpoint (`/api/mystery/verify`) to safeguard against brute-force attacks.
- **CodeQL Alert #1 (Permissive CORS Configuration)**: Replaced wildcard `*` with strict origin validation in backend `index.ts` across Express HTTP and Socket.IO servers.
- **CodeQL Alert #7 & #8 (Workflow Permissions)**: Added top-level `permissions: contents: read` blocks across all GitHub Actions workflows (`ci.yml` and `security.yml`).
- **Dependabot PR Lockdown**: Set `open-pull-requests-limit: 0` in `.github/dependabot.yml` and closed 14 automated PRs to protect frontend/backend framework stability 48h before the festival kickoff.

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
