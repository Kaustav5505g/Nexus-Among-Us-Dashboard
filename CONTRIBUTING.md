# Contributing to NEXUS Among Us Dashboard

Thank you for your interest in contributing to the **NEXUS Among Us: Coded Chaos & Tech Mystery Dashboard**!

---

## 🛡️ Project Governance & Approval Requirements
This repository enforces strict branch and configuration protection. Only the following designated maintainers have merge and administrative authority:
- **@Tejas-Narula** ([https://github.com/Tejas-Narula](https://github.com/Tejas-Narula))
- **@synthreaper** ([https://github.com/synthreaper](https://github.com/synthreaper))

**Every Pull Request must be reviewed and approved by @Tejas-Narula or @synthreaper before merging.**

---

## 🤖 Directives for AI Agents & Automated Coding Assistants
Because multiple contributors and AI agents interact with this repository, the following guardrails are strictly enforced:

1. **Single Unified Supabase Schema**:
   - All database tables, indexes, RLS policies, real-time publications, and seeds must remain in the single master file: `supabase/schema.sql`.
   - **Do NOT** generate loose, duplicate, or fragmented `.sql` files in `supabase/` (e.g. `01_schema.sql`, `seed.sql`, `migration_fix.sql`).
2. **Brand & Visual Integrity**:
   - Do not overwrite official assets (`/logo.jpeg`, `/poster-among-us.jpg`, `/poster-sherlock.jpg`).
   - Do not introduce arbitrary generic UI slop; preserve the bespoke aesthetic.
3. **Workspace Hygiene**:
   - Private research folders (e.g. `dumb/`) are strictly ignored in `.gitignore` and must never be tracked or published.
4. **Compulsory Changelog Logging**:
   - Every contributor and AI agent **MUST** document their changes in [`CHANGELOG.md`](./CHANGELOG.md).
   - PRs or commits that modify code, styling, schemas, or configs without updating `CHANGELOG.md` will be flagged by PR Guardian and rejected.
5. **No Direct Master Pushes**:
   - Work in feature branches and open a pull request for maintainer review.

---

## 🚀 Getting Started

1. **Fork the Repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/Nexus-Among-Us-Dashboard.git
   cd Nexus-Among-Us-Dashboard
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   ```
4. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## 📂 Project Structure

```
├── backend/       # Express + Socket.IO REST & Realtime Game Engine
├── frontend/      # React + Vite + Tailwind CSS Editorial UI
├── supabase/      # Single canonical schema.sql database definition
├── docs/          # Architecture specs, game rules, and API docs
└── .github/       # CI/CD workflows, CODEOWNERS, and issue templates
```

---

## 🛠️ Verification Commands

Before opening a pull request, verify that both workspaces compile with zero errors:
```bash
# Verify backend TypeScript compilation
npm --prefix backend run build

# Verify frontend TypeScript & Vite bundling
npm --prefix frontend run build
```

---

## 📝 Commit Conventions

We follow Conventional Commits:
- `feat:` A new feature or capability
- `fix:` A bug fix
- `docs:` Documentation updates
- `style:` Code style/formatting changes
- `refactor:` Code restructuring without behavioral change
- `test:` Adding or updating tests
- `chore:` Tooling tweaks or dependency updates
