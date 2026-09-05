<div align="center">

# ⚡ Pulse_Ops

### AI-Powered DevOps Incident Intelligence Platform

**Detect anomalies. Understand incidents. Automate response.**

PulseOps is a real-time infrastructure monitoring and incident intelligence platform that combines  
**AI anomaly detection**, **automated incident management**,  
**LLM-powered root cause analysis**, and **multi-channel alert automation**.

</div>

<p align="center">
  <a href="https://github.com/Atharvverma1234/PulseOps">
    <img src="https://img.shields.io/badge/GitHub-PulseOps-181717?style=for-the-badge&logo=github" />
  </a>
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/FastAPI-0.139-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/AI-Anomaly%20Detection-purple?style=flat-square" />
  <img src="https://img.shields.io/badge/Real--Time-Socket.IO-orange?style=flat-square" />
  <img src="https://img.shields.io/badge/Automation-n8n-EA4B71?style=flat-square" />
  <img src="https://img.shields.io/badge/LLM-Groq-black?style=flat-square" />
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" />
</p>

---

## 🎯 What is PulseOps?

Modern infrastructure can fail long before a traditional threshold-based alert fires.

A server may gradually consume more memory, experience unusual CPU behaviour, generate abnormal traffic, or exhibit a combination of subtle signals that individually look harmless.

**PulseOps turns raw infrastructure metrics into actionable incident intelligence.**

Instead of:

```text
Metric → Threshold → Alert
```

PulseOps follows:

```text
Infrastructure Metrics
        ↓
Real-Time Ingestion
        ↓
AI Anomaly Detection
        ↓
Risk Scoring
        ↓
Incident Creation
        ↓
LLM Root Cause Analysis
        ↓
Recommended Response
        ↓
Automated Notifications
```

The result is a system designed to help engineering teams move from:

> **"Something is wrong."**

to:

> **"This is what happened, why it happened, how serious it is, and what should happen next."**

---

# ✨ Core Features

<table>
<tr>
<td width="50%">

### 📡 Real-Time Infrastructure Monitoring

* Live metric streaming
* Socket.IO powered updates
* CPU, memory, disk and network monitoring
* Per-host metric visualization
* Historical metric analysis
* Recharts-based dashboards

</td>
<td width="50%">

### 🤖 AI Anomaly Detection

* Isolation Forest model
* Unsupervised anomaly detection
* Continuous anomaly scoring
* Per-host risk analysis
* Score history
* Anomaly trend visualization

</td>
</tr>

<tr>
<td>

### 🚨 Intelligent Incident Management

* Automatic incident creation
* Incident severity classification
* Incident lifecycle tracking
* Open → Investigating → Resolved workflow
* Incident timeline
* Incident statistics

</td>
<td>

### 🧠 AI Root Cause Analysis

* Groq-powered LLM analysis
* Structured RCA generation
* Metric-aware reasoning
* Incident summaries
* Root cause identification
* Suggested remediation

</td>
</tr>

<tr>
<td>

### 🔔 Alert Engine

* Configurable threshold rules
* Cooldown-based deduplication
* Alert severity
* Host-specific alerts
* Alert history
* Automated escalation

</td>
<td>

### ⚙️ Workflow Automation

* Self-hosted n8n
* Webhook-based automation
* Slack notifications
* Telegram notifications
* Email notifications
* Extensible workflow architecture

</td>
</tr>
</table>

---

# 🖥️ Platform Overview

### Live Operations Dashboard

> Real-time infrastructure visibility with anomaly scores, host health, alerts and incident activity.

<img width="1917" height="1078" alt="Screenshot 2026-08-27 005557" src="https://github.com/user-attachments/assets/b6418d63-d883-4f8f-a753-de449f851c93" />


---

### 🚨 Incident Intelligence

Track incidents from initial detection through investigation and resolution.

```text
┌──────────────────────────────────────────────────────────┐
│                     INCIDENT                             │
├──────────────────────────────────────────────────────────┤
│ Severity       CRITICAL                                  │
│ Host           server-02                                 │
│ Status         INVESTIGATING                             │
│ Anomaly Score  0.94                                      │
│                                                          │
│ Timeline                                                 │
│                                                          │
│  14:21  Anomaly detected                                 │
│  14:22  Incident automatically created                   │
│  14:22  Risk score calculated                            │
│  14:23  AI RCA generated                                 │
│  14:24  Slack escalation triggered                       │
└──────────────────────────────────────────────────────────┘
```
<img width="1917" height="1077" alt="Screenshot 2026-08-27 005741" src="https://github.com/user-attachments/assets/d22cfb55-f54e-4553-bbed-06fcf0fac967" />

---

### 🧠 AI Root Cause Analysis

PulseOps converts raw telemetry into an engineering-friendly explanation.

```text
┌──────────────────────────────────────────────────────────┐
│ AI ROOT CAUSE ANALYSIS                                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Root Cause                                               │
│ Elevated CPU utilization combined with abnormal          │
│ memory pressure on server-02.                            │
│                                                          │
│ Confidence                                               │
│ High                                                     │
│                                                          │
│ Impact                                                   │
│ Increased request latency and potential service          │
│ degradation.                                             │
│                                                          │
│ Recommended Action                                       │
│ Investigate high-consumption processes and evaluate      │
│ recent deployments on the affected host.                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```
<img width="1901" height="1078" alt="Screenshot 2026-08-29 000328" src="https://github.com/user-attachments/assets/4ca9acc3-07b4-4e1f-8fc8-735f388e47a8" />

---

# 🏗️ Architecture

```text
                              ┌─────────────────────┐
                              │    React + Vite     │
                              │     Dashboard       │
                              └──────────┬──────────┘
                                         │
                              REST + Socket.IO
                                         │
                              ┌──────────▼──────────┐
                              │   Node.js / Express │
                              │      Backend        │
                              └─────┬────┬────┬─────┘
                                    │    │    │
                   ┌────────────────┘    │    └─────────────────┐
                   │                     │                      │
          ┌────────▼────────┐   ┌────────▼────────┐   ┌───────▼────────┐
          │     MongoDB     │   │      Redis      │   │      n8n       │
          │                 │   │                 │   │                │
          │ Metrics         │   │ Queue / Cache   │   │ Automation     │
          │ Incidents       │   │ Async Processing│   │ Webhooks       │
          │ Alerts          │   │                 │   │                │
          └─────────────────┘   └────────┬────────┘   └───────┬────────┘
                                         │                    │
                                         │                    ├── Slack
                                         │                    ├── Telegram
                                         │                    └── Email
                                         │
                              ┌──────────▼──────────┐
                              │   FastAPI AI        │
                              │      Service        │
                              ├─────────────────────┤
                              │ Isolation Forest    │
                              │ Anomaly Scoring     │
                              │ Model Management    │
                              └──────────┬──────────┘
                                         │
                              ┌──────────▼──────────┐
                              │      Groq LLM       │
                              │ Root Cause Analysis │
                              └─────────────────────┘
```

---

# 🔄 How PulseOps Works

### 01 — Metric Collection

Infrastructure metrics are continuously generated by the simulator or connected infrastructure agents.

```text
server-01
server-02  ───────►  PulseOps
server-03
```

### 02 — Metric Ingestion

The Node.js backend receives individual or batched metric payloads.

```http
POST /api/metrics
POST /api/metrics/bulk
```

### 03 — Queue-Based Processing

Redis decouples high-volume metric ingestion from database persistence and downstream processing.

```text
Incoming Metrics
      ↓
    Redis
      ↓
Async Processing
      ↓
   MongoDB
```

### 04 — AI Anomaly Detection

The FastAPI service evaluates infrastructure behaviour using an Isolation Forest model.

```text
Metric
  ↓
Feature Extraction
  ↓
Isolation Forest
  ↓
Anomaly Score
  ↓
Normal / Anomalous
```

### 05 — Risk Calculation

PulseOps aggregates anomaly behaviour to determine host-level operational risk.

```text
Anomaly Frequency
       +
Peak Anomaly Score
       +
Recent Behaviour
       ↓
   Risk Score
```

### 06 — Incident Creation

When an anomaly satisfies incident conditions, PulseOps creates an incident and records its timeline.

```text
Anomaly
   ↓
Incident Engine
   ↓
Severity
   ↓
Incident Created
```

### 07 — AI Root Cause Analysis

The incident context is passed to the Groq LLM to generate a structured explanation.

```text
Incident
   +
Metrics
   +
Anomaly Information
   ↓
Groq LLM
   ↓
Structured RCA
```

### 08 — Automated Escalation

n8n receives webhook events and triggers the configured notification workflow.

```text
PulseOps
   ↓
Webhook
   ↓
  n8n
 ┌─┴──────┬─────────┐
 ↓        ↓         ↓
Slack  Telegram   Email
```

---

# 🧠 AI Architecture

PulseOps uses a two-layer intelligence system.

## Layer 1 — Statistical Anomaly Detection

The Isolation Forest model detects unusual infrastructure behaviour without requiring labelled production failure data.

### Why Isolation Forest?

Traditional monitoring often depends on fixed rules:

```text
IF CPU > 90%
THEN ALERT
```

This can miss gradual or contextual anomalies.

PulseOps instead learns the characteristics of normal behaviour and identifies observations that are statistically unusual.

```text
Normal Behaviour
████████████████████████████

                         █
                        █
                       █
                  Anomaly
```

This makes the system suitable for environments where labelled failure datasets are limited.

---

## Layer 2 — LLM Incident Intelligence

Once an incident is identified, the LLM provides human-readable reasoning.

```text
Telemetry
    ↓
Anomaly Detection
    ↓
Incident Context
    ↓
   LLM
    ↓
┌───────────────────────┐
│ Root Cause            │
│ Impact                │
│ Severity              │
│ Explanation           │
│ Recommendation        │
└───────────────────────┘
```

This separation keeps **machine detection** and **language-based reasoning** as distinct components.

---

# 📊 Risk Scoring

PulseOps provides host-level risk visibility rather than simply displaying individual alerts.

The dashboard tracks:

* Anomaly frequency
* Peak anomaly score
* Recent anomaly behaviour
* Host-level risk
* Historical score trends

Example:

```text
Host              Risk

server-01         ███████░░░  71%
server-02         ██████████  94%
server-03         ████░░░░░░  38%
```

This allows operators to prioritize the infrastructure that requires attention first.

---

# 🛠️ Tech Stack

| Layer                | Technology                      |
| -------------------- | ------------------------------- |
| **Frontend**         | React 18, Vite, Tailwind CSS v4 |
| **Visualization**    | Recharts                        |
| **Real-Time**        | Socket.IO                       |
| **Backend**          | Node.js 20, Express             |
| **Database ODM**     | Mongoose                        |
| **AI Service**       | FastAPI                         |
| **ML**               | Scikit-learn, Isolation Forest  |
| **LLM**              | Groq                            |
| **Queue / Cache**    | Redis 7                         |
| **Automation**       | n8n                             |
| **Notifications**    | Slack, Telegram, Email          |
| **Database**         | MongoDB 7                       |
| **Reverse Proxy**    | Nginx                           |
| **Containerization** | Docker / Docker Compose         |
| **Testing**          | Jest                            |
| **Load Testing**     | Custom Node.js load-test script |

---

# 📁 Project Structure

```text
PulseOps/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard
│   │   │   ├── Incidents
│   │   │   ├── Alerts
│   │   │   ├── AI
│   │   │   └── Automation
│   │   │
│   │   ├── components/
│   │   └── hooks/
│   │       ├── useMetrics
│   │       ├── useAlerts
│   │       └── useRiskScores
│   │
│   └── ...
│
├── backend/
│   ├── controllers/
│   │   ├── auth
│   │   ├── metrics
│   │   ├── incidents
│   │   ├── alerts
│   │   └── rca
│   │
│   ├── services/
│   │   ├── alertEngine
│   │   ├── anomalyProcessor
│   │   └── metricsQueue
│   │
│   ├── models/
│   ├── routes/
│   └── __tests__/
│
├── ai-service/
│   ├── routers/
│   │   ├── predict
│   │   ├── train
│   │   └── status
│   │
│   ├── scripts/
│   │   ├── generate_dataset
│   │   └── train_model
│   │
│   └── models/
│
├── simulator/
│   └── simulate.js
│
├── nginx/
│   └── nginx.conf
│
├── scripts/
│   ├── deploy.ps1
│   ├── deploy.sh
│   ├── monitor.ps1
│   └── loadtest.js
│
├── docker-compose.yml
└── README.md
```

---

# 🚀 Quick Start

## Prerequisites

Make sure you have:

* Docker Desktop
* Node.js 20+
* Python 3.11+
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/Atharvverma1234/PulseOps.git
cd PulseOps
```

---

## 2. Configure Environment Variables

```bash
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
```

Configure the backend environment:

```env
MONGO_URI=mongodb://mongo:27017/pulseops
JWT_SECRET=your_secret_here
GROQ_API_KEY=gsk_your_key_here
```

> Never commit `.env` files or API keys to Git.

---

## 3. Train the AI Model

```bash
cd ai-service

python -m venv .venv
```

### Windows

```bash
.venv\Scripts\activate
```

### Linux / macOS

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Generate the training dataset:

```bash
python scripts/generate_dataset.py
```

Train the model:

```bash
python scripts/train_model.py
```

---

## 4. Start the Platform

From the project root:

```bash
docker compose up --build
```

This starts the core PulseOps infrastructure:

```text
Frontend
Backend
AI Service
MongoDB
Redis
n8n
Nginx
```

---

## 5. Start the Metric Simulator

In another terminal:

```bash
node simulator/simulate.js
```

The simulator continuously generates infrastructure metrics for multiple hosts.

Example:

```text
PulseOps Simulator

✓ Simulator started
✓ Pushing metrics every 5s

Hosts:
  • server-01
  • server-02
  • server-03
```

---

## 6. Open PulseOps

```text
http://localhost:5173
```

Register an account and open the dashboard.

You should now see infrastructure metrics streaming in real time.

---

# 🔌 API Reference

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Register

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password",
  "role": "engineer"
}
```

---

## Metrics

```http
POST /api/metrics
POST /api/metrics/bulk

GET /api/metrics
GET /api/metrics/latest
GET /api/metrics/stats/:host
```

---

## Incidents

```http
POST  /api/incidents
GET   /api/incidents
GET   /api/incidents/:id
PATCH /api/incidents/:id
POST  /api/incidents/:id/timeline
GET   /api/incidents/stats
```

---

## AI & Risk

```http
POST /api/rca/:id/generate

GET /api/rca/stats
GET /api/ai/risk-summary
GET /api/ai/anomalies
GET /api/ai/score-history/:host
```

---

## AI Service

```http
POST /predict
POST /predict/bulk

GET  /model/status

POST /train
```

---

# 🧪 Testing

Run the backend test suite:

```bash
cd backend

npm test
```

Generate coverage:

```bash
npm run test:coverage
```

---

## ⚡ Load Testing

PulseOps includes a custom metric ingestion load-test script.

```bash
node scripts/loadtest.js
```

Example configuration:

```text
Target:
  localhost:5000

Endpoint:
  /api/metrics/bulk

Concurrency:
  10

Requests:
  200

Batch Size:
  5
```

This can be used to evaluate the metric ingestion pipeline under concurrent traffic.

---

# 🐳 Docker Architecture

PulseOps is designed as a multi-service containerized system.

```text
                    Docker Compose
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
   Frontend            Backend            AI Service
       │                  │                  │
       │             ┌────┴────┐             │
       │             │         │             │
       │          MongoDB    Redis           │
       │                                     │
       └──────────────────┬──────────────────┘
                          │
                        Nginx
                          │
                        Client
```

This makes the platform easy to reproduce locally and provides a foundation for production deployment.

---

# ⚙️ Deployment

## Development

```bash
docker compose up --build
```

## Production — Windows

```powershell
.\scripts\deploy.ps1
```

## Production — Linux / macOS

```bash
./scripts/deploy.sh
```

## Health Monitoring

```powershell
.\scripts\monitor.ps1
```

---

# 🧩 Key Engineering Decisions

## Why Isolation Forest?

Production infrastructure rarely provides perfectly labelled datasets containing every possible failure mode.

Isolation Forest provides an unsupervised approach that learns normal behaviour and identifies unusual observations.

**Benefits:**

* No labelled production failures required
* Lightweight inference
* Suitable for numerical telemetry
* Easy to retrain
* Works well as an anomaly scoring layer

---

## Why Redis?

Directly writing every incoming metric to MongoDB can create unnecessary pressure during traffic spikes.

Redis acts as a buffering and processing layer:

```text
High-volume ingestion
        ↓
      Redis
        ↓
Batch processing
        ↓
     MongoDB
```

This separates ingestion from persistence and provides a more resilient processing pipeline.

---

## Why n8n?

Incident response frequently requires integrations with external systems.

Instead of hard-coding every integration into the backend, PulseOps delegates workflow orchestration to n8n.

```text
PulseOps Event
      ↓
   Webhook
      ↓
     n8n
   ↙  ↓  ↘
Slack Telegram Email
```

New integrations can therefore be added without heavily modifying the core application.

---

## Why Groq?

Root cause analysis is an interactive operation where response latency matters.

Groq provides low-latency LLM inference suitable for generating structured incident analysis while keeping the LLM layer independent from the anomaly detection system.

---

# 🔐 Security Considerations

PulseOps includes several backend security mechanisms:

* JWT-based authentication
* Protected API routes
* Request rate limiting
* Authentication-specific rate limiting
* Environment-based secrets
* Helmet security middleware
* CORS configuration
* Input validation
* Cooldown-based alert deduplication

Secrets should always be supplied through environment variables rather than committed to source control.

---

# 📈 Incident Lifecycle

```text
             ┌──────────────┐
             │   DETECTED   │
             └──────┬───────┘
                    │
                    ▼
             ┌──────────────┐
             │     OPEN     │
             └──────┬───────┘
                    │
                    ▼
          ┌─────────────────────┐
          │   INVESTIGATING     │
          └──────────┬──────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │      RESOLVED       │
          └─────────────────────┘
```

Every transition can be represented in the incident timeline, creating an operational history that can be used for investigation and post-incident analysis.

---

# 🌐 Observability Pipeline

PulseOps brings together four traditionally separate layers:

```text
┌─────────────────────────────────────────────────────────┐
│                    OBSERVABILITY                        │
│                                                         │
│  Metrics ───────► AI Detection ───────► Risk            │
│                                             │           │
│                                             ▼           │
│                                        Incident         │
│                                             │           │
│                                             ▼           │
│                                      AI Root Cause      │
│                                             │           │
│                                             ▼           │
│                                        Automation       │
│                                             │           │
│                                    ┌────────┼────────┐  │
│                                    ▼        ▼        ▼  │
│                                  Slack  Telegram  Email │
└─────────────────────────────────────────────────────────┘
```

---

# 🗺️ Roadmap

The architecture is intentionally designed to support future expansion.

### Completed

* [x] Real-time infrastructure dashboard
* [x] Socket.IO metric streaming
* [x] MongoDB metric persistence
* [x] Redis processing layer
* [x] Isolation Forest anomaly detection
* [x] Host-level risk scoring
* [x] Incident lifecycle management
* [x] AI-powered RCA
* [x] Alert engine
* [x] n8n automation
* [x] Slack / Telegram / Email workflows
* [x] Docker Compose deployment
* [x] Load testing
* [x] Backend test suite

### Future

* [ ] Kubernetes integration
* [ ] Prometheus integration
* [ ] Grafana integration
* [ ] Distributed tracing
* [ ] Predictive incident detection
* [ ] Automatic remediation
* [ ] Multi-tenant organizations
* [ ] SSO / OAuth
* [ ] Advanced incident correlation
* [ ] Historical incident learning

---

# 💡 What Makes PulseOps Different?

Traditional monitoring answers:

> **"Did a threshold get crossed?"**

PulseOps aims to answer:

> **"Is this behaviour unusual, how risky is it, what caused it, and what should the team do next?"**

### Traditional Monitoring

```text
Metric
  ↓
Static Threshold
  ↓
Alert
  ↓
Human Investigation
```

### PulseOps

```text
Metric
  ↓
AI Anomaly Detection
  ↓
Risk Scoring
  ↓
Incident Intelligence
  ↓
LLM Root Cause Analysis
  ↓
Recommended Action
  ↓
Automated Escalation
```

The goal isn't simply to generate more alerts.

**The goal is to reduce the amount of investigation required after an alert occurs.**

---

# 🏆 Built With

<p align="center">

<img src="https://skillicons.dev/icons?i=react,vite,tailwind,nodejs,express,mongodb,redis,python,fastapi,docker,nginx,git,github" />

</p>

<p align="center">

<strong>React • Node.js • Express • FastAPI • Python • Scikit-learn • MongoDB • Redis • Groq • n8n • Docker</strong>

</p>

---

# 👨‍💻 Author

<p align="center">

<strong>Atharv Verma</strong>

<br/>

Electrical & Electronics Engineering Student
Dayananda Sagar College of Engineering, Bengaluru

<br/>
<a href="https://github.com/Atharvverma1234">
  <img src="https://img.shields.io/badge/GitHub-Atharvverma1234-181717?style=for-the-badge&logo=github" />
</a>
</p>

---

# 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">

### ⚡ PulseOps

<strong>Observe → Detect → Understand → Respond</strong>

<br/><br/>

Built to make infrastructure incidents less reactive and more intelligent.

</p>
