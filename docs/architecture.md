# PulseOps Architecture

## Request Flow

```
Browser
  │
  ├── GET /          → Nginx → Frontend (React SPA)
  ├── POST /api/*    → Nginx → Backend (Node.js)
  ├── WS /socket.io  → Nginx → Backend (Socket.IO)
  └── GET /ai-api/*  → Nginx → AI Service (FastAPI)

Backend
  │
  ├── MongoDB    → metrics, incidents, alerts, users, logs
  ├── Redis      → metrics ingestion queue (lPush/rPop)
  ├── AI Service → /predict/bulk on every metric flush
  ├── n8n        → webhook POST on incident/alert events
  └── Groq API   → chat completion for RCA generation

AI Service
  │
  ├── Isolation Forest model (.pkl)
  ├── StandardScaler (.pkl)
  └── Threshold calibration (threshold.txt)

n8n Workflows
  │
  ├── incident.created  → Slack + Telegram
  ├── alert.critical    → Slack + Telegram
  ├── incident.resolved → Email
  └── digest.daily      → Email (Cron)
```

## Data Flow — Metric Ingestion

```
Simulator/Agent
    │ POST /api/metrics/bulk
    ▼
Backend Controller
    │ enqueueMetric()
    ▼
Redis Queue (metrics:queue)
    │ flushMetricsToMongo() every 3s
    ▼
MongoDB (metrics collection)
    │                    │
    ▼                    ▼
Socket.IO broadcast   AI Service (/predict/bulk)
(metrics:update)          │
    │                 anomalyScore + isAnomaly
    ▼                     │
Frontend Dashboard    MongoDB update + incident creation
                          │
                      Socket.IO (ai:scores)
                          │
                      Frontend risk overlay
```