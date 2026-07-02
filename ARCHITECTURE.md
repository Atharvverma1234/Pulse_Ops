# PulseOps Architecture

Client (React) 
  → REST + Socket.IO → Backend (Node/Express)
       → MongoDB (persistent storage)
       → Redis (queue/cache)
       → FastAPI AI Service (anomaly detection)
       → n8n (automation webhooks)
       → Nginx (reverse proxy, entry point)