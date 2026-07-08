# ai-service/main.py
from fastapi              import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers              import predict, train, status
import os

app = FastAPI(
    title       = 'PulseOps AI Service',
    description = 'Isolation Forest anomaly detection for infrastructure metrics',
    version     = '1.0.0',
)

# CORS — allow Node backend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins  = ['*'],
    allow_methods  = ['*'],
    allow_headers  = ['*'],
)

# ── Routers ───────────────────────────────────
app.include_router(status.router,  tags=['Health'])
app.include_router(predict.router, tags=['Prediction'])
app.include_router(train.router,   tags=['Training'])

# ── Root ──────────────────────────────────────
@app.get('/')
def root():
    return {
        'service':   'PulseOps AI',
        'version':   '1.0.0',
        'endpoints': [
            'GET  /health',
            'GET  /model/status',
            'POST /predict',
            'POST /predict/bulk',
            'POST /train',
            'GET  /train/status',
            'GET  /docs',
        ],
    }