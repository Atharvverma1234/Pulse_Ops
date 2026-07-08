# ai-service/scripts/generate_dataset.py
import pandas as pd
import numpy as np
import os

np.random.seed(42)

NUM_NORMAL  = 5000
NUM_ANOMALY = 300

# ── Normal samples ────────────────────────────
# Realistic ranges: CPU 10-75, Memory 20-70, Disk 20-65, Network 0-5000
normal = pd.DataFrame({
    'cpu':        np.random.normal(loc=40, scale=15, size=NUM_NORMAL).clip(5,  75),
    'memory':     np.random.normal(loc=45, scale=12, size=NUM_NORMAL).clip(10, 70),
    'disk':       np.random.normal(loc=40, scale=10, size=NUM_NORMAL).clip(15, 65),
    'network_in': np.random.exponential(scale=800,  size=NUM_NORMAL).clip(0, 4000),
    'network_out':np.random.exponential(scale=400,  size=NUM_NORMAL).clip(0, 2000),
    'label':      0,  # 0 = normal
})

# ── Anomaly samples ───────────────────────────
# High CPU spikes
cpu_spike = pd.DataFrame({
    'cpu':        np.random.uniform(88, 100, size=100),
    'memory':     np.random.normal(loc=45, scale=10, size=100).clip(10, 70),
    'disk':       np.random.normal(loc=40, scale=8,  size=100).clip(15, 65),
    'network_in': np.random.exponential(scale=800,   size=100).clip(0, 4000),
    'network_out':np.random.exponential(scale=400,   size=100).clip(0, 2000),
    'label':      1,
})

# High memory spikes
mem_spike = pd.DataFrame({
    'cpu':        np.random.normal(loc=40, scale=10, size=100).clip(5, 75),
    'memory':     np.random.uniform(88, 100, size=100),
    'disk':       np.random.normal(loc=40, scale=8,  size=100).clip(15, 65),
    'network_in': np.random.exponential(scale=800,   size=100).clip(0, 4000),
    'network_out':np.random.exponential(scale=400,   size=100).clip(0, 2000),
    'label':      1,
})

# Combined stress (all metrics high)
combined = pd.DataFrame({
    'cpu':        np.random.uniform(85, 100, size=100),
    'memory':     np.random.uniform(82, 100, size=100),
    'disk':       np.random.uniform(78, 100, size=100),
    'network_in': np.random.uniform(4000, 8000, size=100),
    'network_out':np.random.uniform(2000, 5000, size=100),
    'label':      1,
})

# ── Combine + shuffle ─────────────────────────
df = pd.concat([normal, cpu_spike, mem_spike, combined], ignore_index=True)
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

# Round floats
for col in ['cpu', 'memory', 'disk', 'network_in', 'network_out']:
    df[col] = df[col].round(2)

out_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'metrics_dataset.csv')
df.to_csv(out_path, index=False)

print(f"Dataset saved: {len(df)} rows")
print(f"Normal:  {(df.label == 0).sum()}")
print(f"Anomaly: {(df.label == 1).sum()}")
print(df.describe())