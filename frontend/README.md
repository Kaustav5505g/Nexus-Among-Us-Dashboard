# NEXUS Dashboard Frontend

Modern React + TypeScript + Vite + Tailwind CSS dashboard interface for **NEXUS Among Us: Coded Chaos & Tech Mystery**.

## Key Directories
- `src/components/`: Reusable UI elements (Navbar, Footers, Modals, Cards, Feeds)
- `src/pages/`: Views (Event Hub, Coded Chaos Arena, Tech Mystery Room, Leaderboards, Team Registration, Admin Console)
- `src/context/`: Socket.IO state synchronization
- `src/types/`: Shared TypeScript models

## Available Scripts

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Multi-page portals

- `index.html` and `admin.html` load the React admin console.
- `login.html` is the Among Us player sign-in portal.
- `player.html` is the authenticated player station terminal.

During development, Vite proxies `/api` requests to `http://localhost:5000`.
Set `VITE_API_URL` or `VITE_API_BASE_URL` when the backend is hosted at a
different origin. Player sign-in and session refresh also require the backend
Supabase settings described in `../backend/README.md`.
