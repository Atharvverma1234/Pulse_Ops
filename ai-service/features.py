# ai-service/features.py
import numpy as np
from typing import List

FEATURE_NAMES = [
    'cpu',
    'memory',
    'disk',
    'network_in',
    'network_out',
    'cpu_memory_ratio',    # interaction feature
    'resource_pressure',   # composite: weighted avg of cpu+memory+disk
    'network_total',       # in + out combined
]

def engineer_features(
    cpu: float,
    memory: float,
    disk: float,
    network_in: float  = 0.0,
    network_out: float = 0.0,
) -> List[float]:
    """
    Transform raw metric values into model features.
    Must match exactly what was used during training.
    """
    cpu            = float(cpu)
    memory         = float(memory)
    disk           = float(disk)
    network_in     = float(network_in)
    network_out    = float(network_out)

    # Interaction: high CPU with high memory = more suspicious
    cpu_memory_ratio = (cpu * memory) / 10000.0  # normalise to 0-1 range

    # Composite resource pressure — weighted
    resource_pressure = (cpu * 0.4) + (memory * 0.35) + (disk * 0.25)

    # Total network throughput (KB)
    network_total = (network_in + network_out) / 1024.0

    return [
        cpu,
        memory,
        disk,
        network_in,
        network_out,
        cpu_memory_ratio,
        resource_pressure,
        network_total,
    ]

def engineer_features_from_df(df):
    """
    Apply feature engineering to a pandas DataFrame.
    Used during training.
    """
    df = df.copy()
    df['cpu_memory_ratio']  = (df['cpu'] * df['memory']) / 10000.0
    df['resource_pressure'] = (df['cpu'] * 0.4) + (df['memory'] * 0.35) + (df['disk'] * 0.25)
    df['network_total']     = (df['network_in'] + df['network_out']) / 1024.0
    return df[FEATURE_NAMES]