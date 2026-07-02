# ai-service/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="PulseOps AI Service")

class MetricInput(BaseModel):
    features: List[float]  # [cpu, memory, disk, network]

@app.get("/health")
def health():
    return {"status": "ok", "service": "PulseOps AI"}

@app.post("/predict")
def predict(input: MetricInput):
    # Placeholder logic until Week 7 when Isolation Forest is trained
    avg = sum(input.features) / len(input.features)
    is_anomaly = avg > 80
    return {
        "anomaly_score": round(avg, 2),
        "is_anomaly": is_anomaly,
        "severity": "high" if avg > 90 else "medium" if avg > 80 else "normal"
    }