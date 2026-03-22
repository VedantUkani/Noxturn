# Noxturn — Circadian Recovery Planner for Shift Workers

> **HackASU 2026 · Mental Health Track**

Noxturn is an AI-powered recovery planner built for nurses, paramedics, factory workers, and anyone working rotating shifts. It analyzes your schedule, detects circadian risk (rapid flips, short turnarounds, unsafe drive windows), and uses Claude AI to generate a personalized 24–72 hour recovery plan — calibrated to your chronotype, sleep conditions, and medical history.

---

## Demo

| Page | What it does |
|---|---|
| **Onboarding** | 5-step wizard — role, commute, sleep prefs, Fitbit, health context |
| **Today** | AI-generated recovery plan — sleep anchors, light timing, caffeine cutoffs |
| **Schedule** | Add/edit shift blocks — triggers plan regeneration |
| **Week** | 7-day recovery heatmap and injury risk map |
| **Recovery** | Analytics — circadian strain score, HRV trends, recovery mode history |
| **Settings** | Inline editable profile, sleep prefs, wearable status |

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **Supabase** client for auth callback
- **Fitbit OAuth 2.0** (PKCE flow) for wearable integration

### Backend
- **FastAPI** + **Uvicorn** (Python 3.11)
- **Claude Haiku** (`claude-haiku-4-5-20251001`) for plan generation
- **Supabase** (PostgreSQL) for users, plans, tasks, wearable data
- **RAG pipeline** — sentence-transformers vector retrieval over clinical intervention cards
- **Risk Engine** — 4 detectors: rapid flip, short turnaround, low recovery window, unsafe drive

---

## Project Structure

```
HackASU/
├── frontend/               # Next.js app
│   ├── src/
│   │   ├── app/            # Pages (today, schedule, week, recovery, settings, onboard)
│   │   ├── components/     # UI components and feature modules
│   │   └── lib/            # API client, auth, profile settings, Fitbit OAuth
│   └── vercel.json
│
└── backend/                # FastAPI app
    ├── app/
    │   ├── routes/         # auth, plans, risks, schedule, recovery, tasks, wearables, rag
    │   ├── planner/        # ClaudePlanner (LLM) + RulePlanner (fallback)
    │   ├── risk_engine/    # Circadian risk detectors
    │   ├── rag/            # Evidence retrieval (sentence-transformers)
    │   ├── models/         # Pydantic schemas
    │   └── services/       # Supabase, persistence, rate limiting, token tracking
    ├── Procfile
    ├── railway.toml
    ├── runtime.txt
    └── requirements.txt
```

---

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key

### 1. Clone and install

```bash
git clone https://github.com/VedantUkani/Noxturn.git
cd Noxturn
```

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure environment variables

**Backend** — copy and fill in `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:<password>@db.your-project.supabase.co:5432/postgres
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=<run: python -c "import secrets; print(secrets.token_hex(32))">
ALLOWED_ORIGINS=http://localhost:3000
OAUTHLIB_INSECURE_TRANSPORT=1
```

**Frontend** — copy and fill in `frontend/.env.local`:
```bash
cp frontend/.env.example frontend/.env.local
```

```env
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000
NEXT_PUBLIC_FITBIT_CLIENT_ID=your-fitbit-client-id
FITBIT_CLIENT_SECRET=your-fitbit-client-secret
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run

**Backend** (in one terminal):
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Frontend** (in another terminal):
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

### Backend → Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Set root directory to `backend`
3. Add all environment variables from above (set `ALLOWED_ORIGINS` to your Vercel URL)
4. Railway auto-detects Python and uses the `Procfile` — always-on, no cold starts

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import repo
2. Set root directory to `frontend`
3. Add environment variables:
   - `NEXT_PUBLIC_API_BASE` = your Railway backend URL
   - `NEXT_PUBLIC_FITBIT_CLIENT_ID`, `FITBIT_CLIENT_SECRET`
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

After both are live, update `ALLOWED_ORIGINS` on Railway to your Vercel URL, and add the Vercel callback URL (`https://your-app.vercel.app/auth/fitbit-callback`) to your Fitbit developer app.

---

## Key API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Register + get JWT |
| `POST` | `/auth/login` | Login + get JWT |
| `POST` | `/schedule/import` | Parse and normalize shift blocks |
| `POST` | `/risks/compute` | Run circadian risk engine |
| `POST` | `/plans/generate` | Generate plan (rule-based) |
| `POST` | `/plans/generate-claude` | Generate plan (Claude AI + user profile) |
| `POST` | `/plans/replan` | Update plan after task event |
| `GET` | `/dashboard/today` | Active plan + risk summary |
| `GET` | `/recovery/analytics` | Strain history + mode trends |
| `POST` | `/wearables/import` | Import sleep data from Fitbit |
| `GET` | `/health` | Health check |

---

## How the AI Plan Generation Works

```
User's shift schedule
        ↓
  Risk Engine (4 detectors)
  → circadian_strain_score, risk_episodes[]
        ↓
  RAG Retrieval (sentence-transformers)
  → top 3 clinical evidence cards
        ↓
  Claude Haiku system prompt:
  - Clinical circadian priorities
  - Worker profile (chronotype, sleep window,
    caffeine habit, medications, conditions)
  - Evidence citations
        ↓
  Structured JSON plan:
  tasks[], avoid_list, next_best_action
```

The user's onboarding profile (role, chronotype, anchor sleep window, sleep conditions, medical history, medications) is injected into every Claude call so every task is personalised — not generic advice.

---

## Team

| Name | Role |
|---|---|
| **Vedant Ukani** | Backend · Risk Engine · Claude AI Layer |
| **Het Bhesaniya** | Frontend · UI · Demo Flow |
| **Abhinav** | Data · RAG · Supabase · Pitch |

---

## License

MIT
