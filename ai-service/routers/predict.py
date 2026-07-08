# ai-service/routers/predict.py
import os
import json
import joblib
import numpy   as np
from fastapi   import APIRouter, HTTPException
from pydantic  import BaseModel, Field
from typing    import List, Optional
from features  import engineer_features, FEATURE_NAMES

router = APIRouter()

# ── Load model artifacts at startup ──────────
MODEL_DIR  = os.path.join(os.path.dirname(__file__), '..', 'models')

def load_artifacts():
    model_path     = os.path.join(MODEL_DIR, 'isolation_forest.pkl')
    scaler_path    = os.path.join(MODEL_DIR, 'scaler.pkl')
    threshold_path = os.path.join(MODEL_DIR, 'threshold.txt')
    meta_path      = os.path.join(MODEL_DIR, 'model_meta.json')

    if not os.path.exists(model_path):
        return None, None, None, None

    model     = joblib.load(model_path)
    scaler    = joblib.load(scaler_path)

    with open(threshold_path) as f:
        threshold = float(f.read().strip())

    with open(meta_path) as f:
        meta = json.load(f)

    return model, scaler, threshold, meta

model, scaler, THRESHOLD, MODEL_META = load_artifacts()

# ── Request / Response schemas ────────────────
class MetricInput(BaseModel):
    cpu:         float = Field(..., ge=0, le=100, description="CPU usage %")
    memory:      float = Field(..., ge=0, le=100, description="Memory usage %")
    disk:        float = Field(..., ge=0, le=100, description="Disk usage %")
    network_in:  float = Field(0.0, ge=0,        description="Network in bytes/sec")
    network_out: float = Field(0.0, ge=0,        description="Network out bytes/sec")
    host:        Optional[str] = None

class BulkMetricInput(BaseModel):
    metrics: List[MetricInput]

class PredictResponse(BaseModel):
    host:          Optional[str]
    anomaly_score: float
    is_anomaly:    bool
    severity:      str
    confidence:    str
    features_used: List[str]

def score_to_severity(score: float, is_anomaly: bool) -> str:
    if not is_anomaly:
        return 'normal'
    if score >= 0.85:
        return 'critical'
    if score >= 0.75:
        return 'high'
    if score >= 0.65:
        return 'medium'
    return 'low'

def score_to_confidence(score: float) -> str:
    if score >= 0.85:
        return 'high'
    if score >= 0.65:
        return 'medium'
    return 'low'

def predict_single(metric: MetricInput) -> dict:
    if model is None:
        # Fallback: rule-based if model not trained yet
        avg        = (metric.cpu + metric.memory + metric.disk) / 3
        is_anomaly = avg > 80 or metric.cpu > 90 or metric.memory > 90
        score      = round(avg / 100, 3)
        return {
            'host':          metric.host,
            'anomaly_score': score,
            'is_anomaly':    is_anomaly,
            'severity':      score_to_severity(score, is_anomaly),
            'confidence':    'low',
            'features_used': FEATURE_NAMES,
        }

    # Engineer features
    feat_values = engineer_features(
        cpu         = metric.cpu,
        memory      = metric.memory,
        disk        = metric.disk,
        network_in  = metric.network_in,
        network_out = metric.network_out,
    )
    X = np.array([feat_values])

    # Scale
    X_scaled = scaler.transform(X)

    # Get raw anomaly score from model
    raw_score    = model.score_samples(X_scaled)[0]
    score_min    = MODEL_META['score_min']
    score_max    = MODEL_META['score_max']

    # Normalise to 0-1 (0 = normal, 1 = max anomaly)
    norm_score   = float(
        1 - (raw_score - score_min) / (score_max - score_min)
    )
    norm_score   = max(0.0, min(1.0, norm_score))

    is_anomaly   = norm_score >= THRESHOLD

    return {
        'host':          metric.host,
        'anomaly_score': round(norm_score, 4),
        'is_anomaly':    is_anomaly,
        'severity':      score_to_severity(norm_score, is_anomaly),
        'confidence':    score_to_confidence(norm_score),
        'features_used': FEATURE_NAMES,
    }

# ── Endpoints ─────────────────────────────────
@router.post('/predict', response_model=PredictResponse)
def predict(metric: MetricInput):
    """
    Predict anomaly score for a single metric reading.
    """
    return predict_single(metric)

@router.post('/predict/bulk')
def predict_bulk(payload: BulkMetricInput):
    """
    Predict anomaly scores for a batch of metrics.
    """
    results = [predict_single(m) for m in payload.metrics]
    anomalies = [r for r in results if r['is_anomaly']]
    return {
        'total':     len(results),
        'anomalies': len(anomalies),
        'results':   results,
    }