# PALAR GUARD AI — Production Deployment Guide

Architecture:
- **Frontend**: React + TypeScript + Vite + Three.js (`frontend/`) -> **Vercel**
- **Backend**: FastAPI + SQLAlchemy (`backend/`) -> **Render**
- **Database**: **Supabase PostgreSQL** (or Render Managed PostgreSQL via `render.yaml`)

---

## 1. Database Setup (Supabase PostgreSQL or Render PostgreSQL)

### Option A — Supabase PostgreSQL
1. Create a Supabase project in `ap-south-1` (Mumbai) or `ap-southeast-1` (Singapore).
2. Copy the **Connection String** (URI mode) from *Project Settings -> Database*.
3. Ensure SSL is enforced (`?sslmode=require`):
   ```
   postgresql://postgres.<ref>:<URL_ENCODED_PASSWORD>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```
   > `backend/app/core/database.py` also enforces `sslmode="require"`, `pool_pre_ping=True`, and `pool_recycle=300` automatically in production.

### Option B — Render Managed PostgreSQL (`render.yaml`)
`render.yaml` defines `palar-guard-db` and injects `DATABASE_URL` into the backend automatically via Render Blueprints.

### Schema & Initial Admin Provisioning
When the backend starts (or via one-off build/shell command), SQLAlchemy creates tables and runs safe non-destructive column checks (`init_db()`).  
**Important:** Production startup never seeds a hard-coded administrator password. Provision the first admin explicitly:

```bash
cd backend
# Option 1: Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD in Render Environment Variables for first boot
# Option 2: Run the CLI provisioning module via Render Shell:
python -m app.provision_admin --email <admin-email> --name "<Full Name>" --password "<strong-password>"
```

---

## 2. Backend Deployment (Render)

1. Push the repository to GitHub (`https://github.com/kayalvizhij-2008-it/palar-guard-ai`).
2. In Render Dashboard -> **New + -> Web Service** (or **Blueprint** using `render.yaml`):
   - **Root Directory**: Repository root (commands enter `backend/`)
   - **Build Command**:
     ```bash
     cd backend && pip install -r requirements.txt && python -c "from app.seed_data import init_db; init_db()"
     ```
   - **Start Command**:
     ```bash
     cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Health Check Path**: `/health`
3. Configure **Environment Variables** on Render:
   - `ENVIRONMENT` = `production`
   - `DATABASE_URL` = Supabase or Render PostgreSQL URI (`postgresql://...`)
   - `SECRET_KEY` = Random 48+ char secret (startup refuses missing/weak `<32`-char keys in production)
   - `CORS_ORIGINS` = Comma-separated exact Vercel URL(s), e.g. `https://frontend-tau-kohl-99.vercel.app` (never `*`)
   - `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` = Initial administrator credentials for first boot (remove after provisioning if desired)
4. Verify after deploy:
   - `GET https://<your-backend>.onrender.com/health` returns `{"status":"healthy", ...}`.

---

## 3. Frontend Deployment (Vercel)

1. In Vercel Project Settings for `frontend-tau-kohl-99.vercel.app`:
   - `vercel.json` at repo root configures `@vercel/static-build` for `frontend/package.json`, caches `/assets/`, `/textures/`, `/animations/`, and rewrites all routes (`/*`) to `/frontend/dist/index.html` for direct SPA URL refreshes (`/community/water-near-you`, `/pro/documents`, etc.).
2. Configure **Environment Variables** in Vercel:
   - `VITE_API_BASE_URL` = `https://<your-backend>.onrender.com` (without trailing slash)
   - *(Optional)* `VITE_MAPTILER_API_KEY` = MapTiler key (defaults to Esri Satellite + Carto Dark basemaps if omitted)
3. Redeploy Vercel after setting `VITE_API_BASE_URL` so Vite embeds the backend URL into the static bundle, and confirm Render `CORS_ORIGINS` includes the exact Vercel origin.

---

## 4. Redeployment & CLI Commands

- **Frontend (`Vercel CLI`)**:
  ```bash
  vercel --prod
  ```
- **Backend (`Render CLI`)**:
  ```bash
  render login
  render blueprints sync   # or redeploy via Render Dashboard / GitHub push
  ```
