# PulseOps — AI-Powered DevOps Incident Intelligence Platform

[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.139-blue)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)](https://docker.com)

> Real-time infrastructure monitoring platform with AI anomaly detection, automated incident management, LLM root cause analysis, and multi-channel alerting via n8n workflows.

---

## Features

- **Live Dashboard** — Socket.IO real-time metric streaming with Recharts area charts
- **AI Anomaly Detection** — Isolation Forest model scoring every metric flush
- **Incident Management** — Full lifecycle (open → investigating → resolved) with timeline
- **Alert Engine** — Threshold-based rules with cooldown deduplication
- **AI Root Cause Analysis** — Groq LLM generates structured RCA summaries
- **Automation Workflows** — n8n webhooks to Slack, Telegram, and Email
- **Risk Scoring** — Per-host anomaly rate and peak score dashboard

---

## Architecture

```
                    ┌─────────────────┐
                    │   React + Vite  │
                    │   (Frontend)    │
                    └────────┬────────┘
                             │ REST + Socket.IO
                    ┌────────▼────────┐
                    │  Node.js/Express │
                    │   (Backend)     │
                    └──┬───┬───┬─────┘
                       │   │   │
            ┌──────────┘   │   └──────────┐
            │              │              │
   ┌────────▼───┐  ┌───────▼──────┐  ┌───▼───┐
   │  MongoDB   │  │     Redis    │  │  n8n  │
   │ (Storage)  │  │ (Queue/Cache)│  │(Auto) │
   └────────────┘  └──────────────┘  └───────┘
                             │
                    ┌────────▼────────┐
                    │  FastAPI + IF   │
                    │  (AI Service)  │
                    └─────────────────┘
```

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS v4, Recharts, Socket.IO Client |
| Backend    | Node.js 20, Express, Socket.IO, Mongoose, Redis |
| AI Service | FastAPI, Scikit-learn (Isolation Forest), Groq LLM |
| Automation | n8n (self-hosted), Slack/Telegram/Email webhooks |
| Database   | MongoDB 7, Redis 7                      |
| DevOps     | Docker, Docker Compose, Nginx           |

---

## Quick Start

### Prerequisites

- Docker Desktop (running)
- Node.js 20+ (for simulator)
- Python 3.11+ (for AI model training)

### 1. Clone and configure

```bash
git clone https://github.com/Atharvverma1234/PulseOps.git
cd PulseOps

cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
```

Edit `backend/.env` with your credentials:

```env
MONGO_URI=mongodb://mongo:27017/pulseops
JWT_SECRET=your_secret_here
GROQ_API_KEY=gsk_your_key_here
```

### 2. Train AI model

```bash
cd ai-service
python -m venv .venv
.venv/Scripts/activate        # Windows
pip install -r requirements.txt
python scripts/generate_dataset.py
python scripts/train_model.py
```

### 3. Start the stack

```bash
docker compose up --build
```

### 4. Start metric simulator

```bash
node simulator/simulate.js
```

### 5. Open the dashboard

```
http://localhost:5173
```

Register an account → watch live metrics stream in.

---

## API Reference

### Auth
```
POST /api/auth/register   → { name, email, password, role }
POST /api/auth/login      → { email, password }
GET  /api/auth/me         → (protected)
```

### Metrics
```
POST /api/metrics         → ingest single metric
POST /api/metrics/bulk    → ingest batch
GET  /api/metrics         → query with filters
GET  /api/metrics/latest  → latest per host
GET  /api/metrics/stats/:host
```

### Incidents
```
POST  /api/incidents
GET   /api/incidents
GET   /api/incidents/:id
PATCH /api/incidents/:id
POST  /api/incidents/:id/timeline
GET   /api/incidents/stats
```

### AI
```
POST /api/rca/:id/generate   → Groq RCA generation
GET  /api/rca/stats
GET  /api/ai/risk-summary
GET  /api/ai/anomalies
GET  /api/ai/score-history/:host
```

### AI Service (FastAPI)
```
POST /predict        → single anomaly score
POST /predict/bulk   → batch scoring
GET  /model/status   → model metadata
POST /train          → retrain model
```

---

## Running Tests

```bash
cd backend
npm test
npm run test:coverage
```

### Load test
```bash
node scripts/loadtest.js
```

---

## Deployment

### Development
```bash
docker compose up --build
```

### Production
```bash
# Windows
.\scripts\deploy.ps1

# Linux/Mac
./scripts/deploy.sh
```

### Health check
```bash
.\scripts\monitor.ps1
```

---

## Project Structure

```
PulseOps/
├── frontend/              # React + Vite SPA
│   ├── src/
│   │   ├── pages/         # Dashboard, Incidents, Alerts, AI, Automation
│   │   ├── components/    # UI components
│   │   └── hooks/         # useMetrics, useAlerts, useRiskScores
├── backend/               # Node.js API
│   ├── controllers/       # Auth, Metrics, Incidents, Alerts, RCA
│   ├── services/          # alertEngine, anomalyProcessor, metricsQueue
│   ├── models/            # Mongoose schemas
│   └── __tests__/         # Jest integration tests
├── ai-service/            # FastAPI anomaly detection
│   ├── routers/           # predict, train, status
│   ├── scripts/           # generate_dataset, train_model
│   └── models/            # trained artifacts
├── simulator/             # Metric data simulator
├── nginx/                 # Reverse proxy config
└── scripts/               # deploy.ps1, monitor.ps1, loadtest.js
```

---

## Key Design Decisions

**Why Isolation Forest?** Unsupervised anomaly detection — no labelled data needed in production. Trains only on normal behaviour and flags deviations.

**Why Redis as queue?** Decouples metric ingestion from MongoDB writes. Enables bulk inserts and prevents write bottlenecks under load.

**Why n8n?** Self-hosted workflow automation with no per-execution cost. Visual workflow builder makes it easy to add new notification channels.

**Why Groq for RCA?** Low latency (< 2s for structured JSON), free tier sufficient for development, same pattern as production LLM usage.

---

## License

MIT
