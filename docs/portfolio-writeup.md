# PulseOps — Portfolio Writeup

## One-Line Summary
AI-powered DevOps monitoring platform that detects infrastructure anomalies 
in real time, auto-creates incidents, generates LLM root cause analyses, 
and delivers multi-channel alerts via automated workflows.

---

## Problem I Solved
Engineering teams lose hours to alert fatigue and manual root cause 
investigation. PulseOps collapses the detection → diagnosis → notification 
pipeline into a single automated system.

---

## What I Built (12 weeks, solo)

### Full-Stack Architecture
- React + Socket.IO dashboard with live Recharts area charts
- Node.js/Express REST API with JWT auth, RBAC, rate limiting
- FastAPI microservice serving a trained Isolation Forest model
- MongoDB for persistence, Redis as a metrics ingestion queue
- Nginx reverse proxy with rate limiting and security headers
- All orchestrated via Docker Compose (7 services, one command)

### AI/ML Pipeline
- Generated 5,300 training samples with realistic metric distributions
- Trained Isolation Forest on normal-only data (unsupervised approach)
- Feature engineering: composite resource pressure score, CPU×memory 
  interaction term, normalised network throughput
- 93.1% ROC-AUC on held-out test set
- Model scores every metric batch within 50ms via FastAPI /predict/bulk
- Anomaly scores stored on metric documents, streamed to dashboard

### Intelligent Automation
- Alert engine evaluates 6 threshold rules per metric flush
- Cooldown deduplication prevents alert storms (5–15 min windows)
- n8n automation delivers rich Slack blocks, Telegram messages, 
  and HTML emails on incident/alert events with retry + backoff
- Groq LLM generates structured RCA JSON (summary, root cause, 
  impact, recommendations, confidence) from correlated metric/alert context

### Production Engineering
- Multi-stage Docker builds (Node builder → Nginx static serve)
- Non-root users in all containers
- Health checks on all 7 services with start_period and retries
- Resource limits (CPU + memory) per service
- JSON log rotation, named volumes for data persistence
- One-command deployment script with pre-flight checks

---

## Technical Challenges

**Challenge:** Redis queue on Windows Docker had volume mount conflicts 
that caused node_modules to be overwritten on container restart.
**Solution:** Anonymous volume mount `/app/node_modules` to shadow 
the bind mount, preserving container-installed packages.

**Challenge:** Isolation Forest contamination parameter needs to match 
actual anomaly rate or precision collapses.
**Solution:** Computed contamination dynamically from dataset label ratio 
rather than hardcoding, and calibrated threshold from 95th percentile 
of normal sample scores on held-out validation set.

**Challenge:** n8n Telegram node was routing through local Nginx instead 
of api.telegram.org due to Docker DNS resolution order.
**Solution:** Replaced built-in Telegram node with HTTP Request node 
pointing directly to https://api.telegram.org/bot{token}/sendMessage, 
bypassing credential URL resolution entirely.

---

## Numbers
- 1,000+ metrics/minute ingestion capacity (load tested)
- 93.1% ROC-AUC on anomaly detection
- < 50ms AI scoring latency per batch
- 24 passing integration tests
- 7 Docker services, one-command deployment
- 12 weeks, solo build

---

## Skills Demonstrated
Full-stack engineering (React, Node.js, FastAPI, Python)
AI/ML integration (Isolation Forest, feature engineering, model serving)
Real-time systems (Socket.IO, Redis queues)
Automation workflows (n8n, webhooks, retry logic)
DevOps practices (Docker, multi-stage builds, health checks)
LLM integration (Groq, prompt engineering, structured output parsing)