## Auth
POST /api/auth/register  { name, email, password } -> { token, user }
POST /api/auth/login     { email, password } -> { token, user }

## Metrics
POST /api/metrics        { host, cpu, memory, disk, network, timestamp }
GET  /api/metrics?host=&from=&to=

## Incidents
POST /api/incidents
GET  /api/incidents?status=&severity=
PATCH /api/incidents/:id

## AI Service (FastAPI)
POST /predict  { features: [...] } -> { anomaly_score, is_anomaly }