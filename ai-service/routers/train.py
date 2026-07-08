# ai-service/routers/train.py
import os
import json
import subprocess
import sys
from fastapi  import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing   import Optional

router = APIRouter()

# Track training state
training_status = {
    'running':    False,
    'last_run':   None,
    'last_result': None,
    'error':      None,
}

def run_training():
    training_status['running'] = True
    training_status['error']   = None

    script_path = os.path.join(
        os.path.dirname(__file__), '..', 'scripts', 'train_model.py'
    )

    try:
        result = subprocess.run(
            [sys.executable, script_path],
            capture_output = True,
            text           = True,
            timeout        = 300,  # 5 min max
        )

        if result.returncode == 0:
            training_status['last_result'] = 'success'
            training_status['last_run']    = __import__('datetime').datetime.utcnow().isoformat()

            # Reload model artifacts in predict router
            from routers.predict import load_artifacts
            import routers.predict as predict_module
            (
                predict_module.model,
                predict_module.scaler,
                predict_module.THRESHOLD,
                predict_module.MODEL_META,
            ) = load_artifacts()

            print("[Train] Model retrained and reloaded successfully")
        else:
            training_status['last_result'] = 'failed'
            training_status['error']       = result.stderr
            print(f"[Train] Training failed:\n{result.stderr}")

    except Exception as e:
        training_status['last_result'] = 'error'
        training_status['error']       = str(e)
        print(f"[Train] Exception during training: {e}")
    finally:
        training_status['running'] = False

@router.post('/train')
def trigger_training(background_tasks: BackgroundTasks):
    """
    Trigger model retraining in the background.
    """
    if training_status['running']:
        raise HTTPException(
            status_code = 409,
            detail      = 'Training already in progress'
        )

    background_tasks.add_task(run_training)
    return {
        'message': 'Training started in background',
        'status':  'running',
    }

@router.get('/train/status')
def get_training_status():
    """
    Check training status.
    """
    return training_status