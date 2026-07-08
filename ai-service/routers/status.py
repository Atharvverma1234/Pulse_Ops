# ai-service/routers/status.py
import os
import json
from fastapi  import APIRouter
from datetime import datetime

router = APIRouter()

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')

@router.get('/model/status')
def model_status():
    """
    Return current model metadata and health.
    """
    meta_path      = os.path.join(MODEL_DIR, 'model_meta.json')
    threshold_path = os.path.join(MODEL_DIR, 'threshold.txt')
    model_path     = os.path.join(MODEL_DIR, 'isolation_forest.pkl')

    if not os.path.exists(model_path):
        return {
            'model_loaded': False,
            'message':      'Model not trained yet. POST /train to train.',
        }

    meta = {}
    if os.path.exists(meta_path):
        with open(meta_path) as f:
            meta = json.load(f)

    threshold = None
    if os.path.exists(threshold_path):
        with open(threshold_path) as f:
            threshold = float(f.read().strip())

    # Get model file size
    model_size_kb = os.path.getsize(model_path) // 1024

    return {
        'model_loaded':   True,
        'model_type':     'IsolationForest',
        'n_estimators':   meta.get('n_estimators'),
        'contamination':  meta.get('contamination'),
        'threshold':      threshold,
        'feature_names':  meta.get('feature_names'),
        'train_size':     meta.get('train_size'),
        'anomaly_count':  meta.get('anomaly_count'),
        'normal_count':   meta.get('normal_count'),
        'model_size_kb':  model_size_kb,
    }

@router.get('/health')
def health():
    model_path = os.path.join(MODEL_DIR, 'isolation_forest.pkl')
    return {
        'status':       'ok',
        'service':      'PulseOps AI',
        'model_ready':  os.path.exists(model_path),
        'timestamp':    datetime.utcnow().isoformat(),
    }