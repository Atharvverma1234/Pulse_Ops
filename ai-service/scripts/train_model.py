# ai-service/scripts/train_model.py
import sys
import os

# Make sure parent dir is in path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pandas  as pd
import numpy   as np
import joblib
from sklearn.ensemble           import IsolationForest
from sklearn.preprocessing      import StandardScaler
from sklearn.metrics            import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
)
from sklearn.model_selection    import train_test_split
from features                   import engineer_features_from_df, FEATURE_NAMES

# ── Config ────────────────────────────────────
DATA_PATH   = os.path.join(os.path.dirname(__file__), '..', 'data', 'metrics_dataset.csv')
MODEL_DIR   = os.path.join(os.path.dirname(__file__), '..', 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

# ── Load data ─────────────────────────────────
print("Loading dataset...")
df = pd.read_csv(DATA_PATH)
print(f"Loaded {len(df)} rows — {(df.label==0).sum()} normal, {(df.label==1).sum()} anomalies")

# ── Feature engineering ───────────────────────
print("\nEngineering features...")
X = engineer_features_from_df(df)
y = df['label'].values  # 0 = normal, 1 = anomaly

print(f"Features: {FEATURE_NAMES}")
print(f"Feature matrix shape: {X.shape}")

# ── Train/test split ──────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"\nTrain: {len(X_train)} | Test: {len(X_test)}")

# ── Scale features ────────────────────────────
# IsolationForest is tree-based (scaling not strictly required)
# but helps with interpretability of anomaly scores
print("\nFitting scaler...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)

# ── Train Isolation Forest ────────────────────
# contamination = expected % of anomalies in data
CONTAMINATION = len(df[df.label == 1]) / len(df)
print(f"\nTraining Isolation Forest (contamination={CONTAMINATION:.3f})...")

model = IsolationForest(
    n_estimators  = 200,       # more trees = more stable
    contamination = CONTAMINATION,
    max_samples   = 'auto',
    random_state  = 42,
    n_jobs        = -1,        # use all CPU cores
)

# Train ONLY on normal data — this is key for anomaly detection
# The model learns what "normal" looks like and flags deviations
X_normal_scaled = X_train_scaled[y_train == 0]
model.fit(X_normal_scaled)
print(f"Trained on {len(X_normal_scaled)} normal samples")

# ── Evaluate ──────────────────────────────────
print("\nEvaluating...")
# IsolationForest returns: 1 = normal, -1 = anomaly
raw_preds     = model.predict(X_test_scaled)
y_pred        = (raw_preds == -1).astype(int)  # convert to 0/1

# Anomaly scores: more negative = more anomalous
raw_scores    = model.score_samples(X_test_scaled)
# Normalise to 0-1 (0 = normal, 1 = anomaly)
score_min     = raw_scores.min()
score_max     = raw_scores.max()
anomaly_scores = 1 - (raw_scores - score_min) / (score_max - score_min)

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Normal', 'Anomaly']))

print("Confusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
print(f"  True Normal:   {cm[0][0]:4d}  False Alarm:  {cm[0][1]:4d}")
print(f"  Missed:        {cm[1][0]:4d}  True Anomaly: {cm[1][1]:4d}")

try:
    auc = roc_auc_score(y_test, anomaly_scores)
    print(f"\nROC-AUC Score: {auc:.4f}")
except Exception:
    pass

# ── Determine threshold for anomaly score ─────
# Use 95th percentile of normal sample scores as threshold
normal_scores  = anomaly_scores[y_test == 0]
threshold      = np.percentile(normal_scores, 95)
print(f"\nAnomaly score threshold (95th pct of normals): {threshold:.4f}")

# ── Save artifacts ────────────────────────────
print("\nSaving model artifacts...")

model_path     = os.path.join(MODEL_DIR, 'isolation_forest.pkl')
scaler_path    = os.path.join(MODEL_DIR, 'scaler.pkl')
threshold_path = os.path.join(MODEL_DIR, 'threshold.txt')
meta_path      = os.path.join(MODEL_DIR, 'model_meta.json')

joblib.dump(model,  model_path)
joblib.dump(scaler, scaler_path)

with open(threshold_path, 'w') as f:
    f.write(str(threshold))

import json
meta = {
    'feature_names':  FEATURE_NAMES,
    'contamination':  CONTAMINATION,
    'n_estimators':   200,
    'threshold':      float(threshold),
    'train_size':     int(len(X_train)),
    'test_size':      int(len(X_test)),
    'normal_count':   int((y_train == 0).sum()),
    'anomaly_count':  int((y_train == 1).sum()),
    'score_min':      float(score_min),
    'score_max':      float(score_max),
}
with open(meta_path, 'w') as f:
    json.dump(meta, f, indent=2)

print(f"Model saved:     {model_path}")
print(f"Scaler saved:    {scaler_path}")
print(f"Threshold saved: {threshold_path}")
print(f"Meta saved:      {meta_path}")
print("\nTraining complete!")