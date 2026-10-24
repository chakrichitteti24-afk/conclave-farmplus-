# FarmPulse — IC26-01-01: Explainable Crop Stress Advisory

> Bio-Glass Agri UI · FastAPI Backend · React + Vite + Tailwind · EN/TE/HI i18n

---

## Quick Start

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env        # edit GEMINI_API_KEY etc.
python run.py
# → http://localhost:8000/api/docs
```

### Frontend
```bash
cd frontend
pnpm install   # or npm install
pnpm dev       # or npm run dev
# → http://localhost:5173
```

---

## Project Structure

```
farmplus/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app + routers
│   │   ├── core/
│   │   │   ├── config.py            # Settings (pydantic-settings)
│   │   │   └── database.py          # Async SQLite / SQLAlchemy 2.x
│   │   ├── models/                  # ORM models (Field, Alert, JudgeResult)
│   │   ├── schemas/                 # Pydantic I/O schemas
│   │   ├── services/
│   │   │   ├── crop_stress_engine.py  # Explainable advisory engine
│   │   │   ├── alert_service.py       # Alert CRUD + seeding
│   │   │   └── judge_service.py       # Evaluation / scoring
│   │   └── api/routes/
│   │       ├── health.py
│   │       ├── fields.py            # CRUD Field Profiles
│   │       ├── crop_stress.py       # POST /analyze
│   │       ├── alerts.py            # GET + mark-read
│   │       └── judge.py             # Run + history
│   ├── requirements.txt
│   ├── run.py
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── main.jsx                 # React entry point
    │   ├── App.jsx                  # App Shell (tabs, orbs, layout)
    │   ├── index.css                # Tailwind + custom CSS
    │   ├── i18n/
    │   │   └── translations.js      # EN / TE / HI full translations
    │   ├── contexts/
    │   │   ├── LanguageContext.jsx  # Language state + t() hook
    │   │   └── TabContext.jsx       # Active tab state
    │   ├── utils/
    │   │   └── api.js               # Axios client + API helpers
    │   ├── components/
    │   │   ├── ui/index.jsx         # GlassCard, GlassButton, Badge, ...
    │   │   ├── layout/
    │   │   │   ├── TopLanguageBar.jsx
    │   │   │   └── BottomNavBar.jsx
    │   │   └── tabs/
    │   │       ├── FieldsTab.jsx    # Tab 1 — Field Profiles
    │   │       ├── CropStressTab.jsx# Tab 2 — Check Crop Stress
    │   │       ├── AlertsTab.jsx    # Tab 3 — Proactive Alerts
    │   │       └── JudgeTab.jsx     # Tab 4 — Judge Test Suite
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## API Endpoints

| Method | Path                          | Description                   |
|--------|-------------------------------|-------------------------------|
| GET    | `/api/v1/health`              | Health check                  |
| GET    | `/api/v1/fields`              | List all field profiles       |
| POST   | `/api/v1/fields`              | Create field profile          |
| PATCH  | `/api/v1/fields/{id}`         | Update field                  |
| DELETE | `/api/v1/fields/{id}`         | Delete field                  |
| POST   | `/api/v1/crop-stress/analyze` | Explainable stress analysis   |
| GET    | `/api/v1/alerts`              | Proactive alerts              |
| POST   | `/api/v1/alerts/mark-read`    | Mark alerts as read           |
| GET    | `/api/v1/judge/built-in-tests`| List benchmark test cases     |
| POST   | `/api/v1/judge/run-built-in`  | Run all built-in tests        |
| POST   | `/api/v1/judge/run`           | Run custom test batch         |
| GET    | `/api/v1/judge/results`       | Last 100 evaluation results   |

---

## UI Theme — Bio-Glass Agri

| Token          | Hex       | Usage                        |
|----------------|-----------|------------------------------|
| Deep Emerald   | `#064E3B` | Primary brand, nav bg        |
| Mint           | `#10B981` | Accent, CTA buttons, active  |
| Alabaster      | `#F4F7F4` | Page background              |
| Amber          | `#F59E0B` | Warnings, medium severity    |
| Coral          | `#EF4444` | Critical alerts, danger      |

Cards use `bg-white/60 backdrop-blur-md` frosted glass with smooth `transition-all` animations.

---

## Supported Languages
- 🇬🇧 **English** (`en`)
- 🌿 **Telugu** (`te`) — తెలుగు
- 🇮🇳 **Hindi** (`hi`) — हिंदी

Language persisted to `localStorage`; switch via the top language bar.
