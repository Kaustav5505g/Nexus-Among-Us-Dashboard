# Contributing to NEXUS Among Us Dashboard

Thank you for your interest in contributing to the **NEXUS Among Us: Coded Chaos & Tech Mystery Dashboard**! As an official club event platform, we welcome contributions from all developers, designers, and organizers.

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
   npm run install:all
   ```
4. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/awesome-new-feature
   ```

---

## 📂 Project Structure

```
├── backend/       # Express + Socket.IO REST & Realtime Game Engine
├── frontend/      # React + Vite + Tailwind CSS Space Themed UI
├── docs/          # Architecture specs, game rules, and API docs
└── .github/       # CI/CD workflows and issue templates
```

---

## 🛠️ Development Workflow

- Run both frontend and backend concurrently:
  ```bash
  npm run dev
  ```
- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:5173`

---

## 📝 Commit & Branch Conventions

We follow Conventional Commits:
- `feat:` A new feature or capability
- `fix:` A bug fix
- `docs:` Documentation updates
- `style:` Code style/formatting changes
- `refactor:` Code restructuring without behavioral change
- `test:` Adding or updating tests
- `chore:` Dependency updates or tooling tweaks

### Branch Naming
- `feature/<short-desc>`
- `bugfix/<short-desc>`
- `hotfix/<short-desc>`
- `docs/<short-desc>`

---

## 🔍 Pull Request Process

1. Ensure the application compiles without errors (`npm run build`).
2. Update relevant documentation in `docs/` or `README.md` if your changes alter functionality.
3. Open a PR targeting `main` and fill in the PR template.
4. Request a review from the NEXUS Technical Leads.
