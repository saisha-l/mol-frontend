# Molecular Discovery Platform

Web app for molecule analysis from SMILES strings.

It currently supports:
- ADMET profiling (physicochemical descriptors + rule-based filters)
- Similarity search against ChEMBL
- Protein target lookup through ChEMBL activity data
- 3D structure visualization with 3Dmol.js
- Legacy mock prediction endpoint

---

## Architecture

```
┌──────────────────────────┐       ┌─────────────────────────────────────┐
│  Next.js Frontend        │       │  FastAPI Backend                    │
│                          │       │                                     │
│  ADMET / Similarity /    │ POST  │  /admet                             │
│  Targets UI              ├──────►│  /similarity                        │
│                          │       │  /targets                           │
│  MoleculeViewer (3Dmol)  │ POST  │  /molblock                          │
│                          ├──────►│                                     │
│  Legacy prediction UI    │ POST  │  /predict                           │
└──────────────────────────┘       └─────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
- Next.js
- React + TypeScript
- 3Dmol.js
- ESLint

### Backend
- FastAPI
- Uvicorn
- Pydantic
- RDKit
- httpx (ChEMBL API calls)

---

## Local Setup

### 1) Install frontend dependencies

```bash
npm install
```

### 2) Create Python virtual environment and install backend dependencies

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.txt
```

### 3) Configure frontend API URL

Create or update `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

---

## Run Locally (Recommended)

Run backend and frontend in separate terminals.

### Terminal A: backend

```bash
.venv/bin/uvicorn app.main:app --reload --app-dir backend --host 127.0.0.1 --port 8000
```

### Terminal B: frontend

```bash
npm run dev
```

Open:
- Frontend: http://localhost:3000 (or the port shown in terminal)
- Backend health: http://127.0.0.1:8000/health

---

## Build

```bash
npm run build
```

This validates TypeScript and produces a production build.

Note: this project is configured with `output: export`, so use `npm run dev` for local development/testing.

---

## Troubleshooting

### "Failed to fetch" in UI

Most common causes:
- Backend is not running
- `NEXT_PUBLIC_API_BASE_URL` points to the wrong port
- Frontend opened on a different local port than expected

Checklist:
1. Confirm backend is up at `http://127.0.0.1:8000/health`
2. Confirm `.env.local` matches backend port
3. Restart frontend after changing `.env.local`
4. Ensure only one `next dev` instance is running

### "Address already in use" when starting backend

Port 8000 is occupied. Either:
- stop old process and restart, or
- run backend on a different port and update `.env.local` accordingly

