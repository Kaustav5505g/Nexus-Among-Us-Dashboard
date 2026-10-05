# Multi-User Git Collaboration & Team Workflow

Welcome to the **NEXUS Among Us Dashboard** development team! To maintain high code quality and prevent merge conflicts across multiple club developers, all contributors must adhere to this workflow.

---

## 👥 Team Roles & Responsibilities

| Role | Focus Area | Responsible Directory |
|---|---|---|
| **Tech Lead / Admin** | PR reviews, architectural decisions, deployments | Entire Repo |
| **Frontend Developers** | React components, Tailwind styling, UX/UI, animations | `/frontend` |
| **Backend Developers** | Express routes, WebSocket synchronization, game logic | `/backend` |
| **Puzzle / Content Designers** | Tech mystery ciphers, case files, task descriptions | `/docs`, `/backend/src/models` |

---

## 🌿 Branching Strategy

Never commit directly to `main`! All work is done in isolated feature branches.

### Branch Naming Conventions
- Frontend tasks: `feat/frontend-<feature-name>` (e.g., `feat/frontend-leaderboard-card`)
- Backend tasks: `feat/backend-<endpoint-name>` (e.g., `feat/backend-sabotage-engine`)
- Bug fixes: `fix/<issue-description>` (e.g., `fix/emergency-siren-race-condition`)
- Documentation: `docs/<doc-name>` (e.g., `docs/event-rules-update`)

---

## 🔄 Daily Collaboration Routine

### 1. Synchronize Before Coding
Always pull latest updates from `origin main` before starting new work:
```bash
git checkout main
git pull origin main
```

### 2. Create Your Feature Branch
```bash
git checkout -b feat/frontend-task-matrix
```

### 3. Commit Frequently with Conventional Commits
Write clean, meaningful commit messages:
```bash
# Good examples:
git commit -m "feat(frontend): add interactive Skeld map component"
git commit -m "fix(backend): correct timer decrement on emergency vote"
git commit -m "docs: update API endpoints table in API_SPECS.md"
```

### 4. Keep Your Branch Up to Date
If `main` has progressed while you were working:
```bash
git fetch origin
git rebase origin/main
# or git merge origin/main
```

---

## 🚀 Submitting a Pull Request (PR)

1. Push your branch to GitHub:
   ```bash
   git push -u origin feat/frontend-task-matrix
   ```
2. Open a Pull Request on GitHub targeting `main`.
3. Fill out the PR template completely:
   - Provide a clear summary of changes.
   - Link related issue (`Closes #12`).
   - Include screenshots for frontend changes.
4. Request review from `@Tejas-Narula` or designated sub-team leads.
5. Once approved and CI passes, your branch will be squashed and merged into `main`.

---

## ⚠️ Resolving Merge Conflicts

If GitHub reports merge conflicts:
```bash
git checkout feat/your-branch
git fetch origin
git merge origin/main
```
Open conflicted files in VS Code / your editor, resolve the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`), stage files, and commit:
```bash
git add .
git commit -m "chore: resolve merge conflicts with main"
git push origin feat/your-branch
```
