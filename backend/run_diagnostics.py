#!/usr/bin/env python3
"""Quick diagnostics for GNSS Day-8 training inputs."""

import argparse
from pathlib import Path
from typing import Dict

import numpy as np
import pandas as pd

from predict import _prepare_dataframe, FEATURES  # type: ignore


def persistence_baseline(target: np.ndarray, last_obs: np.ndarray) -> Dict[str, float]:
    """Use last observed value (t0) as prediction for all future horizons."""
    horizon = target.shape[0]
    baseline = np.repeat(last_obs.reshape(1, -1), horizon, axis=0)
    metrics = {}
    for idx, feature in enumerate(FEATURES):
        errors = target[:, idx] - baseline[:, idx]
        metrics[f"{feature}_mae"] = float(np.mean(np.abs(errors)))
        metrics[f"{feature}_rmse"] = float(np.sqrt(np.mean(errors ** 2)))
    return metrics

def compute_diagnostics(path: Path) -> Dict[str, object]:
    raw_df = pd.read_csv(path)
    df, metadata = _prepare_dataframe(raw_df)

    if len(df) < 2 * 96:
        raise ValueError("Need at least 192 rows (5 days) to run diagnostics")

    validation_slice = df.tail(96)
    scaler_slice = df[FEATURES]

    target = validation_slice[FEATURES].to_numpy()
    last_obs = df.iloc[-97][FEATURES].to_numpy()
    baseline_metrics = persistence_baseline(target, last_obs)

    diagnostics = {
        "input_rows": int(len(df)),
        "time_span_hours": metadata.get("time_span_hours"),
        "satclock_unit": metadata.get("satclock_unit_detected"),
        "feature_means": {f: float(scaler_slice[f].mean()) for f in FEATURES},
        "feature_stds": {f: float(scaler_slice[f].std()) for f in FEATURES},
        "baseline_metrics": baseline_metrics,
    }
    return diagnostics


def main() -> None:
    parser = argparse.ArgumentParser(description="Run baseline diagnostics on GNSS CSV input")
    parser.add_argument("csv", type=str, help="Path to cleaned 6-day CSV file")
    args = parser.parse_args()

    path = Path(args.csv)
    if not path.exists():
        raise FileNotFoundError(path)

    diagnostics = compute_diagnostics(path)
    for key, value in diagnostics.items():
        print(f"{key}: {value}")


if __name__ == "__main__":
    main()
