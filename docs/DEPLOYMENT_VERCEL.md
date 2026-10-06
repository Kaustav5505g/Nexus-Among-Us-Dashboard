# 🚀 Deploying NEXUS Dashboard to Vercel

This guide outlines how to host the **NEXUS Dashboard Frontend** on **Vercel** with full SPA routing and Supabase connectivity.

---

## ⚡ Option 1: Deploy with Vercel Web Dashboard (Recommended)

1. **Push your repository to GitHub**:
   ```bash
   git push -u origin main
   ```
2. Go to [https://vercel.com/new](https://vercel.com/new) and log in.
3. Import the `Nexus-Among-Us-Dashboard` repository.
4. **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `frontend` (or leave as `./` since root `vercel.json` handles monorepo build automatically).
   - If using `frontend` as Root Directory:
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`
   - If using Root (`./`):
     - The root [`vercel.json`](../vercel.json) handles `npm --prefix frontend install && npm --prefix frontend run build` automatically.
5. **Environment Variables**:
   Add the following environment variables in the Vercel dashboard:
   | Variable | Value | Description |
   |---|---|---|
   | `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase API URL |
   | `VITE_SUPABASE_ANON_KEY` | `eyJh...` | Supabase Anonymous Public Key |
   | `VITE_API_URL` | `https://your-backend.railway.app/api` | Optional external backend URL |
   | `VITE_WS_URL` | `https://your-backend.railway.app` | Optional WebSocket URL |
6. Click **Deploy**.

---

## 💻 Option 2: Deploy via Vercel CLI

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy frontend
cd frontend
vercel

# 4. Deploy to Production
vercel --prod
```

---

## 🛡 SPA Routing & Headers Configuration

The repository includes both root [`vercel.json`](../vercel.json) and [`frontend/vercel.json`](../frontend/vercel.json) pre-configured with:
- **Rewrites**: `/(.*) -> /index.html` (prevents 404 on page reloads across routes like `/arena`, `/mystery`, `/leaderboard`).
- **Security Headers**: `X-Content-Type-Options`, `X-Frame-Options`, and `X-XSS-Protection`.
