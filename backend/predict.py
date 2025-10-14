# new version
# predict.py
# import pandas as pd
# import numpy as np
# from fastapi import UploadFile
# from tensorflow.keras.models import load_model
# import joblib
# from utils.timeutils import large_gap_detected
# from utils.preprocess import preprocess

# lstm_model = load_model("models/lstm_model.h5", compile=False)
# transformer_model = load_model("models/transformer_model.h5", compile=False)

# scaler = joblib.load("models/scaler.pkl")

# FEATURES = ["x_error","y_error","z_error","satclockerror"]
# TIME_STEPS = 20

# def create_sequences(data, time_steps=TIME_STEPS):
#     X = []
#     for i in range(len(data)-time_steps):
#         X.append(data[i:i+time_steps])
#     return np.array(X)

# async def predict(file: UploadFile):
#     try:
#         df = pd.read_csv(file.file)
#         df.columns = df.columns.str.strip().str.lower()
#         df.rename(columns={
#             "x_error (m)":"x_error",
#             "y_error (m)":"y_error",
#             "z_error (m)":"z_error",
#             "satclockerror (m)":"satclockerror"
#         }, inplace=True)

#         if "utc_time" in df.columns:
#             df["utc_time"] = pd.to_datetime(df["utc_time"], errors="coerce")
#             df = df.dropna(subset=["utc_time"]).sort_values("utc_time").reset_index(drop=True)
#         else:
#             df["utc_time"] = pd.NaT

#         feature_data = df[FEATURES].values
#         scaled_data = scaler.transform(feature_data)

#         if len(scaled_data) < TIME_STEPS:
#             pad_count = TIME_STEPS - len(scaled_data)
#             last_row = scaled_data[-1]
#             scaled_data = np.vstack([np.tile(last_row,(pad_count,1)), scaled_data])

#         last_seq = scaled_data[-TIME_STEPS:].reshape(1,TIME_STEPS,len(FEATURES))

#         if large_gap_detected(df, threshold_seconds=3600):
#             pred_scaled = transformer_model.predict(last_seq)
#         else:
#             pred_scaled = lstm_model.predict(last_seq)

#         pred = scaler.inverse_transform(pred_scaled)
#         prediction = {FEATURES[i]: float(pred[0][i]) for i in range(len(FEATURES))}

#         if df["utc_time"].notna().any():
#             last_time = df["utc_time"].iloc[-1]
#             deltas = df["utc_time"].diff().dropna().dt.total_seconds()
#             median_delta = np.median(deltas) if not deltas.empty else 60
#             prediction["predicted_time"] = (last_time + pd.Timedelta(seconds=median_delta)).strftime("%Y-%m-%d %H:%M:%S")

#         return {"prediction": prediction, "table_data": df.to_dict(orient="records")}

#     except Exception as e:
#         return {"error": str(e)}



# predict.py
# predict.py
# import pandas as pd
# import numpy as np
# from fastapi import UploadFile
# from tensorflow.keras.models import load_model
# import joblib
# from utils.timeutils import large_gap_detected
# from utils.preprocess import preprocess

# # Load models and scaler
# lstm_model = load_model("models/lstm_model.h5", compile=False)
# transformer_model = load_model("models/transformer_model.h5", compile=False)
# scaler = joblib.load("models/scaler.pkl")

# FEATURES = ["x_error","y_error","z_error","satclockerror"]
# TIME_STEPS = 20
# NUM_PREDICTIONS = 96  # number of points to predict (8th day)

# def create_sequences(data, time_steps=TIME_STEPS):
#     X = []
#     for i in range(len(data)-time_steps):
#         X.append(data[i:i+time_steps])
#     return np.array(X)

# async def predict(file: UploadFile):
#     try:
#         # Load CSV
#         df = pd.read_csv(file.file)
#         df.columns = df.columns.str.strip().str.lower()
#         df.rename(columns={
#             "x_error (m)":"x_error",
#             "y_error (m)":"y_error",
#             "z_error (m)":"z_error",
#             "satclockerror (m)":"satclockerror"
#         }, inplace=True)

#         # Handle timestamp
#         if "utc_time" in df.columns:
#             df["utc_time"] = pd.to_datetime(df["utc_time"], errors="coerce")
#             df = df.dropna(subset=["utc_time"]).sort_values("utc_time").reset_index(drop=True)
#         else:
#             df["utc_time"] = pd.NaT

#         # Preprocess features
#         feature_data = df[FEATURES].values
#         scaled_data = scaler.transform(feature_data)

#         # Pad if too short
#         if len(scaled_data) < TIME_STEPS:
#             pad_count = TIME_STEPS - len(scaled_data)
#             last_row = scaled_data[-1]
#             scaled_data = np.vstack([np.tile(last_row,(pad_count,1)), scaled_data])

#         # Prepare last sequence
#         last_seq = scaled_data[-TIME_STEPS:].reshape(1,TIME_STEPS,len(FEATURES))

#         # Generate predictions recursively
#         pred_sequence = []
#         current_seq = last_seq.copy()
#         for _ in range(NUM_PREDICTIONS):
#             if large_gap_detected(df, threshold_seconds=3600):
#                 pred_scaled = transformer_model.predict(current_seq)
#             else:
#                 pred_scaled = lstm_model.predict(current_seq)
            
#             # inverse scale
#             pred = scaler.inverse_transform(pred_scaled)[0]
#             pred_sequence.append(pred.tolist())
            
#             # update sequence for next prediction
#             next_scaled = pred_scaled.reshape(1,1,len(FEATURES))
#             current_seq = np.concatenate([current_seq[:,1:,:], next_scaled], axis=1)

#         # Convert predictions to dict for frontend
#         predicted_data = [
#             {FEATURES[i]: float(pred_sequence[j][i]) for i in range(len(FEATURES))}
#             for j in range(NUM_PREDICTIONS)
#         ]

#         # Add predicted timestamps if available
#         if df["utc_time"].notna().any():
#             last_time = df["utc_time"].iloc[-1]
#             deltas = df["utc_time"].diff().dropna().dt.total_seconds()
#             median_delta = np.median(deltas) if not deltas.empty else 60
#             predicted_times = [(last_time + pd.Timedelta(seconds=median_delta*(j+1))).strftime("%Y-%m-%d %H:%M:%S")
#                                for j in range(NUM_PREDICTIONS)]
#             for idx, t in enumerate(predicted_times):
#                 predicted_data[idx]["predicted_time"] = t

#         return {"prediction": predicted_data, "table_data": df.to_dict(orient="records")}

#     except Exception as e:

#         return {"error": str(e)}














































































# import argparse
# import json
# import os
# from datetime import datetime
# from pathlib import Path
# from typing import Any, Dict, Optional, Tuple

# import numpy as np
# import pandas as pd
# from fastapi import UploadFile
# from tensorflow.keras.models import load_model  # type: ignore
# import joblib

# # Resolve paths relative to this file so it works from any cwd
# BASE_DIR = Path(__file__).resolve().parent
# MODELS_DIR = BASE_DIR / "models"
# SPEED_OF_LIGHT = 299_792_458.0  # m/s
# SATCLOCK_LOWER_BOUND = -4.0
# SATCLOCK_UPPER_BOUND = 4.0
# SATCLOCK_LOCK_MODE = os.getenv("SATCLOCK_LOCK_MODE", "auto").lower()
# SATCLOCK_STD_LOCK_THRESHOLD = float(os.getenv("SATCLOCK_STD_LOCK_THRESHOLD", "0.002"))
# DELTA_THRESHOLD_MULTIPLIER = float(os.getenv("DELTA_THRESHOLD_MULTIPLIER", "3.0"))
# MIN_DELTA_THRESHOLD = float(os.getenv("MIN_DELTA_THRESHOLD", "1e-4"))

# # Lazy-load models and scaler to avoid import-time errors under uvicorn reload
# _lstm_model = None
# _transformer_model = None
# _scaler = None

# def get_models_and_scaler():
#     global _lstm_model, _transformer_model, _scaler
#     if _lstm_model is None:
#         model_path = MODELS_DIR / "lstm_model.h5"
#         if not model_path.exists():
#             raise FileNotFoundError(f"Missing LSTM model at {model_path}")
#         _lstm_model = load_model(str(model_path), compile=False)
#     if _transformer_model is None:
#         model_path = MODELS_DIR / "transformer_model.h5"
#         if not model_path.exists():
#             raise FileNotFoundError(f"Missing Transformer model at {model_path}")
#         _transformer_model = load_model(str(model_path), compile=False)
#     if _scaler is None:
#         scaler_path = MODELS_DIR / "scaler.pkl"
#         if not scaler_path.exists():
#             raise FileNotFoundError(f"Missing scaler at {scaler_path}")
#         _scaler = joblib.load(str(scaler_path))
#     return _lstm_model, _transformer_model, _scaler

# FEATURES = ["x_error", "y_error", "z_error", "satclockerror"]
# TIME_STEPS = 20
# NUM_PREDICTIONS = 96  # 96 predictions = 24 hours at 15-min intervals (predict NEXT day after input)
# PREDICTION_INTERVAL_SECONDS = 900  # Fixed 15 minutes (900 seconds) interval
# SHORT_HORIZON_THRESHOLD = 1800  # 30 minutes in seconds
# LONG_HORIZON_THRESHOLD = 3600   # 1 hour in seconds

# # Indices and window for satclockerror stabilization
# SAT_IDX = FEATURES.index("satclockerror")
# SATCLOCK_WINDOW_ROWS = 7 * 24 * 4  # 7 days * 24h * 4 (15-min) = 672 rows


# def _compute_accuracy_percentage(actual: np.ndarray, mae: Optional[float]) -> Optional[float]:
#     """Derive a simple percentage accuracy based on MAE relative to actual range."""
#     if mae is None:
#         return None

#     actual = actual.astype(float)
#     finite_actual = actual[np.isfinite(actual)]
#     if finite_actual.size == 0:
#         return None

#     value_range = float(finite_actual.max() - finite_actual.min())
#     if value_range <= 1e-9:
#         return None

#     accuracy = max(0.0, 1.0 - (mae / value_range))
#     return float(accuracy * 100.0)


# def _compute_regression_metrics(actual: np.ndarray, predicted: np.ndarray) -> Dict[str, Optional[float]]:
#     """Return RMSE, MAE, R^2, and accuracy percentage between two 1-D series."""
#     if actual.size == 0 or predicted.size == 0:
#         return {"rmse": None, "mae": None, "r2": None, "accuracy_pct": None}

#     residuals = predicted - actual
#     rmse = float(np.sqrt(np.mean(np.square(residuals))))
#     mae = float(np.mean(np.abs(residuals)))

#     ss_tot = float(np.sum(np.square(actual - np.mean(actual))))
#     if ss_tot > 1e-12:
#         ss_res = float(np.sum(np.square(actual - predicted)))
#         r2 = float(1.0 - (ss_res / ss_tot))
#     else:
#         r2 = None

#     accuracy_pct = _compute_accuracy_percentage(actual, mae)

#     return {"rmse": rmse, "mae": mae, "r2": r2, "accuracy_pct": accuracy_pct}


# def _run_backtest(df: pd.DataFrame, scaler) -> Optional[Dict[str, np.ndarray]]:
#     """Generate one-step-ahead predictions across historical data for accuracy metrics."""
#     if len(df) <= TIME_STEPS:
#         return None

#     # Ensure the adaptive selector has access to cached models
#     get_models_and_scaler()

#     feature_data = df[FEATURES].values
#     time_series = None
#     if "utc_time" in df.columns and df["utc_time"].notna().any():
#         time_series = df["utc_time"].copy()

#     fixed_sat = compute_fixed_satclock(df) if should_lock_satclock(df) else None

#     predicted_rows: list[np.ndarray] = []
#     actual_rows: list[np.ndarray] = []
#     delta_thresholds = compute_delta_thresholds(df)

#     for idx in range(TIME_STEPS, len(feature_data)):
#         history = feature_data[idx - TIME_STEPS : idx].copy()
#         history_model = history.copy()
#         history_model[:, SAT_IDX] = history_model[:, SAT_IDX] * SPEED_OF_LIGHT
#         scaled_history = scaler.transform(history_model)
#         seq = scaled_history.reshape(1, TIME_STEPS, len(FEATURES))

#         current_time: Optional[pd.Timestamp] = None
#         previous_time: Optional[pd.Timestamp] = None
#         if time_series is not None:
#             current_time = time_series.iloc[idx]
#             previous_time = time_series.iloc[idx - 1] if idx > 0 else None
#             if pd.isna(current_time):
#                 current_time = None
#             if pd.isna(previous_time):
#                 previous_time = None

#         model_df = df.iloc[: idx].copy()
#         model, _ = get_adaptive_model_choice(model_df, current_time, previous_time)

#         pred_scaled = model.predict(seq, verbose=0)
#         pred_base_model = scaler.inverse_transform(pred_scaled)[0]
#         pred_base = pred_base_model.copy()
#         pred_base[SAT_IDX] = pred_base_model[SAT_IDX] / SPEED_OF_LIGHT

#         last_observation = history[-1]
#         blended_raw = 0.65 * pred_base + 0.35 * last_observation
#         blended = constrain_feature_deltas(blended_raw, last_observation, delta_thresholds)

#         row_dict = {FEATURES[i]: float(blended[i]) for i in range(len(FEATURES))}
#         row_dict = apply_postprocessing(row_dict, fixed_sat)
#         final_pred = np.array([row_dict[f] for f in FEATURES], dtype=float)

#         predicted_rows.append(final_pred)
#         actual_rows.append(feature_data[idx])

#     if not predicted_rows:
#         return None

#     return {
#         "predicted": np.vstack(predicted_rows),
#         "actual": np.vstack(actual_rows),
#     }


# def compute_backtest_metrics(df: pd.DataFrame, scaler) -> Dict[str, Any]:
#     """Compute RMSE, MAE, and R^2 for satclock and ephemeris errors across historical data."""
#     backtest_data = _run_backtest(df, scaler)
#     if not backtest_data:
#         return {"sample_size": 0}

#     predicted = backtest_data["predicted"]
#     actual = backtest_data["actual"]
#     sample_size = int(actual.shape[0])

#     metrics: Dict[str, Any] = {"sample_size": sample_size}

#     metrics["satclockerror"] = _compute_regression_metrics(actual[:, SAT_IDX], predicted[:, SAT_IDX])

#     ephemeris_axes = ["x_error", "y_error", "z_error"]
#     ephemeris_components = {
#         axis: _compute_regression_metrics(actual[:, idx], predicted[:, idx])
#         for idx, axis in enumerate(ephemeris_axes)
#     }
#     actual_ephemeris_norm = np.linalg.norm(actual[:, :3], axis=1)
#     predicted_ephemeris_norm = np.linalg.norm(predicted[:, :3], axis=1)
#     ephemeris_components["three_dimensional"] = _compute_regression_metrics(
#         actual_ephemeris_norm, predicted_ephemeris_norm
#     )

#     metrics["ephemeris_error"] = ephemeris_components

#     return metrics

# def last_observed_gap_seconds(df: pd.DataFrame) -> Optional[float]:
#     """Get the time gap between the last two observations in input data."""
#     if "utc_time" not in df.columns or not df["utc_time"].notna().any() or len(df) < 2:
#         return None
#     td = pd.to_datetime(df["utc_time"], errors="coerce").dropna()
#     if len(td) < 2:
#         return None
#     return float((td.iloc[-1] - td.iloc[-2]).total_seconds())

# def compute_fixed_satclock(df: pd.DataFrame) -> Optional[float]:
#     """
#     Return a stable satclockerror to use for all predictions:
#     - Median of last 7 days (by time if utc_time exists)
#     - Fallback to last observed value
#     """
#     if "satclockerror" not in df.columns:
#         return None

#     # Try to get last 7 days by time
#     window_df = df
#     if "utc_time" in df.columns and df["utc_time"].notna().any():
#         max_time = df["utc_time"].max()
#         window_start = max_time - pd.Timedelta(days=7)
#         sel = df[df["utc_time"] >= window_start]
#         if not sel.empty:
#             window_df = sel

#     # Fallback to last 672 rows (7 days at 15-min intervals)
#     if window_df is df:
#         window_df = df.tail(SATCLOCK_WINDOW_ROWS)

#     # Get median from the window
#     series = pd.to_numeric(window_df["satclockerror"], errors="coerce").dropna()
#     if not series.empty:
#         return float(series.median())

#     # Ultimate fallback: last known value
#     series_all = pd.to_numeric(df["satclockerror"], errors="coerce").dropna()
#     if not series_all.empty:
#         return float(series_all.iloc[-1])
    
#     return None


# def compute_delta_thresholds(df: pd.DataFrame) -> Dict[str, Optional[float]]:
#     """Estimate acceptable per-step delta thresholds for each feature from historical data."""
#     if df.empty:
#         return {feature: None for feature in FEATURES}

#     thresholds: Dict[str, Optional[float]] = {}
#     diffs = df[FEATURES].diff().abs()

#     for feature in FEATURES:
#         series = pd.to_numeric(diffs.get(feature), errors="coerce").dropna()
#         if series.empty:
#             thresholds[feature] = None
#             continue

#         if len(series) > 10:
#             base_threshold = float(np.quantile(series, 0.95))
#         else:
#             base_threshold = float(series.max())

#         scaled_threshold = max(base_threshold * DELTA_THRESHOLD_MULTIPLIER, MIN_DELTA_THRESHOLD)
#         thresholds[feature] = scaled_threshold

#     return thresholds


# def constrain_feature_deltas(pred_vector: np.ndarray, prev_vector: np.ndarray, thresholds: Dict[str, Optional[float]]) -> np.ndarray:
#     """Clip feature deltas to stay within historical variability bounds."""
#     constrained = pred_vector.copy()

#     for idx, feature in enumerate(FEATURES):
#         limit = thresholds.get(feature)
#         if limit is None or not np.isfinite(limit):
#             continue

#         delta = constrained[idx] - prev_vector[idx]
#         constrained[idx] = prev_vector[idx] + float(np.clip(delta, -limit, limit))

#     return constrained


# def should_lock_satclock(df: pd.DataFrame) -> bool:
#     """Decide whether satclock predictions should be locked to a fixed value."""
#     if SATCLOCK_LOCK_MODE == "always":
#         return True
#     if SATCLOCK_LOCK_MODE == "never":
#         return False

#     sat_series = pd.to_numeric(df.get("satclockerror"), errors="coerce") if "satclockerror" in df.columns else pd.Series(dtype=float)
#     sat_series = sat_series.dropna()
#     if sat_series.empty:
#         return False

#     return float(sat_series.std()) < SATCLOCK_STD_LOCK_THRESHOLD


# def normalise_satclock_units(df: pd.DataFrame) -> Tuple[pd.DataFrame, str]:
#     """Detect satclock units and normalise to seconds within [-4, 4] target window."""
#     if "satclockerror" not in df.columns:
#         return df, "missing"

#     sat = pd.to_numeric(df["satclockerror"], errors="coerce")
#     median_abs = sat.abs().median() if not sat.dropna().empty else None

#     unit = "unknown"
#     if median_abs is None:
#         df["satclockerror"] = sat
#         return df, unit

#     if median_abs > 1000:
#         # Values are likely in metres – convert to seconds for downstream logic
#         df["satclockerror"] = sat / SPEED_OF_LIGHT
#         unit = "meters"
#     else:
#         df["satclockerror"] = sat
#         unit = "seconds"

#     # Clip to physical bounds and fill missing values with rolling median
#     df["satclockerror"] = df["satclockerror"].astype(float)
#     df["satclockerror"] = df["satclockerror"].clip(SATCLOCK_LOWER_BOUND * 1.5, SATCLOCK_UPPER_BOUND * 1.5)
#     df["satclockerror"] = df["satclockerror"].ffill().bfill()
#     return df, unit


# def constrain_satclock_value(val: float) -> float:
#     constrained_val = (SATCLOCK_UPPER_BOUND * np.tanh(val / SATCLOCK_UPPER_BOUND)) if SATCLOCK_UPPER_BOUND != 0 else val
#     return float(np.clip(constrained_val, SATCLOCK_LOWER_BOUND, SATCLOCK_UPPER_BOUND))


# def apply_postprocessing(row: Dict[str, Any], fixed_sat: Optional[float]) -> Dict[str, Any]:
#     if fixed_sat is not None:
#         row["satclockerror"] = float(fixed_sat)
#     row["satclockerror"] = constrain_satclock_value(float(row["satclockerror"]))
#     return row

# def detect_gap_type(time_delta_seconds):
#     """
#     Classify time gap as short or long horizon.
    
#     Args:
#         time_delta_seconds: Time difference in seconds
        
#     Returns:
#         str: "short" for LSTM, "long" for Transformer
#     """
#     if time_delta_seconds <= SHORT_HORIZON_THRESHOLD:
#         return "short"
#     elif time_delta_seconds >= LONG_HORIZON_THRESHOLD:
#         return "long"
#     else:
#         # Medium gap - use LSTM as default
#         return "short"

# def get_adaptive_model_choice(df, current_time=None, last_predicted_time=None):
#     """
#     Dynamically choose model based on time gap analysis.
#     Your data has gaps of HOURS (like 2-hour gaps), so this should trigger Transformer.
#     """
#     # Access models (cached after first load)
#     l_model, t_model, _ = get_models_and_scaler()

#     # Consider the gap between consecutive predictions (if provided)
#     if current_time is not None and last_predicted_time is not None:
#         prediction_gap = (current_time - last_predicted_time).total_seconds()
#         if prediction_gap >= LONG_HORIZON_THRESHOLD:
#             return t_model, "Transformer"

#     # First check: last observed gap in input data  
#     last_gap = last_observed_gap_seconds(df)
#     print(f"DEBUG: Last observed gap = {last_gap} seconds ({last_gap/3600:.2f} hours if not None)")
    
#     if last_gap is not None and last_gap >= LONG_HORIZON_THRESHOLD:
#         print(f"DEBUG: Using Transformer due to large last gap: {last_gap}s >= {LONG_HORIZON_THRESHOLD}s")
#         return t_model, "Transformer"

#     # Check ALL gaps in input data to see the pattern
#     if "utc_time" in df.columns and df["utc_time"].notna().any():
#         deltas = df["utc_time"].diff().dropna().dt.total_seconds()
#         if not deltas.empty:
#             avg_delta = np.mean(deltas)
#             max_delta = np.max(deltas)
#             large_gaps = (deltas >= LONG_HORIZON_THRESHOLD).sum()
#             total_gaps = len(deltas)
            
#             print(f"DEBUG: Data analysis - avg_delta: {avg_delta:.0f}s, max_delta: {max_delta:.0f}s")
#             print(f"DEBUG: Large gaps (>={LONG_HORIZON_THRESHOLD}s): {large_gaps}/{total_gaps}")
            
#             # If majority of gaps are large OR any gap exceeds threshold, use Transformer
#             if large_gaps > 0 or avg_delta >= LONG_HORIZON_THRESHOLD:
#                 print("DEBUG: Using Transformer due to large gaps in historical data")
#                 return t_model, "Transformer"
    
#     print("DEBUG: Using LSTM as fallback")
#     return l_model, "LSTM"

# def _load_dataframe_from_upload(file: UploadFile) -> pd.DataFrame:
#     df = pd.read_csv(file.file)
#     file.file.seek(0)
#     return df


# def _prepare_dataframe(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
#     df = df.copy()
#     df.columns = df.columns.str.strip().str.lower()
#     df.rename(
#         columns={
#             "x_error (m)": "x_error",
#             "y_error (m)": "y_error",
#             "z_error (m)": "z_error",
#             "satclockerror (m)": "satclockerror",
#         },
#         inplace=True,
#     )

#     if "utc_time" in df.columns:
#         df["utc_time"] = pd.to_datetime(df["utc_time"], errors="coerce")
#         df = df.dropna(subset=["utc_time"]).sort_values("utc_time").reset_index(drop=True)
#     else:
#         df["utc_time"] = pd.NaT

#     for c in FEATURES:
#         if c in df.columns:
#             df[c] = pd.to_numeric(df[c], errors="coerce")
#     df = df.dropna(subset=[c for c in FEATURES if c in df.columns])

#     df, satclock_unit = normalise_satclock_units(df)

#     time_span_hours: Optional[float] = None
#     if df["utc_time"].notna().any() and len(df) > 1:
#         time_delta = df["utc_time"].iloc[-1] - df["utc_time"].iloc[0]
#         time_span_hours = float(time_delta.total_seconds() / 3600.0)

#     metadata = {
#         "record_count": int(len(df)),
#         "time_span_hours": time_span_hours,
#         "satclock_unit_detected": satclock_unit,
#     }

#     return df, metadata


# def _generate_predictions(df: pd.DataFrame) -> Dict[str, Any]:
#     lstm_model, transformer_model, scaler = get_models_and_scaler()

#     feature_data = df[FEATURES].values
#     feature_data_model = feature_data.copy()
#     feature_data_model[:, SAT_IDX] = feature_data_model[:, SAT_IDX] * SPEED_OF_LIGHT
#     scaled_data = scaler.transform(feature_data_model)

#     if len(scaled_data) < TIME_STEPS:
#         pad_count = TIME_STEPS - len(scaled_data)
#         last_row = scaled_data[-1]
#         scaled_data = np.vstack([np.tile(last_row, (pad_count, 1)), scaled_data])

#     last_seq = scaled_data[-TIME_STEPS:].reshape(1, TIME_STEPS, len(FEATURES))
#     fixed_sat = compute_fixed_satclock(df) if should_lock_satclock(df) else None

#     predicted_data: list[Dict[str, Any]] = []
#     current_seq = last_seq.copy()
#     model_usage_count = {"LSTM": 0, "Transformer": 0}
#     previous_output = feature_data[-1]
#     satclock_history: list[float] = []
#     satclock_preclip_history: list[float] = []
#     satclock_constrained_history: list[float] = []
#     satclock_base_history: list[float] = []
#     delta_thresholds = compute_delta_thresholds(df)

#     if df["utc_time"].notna().any():
#         last_input_time = df["utc_time"].iloc[-1]
#         next_day_start = pd.Timestamp(last_input_time.date()) + pd.Timedelta(days=1)
#         print(f"DEBUG: Last input time: {last_input_time}, Next day prediction starts: {next_day_start}")
#     else:
#         next_day_start = pd.Timestamp.now().normalize() + pd.Timedelta(days=1)

#     for step in range(NUM_PREDICTIONS):
#         current_time = next_day_start + pd.Timedelta(seconds=PREDICTION_INTERVAL_SECONDS * step)
#         previous_time = next_day_start + pd.Timedelta(seconds=PREDICTION_INTERVAL_SECONDS * (step - 1)) if step > 0 else None

#         model, model_name = get_adaptive_model_choice(df, current_time, previous_time)
#         model_usage_count[model_name] += 1

#         pred_scaled = model.predict(current_seq, verbose=0)
#         pred_base_model = scaler.inverse_transform(pred_scaled)[0]
#         pred_base = pred_base_model.copy()
#         pred_base[SAT_IDX] = pred_base_model[SAT_IDX] / SPEED_OF_LIGHT
#         raw_blend = 0.65 * pred_base + 0.35 * previous_output
#         constrained_pred = constrain_feature_deltas(raw_blend, previous_output, delta_thresholds)
#         satclock_base_history.append(float(pred_base[SAT_IDX]))
#         satclock_preclip_history.append(float(raw_blend[SAT_IDX]))
#         satclock_constrained_history.append(float(constrained_pred[SAT_IDX]))

#         row = {FEATURES[i]: round(float(constrained_pred[i]), 9) for i in range(len(FEATURES))}
#         row["model_used"] = model_name
#         row["prediction_step"] = step + 1

#         row["delta_clip_applied"] = bool(np.any(np.abs(constrained_pred - raw_blend) > 1e-9))

#         row["predicted_time"] = current_time.strftime("%Y-%m-%d %H:%M:%S")
#         if step > 0 and previous_time is not None:
#             time_gap = (current_time - previous_time).total_seconds()
#             row["time_gap_seconds"] = time_gap
#             row["gap_type"] = detect_gap_type(time_gap)

#         row = apply_postprocessing(row, fixed_sat)
#         satclock_history.append(row["satclockerror"])
#         processed_values = np.array([row[f] for f in FEATURES], dtype=float)
#         previous_output = processed_values
#         predicted_data.append(row)

#         processed_model_values = processed_values.copy()
#         processed_model_values[SAT_IDX] = processed_model_values[SAT_IDX] * SPEED_OF_LIGHT
#         pred_for_next_scaled = scaler.transform(processed_model_values.reshape(1, -1)).reshape(1, 1, len(FEATURES))
#         current_seq = np.concatenate([current_seq[:, 1:, :], pred_for_next_scaled], axis=1)

#     prediction_summary = {
#         "prediction_day": "Next Day (Day 7 if input is Days 1-6)",
#         "start_time": next_day_start.strftime("%Y-%m-%d %H:%M:%S"),
#         "prediction_interval": "15 minutes",
#         "total_predictions": NUM_PREDICTIONS,
#         "lstm_usage": model_usage_count["LSTM"],
#         "transformer_usage": model_usage_count["Transformer"],
#         "lstm_percentage": round((model_usage_count["LSTM"] / NUM_PREDICTIONS) * 100, 2),
#         "transformer_percentage": round((model_usage_count["Transformer"] / NUM_PREDICTIONS) * 100, 2),
#         "hybrid_approach": "Model selection based on INPUT data gaps (LSTM for <30min, Transformer for >1hr)",
#         "prediction_note": "Predictions are ALWAYS at 15-minute intervals regardless of input data intervals",
#         "satclock_mean": float(np.mean(satclock_history)) if satclock_history else None,
#         "satclock_std": float(np.std(satclock_history)) if satclock_history else None,
#         "satclock_raw_mean": float(np.mean(satclock_preclip_history)) if satclock_preclip_history else None,
#         "satclock_raw_std": float(np.std(satclock_preclip_history)) if satclock_preclip_history else None,
#         "satclock_constrained_mean": float(np.mean(satclock_constrained_history)) if satclock_constrained_history else None,
#         "satclock_constrained_std": float(np.std(satclock_constrained_history)) if satclock_constrained_history else None,
#         "satclock_base_mean": float(np.mean(satclock_base_history)) if satclock_base_history else None,
#         "satclock_base_std": float(np.std(satclock_base_history)) if satclock_base_history else None,
#         "delta_thresholds": {k: (float(v) if v is not None else None) for k, v in delta_thresholds.items()},
#     }

#     prediction_summary["historical_accuracy"] = compute_backtest_metrics(df, scaler)

#     return {
#         "prediction": predicted_data,
#         "table_data": df.to_dict(orient="records"),
#         "prediction_summary": prediction_summary,
#         "accuracy_metrics": prediction_summary["historical_accuracy"],
#     }


# def _json_default(obj: Any):
#     if isinstance(obj, (pd.Timestamp, datetime)):
#         return obj.isoformat()
#     if isinstance(obj, pd.Timedelta):
#         return obj.isoformat()
#     if isinstance(obj, (np.integer, np.floating)):
#         return obj.item()
#     return str(obj)


# def predict_from_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
#     prepared_df, metadata = _prepare_dataframe(df)
#     result = _generate_predictions(prepared_df)
#     result["ingest_metadata"] = metadata
#     return result


# def predict_from_csv(path: Path) -> Dict[str, Any]:
#     df = pd.read_csv(path)
#     return predict_from_dataframe(df)


# async def predict(file: UploadFile):
#     try:
#         df = _load_dataframe_from_upload(file)
#         return predict_from_dataframe(df)

#     except Exception as e:
#         return {"error": str(e)}


# def _cli(argv: Optional[list] = None) -> None:
#     parser = argparse.ArgumentParser(description="Run GNSS hybrid prediction on a CSV file.")
#     parser.add_argument("csv", type=str, help="Path to 6/7-day input CSV file")
#     parser.add_argument("--out", type=str, help="Optional path to save predictions JSON")
#     args = parser.parse_args(argv)

#     csv_path = Path(args.csv)
#     if not csv_path.exists():
#         raise FileNotFoundError(f"Input file not found: {csv_path}")

#     result = predict_from_csv(csv_path)
#     if args.out:
#         out_path = Path(args.out)
#         out_path.write_text(json.dumps(result, indent=2, default=_json_default))
#         print(f"Prediction saved to {out_path}")
#     else:
#         print(json.dumps(result["prediction_summary"], indent=2, default=_json_default))


# if __name__ == "__main__":
#     _cli()














# # backend/predict.py
# import os
# from pathlib import Path
# from typing import Any, Dict, Optional, Tuple
# import numpy as np
# import pandas as pd
# from fastapi import UploadFile
# import joblib
# from tensorflow.keras.models import load_model

# BASE_DIR = Path(__file__).resolve().parent
# MODELS_DIR = BASE_DIR / "models"
# SPEED_OF_LIGHT = 299_792_458.0

# FEATURES = ["x_error", "y_error", "z_error", "satclockerror"]
# TIME_STEPS = 20
# NUM_PREDICTIONS = 96
# PREDICTION_INTERVAL_SECONDS = 900
# LONG_HORIZON_THRESHOLD = 3600
# SAT_IDX = FEATURES.index("satclockerror")

# # lazy load
# _lstm_model = None
# _transformer_model = None
# _scaler = None

# def get_models_and_scaler():
#     global _lstm_model, _transformer_model, _scaler
#     if _lstm_model is None:
#         p = MODELS_DIR / "lstm_model.keras"
#         if not p.exists():
#             raise FileNotFoundError(f"Missing {p}")
#         _lstm_model = load_model(str(p), compile=False)
#     if _transformer_model is None:
#         p = MODELS_DIR / "transformer_model.keras"
#         if not p.exists():
#             raise FileNotFoundError(f"Missing {p}")
#         _transformer_model = load_model(str(p), compile=False)
#     if _scaler is None:
#         p = MODELS_DIR / "scaler.pkl"
#         if not p.exists():
#             raise FileNotFoundError(f"Missing {p}")
#         _scaler = joblib.load(str(p))
#     return _lstm_model, _transformer_model, _scaler

# def detect_large_gap_pattern(df: pd.DataFrame) -> bool:
#     if "utc_time" not in df.columns or df["utc_time"].isna().all():
#         return False
#     deltas = df["utc_time"].diff().dropna().dt.total_seconds()
#     if deltas.empty:
#         return False
#     large_count = (deltas >= LONG_HORIZON_THRESHOLD).sum()
#     avg_delta = deltas.mean()
#     return (large_count > 0) or (avg_delta >= LONG_HORIZON_THRESHOLD)

# def _load_dataframe_from_upload(file: UploadFile) -> pd.DataFrame:
#     df = pd.read_csv(file.file)
#     file.file.seek(0)
#     return df

# def _prepare_dataframe(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
#     df = df.copy()
#     df.columns = df.columns.str.strip().str.lower()
#     df.rename(columns={
#         "x_error (m)": "x_error",
#         "y_error (m)": "y_error",
#         "z_error (m)": "z_error",
#         "satclockerror (m)": "satclockerror"
#     }, inplace=True)

#     if "utc_time" in df.columns:
#         df["utc_time"] = pd.to_datetime(df["utc_time"], errors="coerce")
#         df = df.dropna(subset=["utc_time"]).sort_values("utc_time").reset_index(drop=True)
#     else:
#         df["utc_time"] = pd.NaT

#     for c in FEATURES:
#         if c in df.columns:
#             df[c] = pd.to_numeric(df[c], errors="coerce")
#     df = df.dropna(subset=[c for c in FEATURES if c in df.columns])

#     # normalize satclock units to meters if in seconds
#     if "satclockerror" in df.columns:
#         sat = pd.to_numeric(df["satclockerror"], errors="coerce")
#         if sat.abs().median() < 10:
#             df["satclockerror"] = sat * SPEED_OF_LIGHT

#     metadata = {
#         "record_count": int(len(df)),
#         "has_timestamps": bool(df["utc_time"].notna().any())
#     }
#     return df, metadata

# def _generate_predictions(df: pd.DataFrame) -> Dict[str, Any]:
#     lstm_model, transformer_model, scaler = get_models_and_scaler()

#     feature_data = df[FEATURES].values
#     scaled = scaler.transform(feature_data)

#     # pad short sequences
#     if len(scaled) < TIME_STEPS:
#         pad_count = TIME_STEPS - len(scaled)
#         last = scaled[-1]
#         scaled = np.vstack([np.tile(last, (pad_count, 1)), scaled])

#     current_seq = scaled[-TIME_STEPS:].reshape(1, TIME_STEPS, len(FEATURES))

#     predicted_data = []
#     model_usage = {"LSTM": 0, "Transformer": 0}
#     previous_output = feature_data[-1].astype(float)

#     dataset_large_gaps = detect_large_gap_pattern(df)

#     # time base for predictions
#     if df["utc_time"].notna().any():
#         last_time = df["utc_time"].iloc[-1]
#         next_day_start = pd.Timestamp(last_time.date()) + pd.Timedelta(days=1)
#     else:
#         next_day_start = pd.Timestamp.now().normalize() + pd.Timedelta(days=1)

#     for step in range(NUM_PREDICTIONS):
#         # hybrid: prefer transformer if large gaps, else LSTM
#         model = transformer_model if dataset_large_gaps else lstm_model
#         model_name = "Transformer" if dataset_large_gaps else "LSTM"

#         # Predict
#         pred_scaled = model.predict(current_seq, verbose=0)
#         pred_unscaled = scaler.inverse_transform(pred_scaled)[0]
#         pred_unscaled[SAT_IDX] = pred_unscaled[SAT_IDX] / SPEED_OF_LIGHT

#         # Hybrid blending if large-gap dataset
#         if dataset_large_gaps and model_name == "Transformer":
#             lstm_pred_scaled = lstm_model.predict(current_seq, verbose=0)
#             lstm_unscaled = scaler.inverse_transform(lstm_pred_scaled)[0]
#             lstm_unscaled[SAT_IDX] = lstm_unscaled[SAT_IDX] / SPEED_OF_LIGHT
#             pred_unscaled = 0.65 * pred_unscaled + 0.35 * lstm_unscaled

#         # mild smoothing with previous step for realism
#         blended = 0.9 * pred_unscaled + 0.1 * previous_output
#         blended[SAT_IDX] = float(np.clip(blended[SAT_IDX], -4.0, 4.0))

#         row = {FEATURES[i]: float(blended[i]) for i in range(len(FEATURES))}
#         row["model_used"] = model_name
#         row["predicted_time"] = (next_day_start + pd.Timedelta(seconds=step * PREDICTION_INTERVAL_SECONDS)).strftime("%Y-%m-%d %H:%M:%S")
#         predicted_data.append(row)

#         previous_output = blended.copy()

#         # prepare next input sequence
#         next_for_scaler = blended.copy()
#         next_for_scaler[SAT_IDX] = next_for_scaler[SAT_IDX] * SPEED_OF_LIGHT
#         next_scaled = scaler.transform(next_for_scaler.reshape(1, -1)).reshape(1, 1, len(FEATURES))
#         current_seq = np.concatenate([current_seq[:, 1:, :], next_scaled], axis=1)

#         model_usage[model_name] = model_usage.get(model_name, 0) + 1

#     summary = {
#         "lstm_usage": int(model_usage.get("LSTM", 0)),
#         "transformer_usage": int(model_usage.get("Transformer", 0)),
#         "lstm_percentage": round(model_usage.get("LSTM", 0) / NUM_PREDICTIONS * 100, 2),
#         "transformer_percentage": round(model_usage.get("Transformer", 0) / NUM_PREDICTIONS * 100, 2),
#         "dataset_large_gaps": bool(dataset_large_gaps),
#     }

#     return {
#         "prediction": predicted_data,
#         "table_data": df.to_dict(orient="records"),
#         "summary": summary
#     }

# async def predict(file: UploadFile):
#     try:
#         df = _load_dataframe_from_upload(file)
#         prepared, meta = _prepare_dataframe(df)
#         result = _generate_predictions(prepared)
#         result["ingest_metadata"] = meta
#         return result
#     except Exception as e:
#         return {"error": str(e)}














































# check notes


# # backend/predict.py
# import os
# from pathlib import Path
# from typing import Any, Dict, Tuple
# import numpy as np
# import pandas as pd
# from fastapi import UploadFile
# import joblib
# from tensorflow.keras.models import load_model
# import math

# # ---------- CONSTANTS ----------
# BASE_DIR = Path(__file__).resolve().parent
# MODELS_DIR = BASE_DIR / "models"
# SPEED_OF_LIGHT = 299_792_458.0  # meters/sec

# FEATURES = ["x_error", "y_error", "z_error", "satclockerror"]
# TIME_STEPS = 20
# NUM_PREDICTIONS = 96
# PREDICTION_INTERVAL_SECONDS = 900
# LONG_HORIZON_THRESHOLD = 3600  # 1 hour
# SAT_IDX = FEATURES.index("satclockerror")

# _lstm_model = None
# _transformer_model = None
# _scaler = None


# # ---------- UTILS ----------
# def _safe_scale(scaler, arr, inverse=False):
#     """Safe scaling without feature name warnings."""
#     if hasattr(scaler, "feature_names_in_"):
#         df = pd.DataFrame(arr, columns=list(scaler.feature_names_in_))
#         return scaler.inverse_transform(df) if inverse else scaler.transform(df)
#     else:
#         return scaler.inverse_transform(arr) if inverse else scaler.transform(arr)


# def _make_json_safe(obj):
#     """Convert NaN, inf, or invalid float values into safe JSON-compatible types."""
#     if isinstance(obj, dict):
#         return {k: _make_json_safe(v) for k, v in obj.items()}
#     elif isinstance(obj, list):
#         return [_make_json_safe(v) for v in obj]
#     elif isinstance(obj, float):
#         if math.isnan(obj) or math.isinf(obj):
#             return 0.0
#         return float(obj)
#     else:
#         return obj


# # ---------- MODEL LOADING ----------
# def get_models_and_scaler():
#     global _lstm_model, _transformer_model, _scaler

#     if _lstm_model is None:
#         lstm_path = MODELS_DIR / "lstm_model.keras"
#         if not lstm_path.exists():
#             raise FileNotFoundError(f"Missing {lstm_path}")
#         _lstm_model = load_model(str(lstm_path), compile=False)

#     if _transformer_model is None:
#         transformer_path = MODELS_DIR / "transformer_model.keras"
#         if not transformer_path.exists():
#             raise FileNotFoundError(f"Missing {transformer_path}")
#         _transformer_model = load_model(str(transformer_path), compile=False)

#     if _scaler is None:
#         scaler_path = MODELS_DIR / "scaler.pkl"
#         if not scaler_path.exists():
#             raise FileNotFoundError(f"Missing {scaler_path}")
#         _scaler = joblib.load(str(scaler_path))

#     return _lstm_model, _transformer_model, _scaler


# # ---------- FILE + DATA PREP ----------
# def _load_dataframe_from_upload(file: UploadFile) -> pd.DataFrame:
#     df = pd.read_csv(file.file)
#     file.file.seek(0)
#     return df


# def _prepare_dataframe(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
#     df = df.copy()
#     df.columns = df.columns.str.strip().str.lower()
#     df.rename(
#         columns={
#             "x_error (m)": "x_error",
#             "y_error (m)": "y_error",
#             "z_error (m)": "z_error",
#             "satclockerror (m)": "satclockerror",
#         },
#         inplace=True,
#     )

#     if "utc_time" in df.columns:
#         df["utc_time"] = pd.to_datetime(df["utc_time"], errors="coerce")
#         df = df.dropna(subset=["utc_time"]).sort_values("utc_time").reset_index(drop=True)
#         df["delta_sec"] = df["utc_time"].diff().dt.total_seconds().fillna(0)
#     else:
#         df["utc_time"] = pd.NaT
#         df["delta_sec"] = 0

#     for c in FEATURES:
#         if c in df.columns:
#             df[c] = pd.to_numeric(df[c], errors="coerce")
#     df = df.dropna(subset=FEATURES)

#     # Convert satclockerror to meters if in seconds
#     if "satclockerror" in df.columns:
#         sat = df["satclockerror"].astype(float)
#         if sat.abs().median() < 10:
#             df["satclockerror"] = sat * SPEED_OF_LIGHT

#     metadata = {"record_count": int(len(df))}
#     return df, metadata


# # ---------- PREDICTION CORE ----------
# def _generate_predictions(df: pd.DataFrame) -> Dict[str, Any]:
#     lstm_model, transformer_model, scaler = get_models_and_scaler()

#     feature_data = df[FEATURES].values.astype(float)
#     scaled = _safe_scale(scaler, feature_data, inverse=False)

#     if len(scaled) < TIME_STEPS:
#         pad_count = TIME_STEPS - len(scaled)
#         scaled = np.vstack([np.tile(scaled[-1], (pad_count, 1)), scaled])

#     current_seq = scaled[-TIME_STEPS:].reshape(1, TIME_STEPS, len(FEATURES))
#     predicted_data = []
#     model_usage = {"LSTM": 0, "Transformer": 0}
#     previous_output = feature_data[-1].astype(float)
#     hist_std = pd.DataFrame(feature_data, columns=FEATURES).std().replace(0, 1e-6).to_dict()

#     if df["utc_time"].notna().any():
#         last_time = df["utc_time"].iloc[-1]
#         next_day_start = pd.Timestamp(last_time.date()) + pd.Timedelta(days=1)
#     else:
#         next_day_start = pd.Timestamp.now().normalize() + pd.Timedelta(days=1)

#     rng = np.random.default_rng()

#     # Determine model switch dynamically for mixed intervals
#     for step in range(NUM_PREDICTIONS):
#         local_gap = df["delta_sec"].iloc[min(step % len(df), len(df) - 1)]

#         if local_gap >= LONG_HORIZON_THRESHOLD:
#             model = transformer_model
#             model_name = "Transformer"
#         else:
#             model = lstm_model
#             model_name = "LSTM"

#         pred_scaled = model.predict(current_seq, verbose=0)
#         pred_unscaled = _safe_scale(scaler, np.atleast_2d(pred_scaled.reshape(-1)), inverse=True)[0]
#         pred_unscaled[SAT_IDX] /= SPEED_OF_LIGHT

#         # Smoothing + controlled noise for realistic pattern
#         prev_in_seconds = previous_output.copy()
#         prev_in_seconds[SAT_IDX] /= SPEED_OF_LIGHT
#         blended = 0.88 * pred_unscaled + 0.12 * prev_in_seconds

#         noise = np.zeros_like(blended)
#         for i, feat in enumerate(FEATURES):
#             if feat == "satclockerror":
#                 sat_std_seconds = hist_std[feat] / SPEED_OF_LIGHT
#                 noise_scale = max(1e-6, 0.15 * sat_std_seconds)
#             else:
#                 noise_scale = max(1e-6, 0.12 * hist_std[feat])
#             noise[i] = rng.normal(0.0, noise_scale)
#         blended += noise
#         blended[SAT_IDX] = float(np.clip(blended[SAT_IDX], -4.0, 4.0))

#         row = {FEATURES[i]: float(blended[i]) for i in range(len(FEATURES))}
#         row["model_used"] = model_name
#         row["predicted_time"] = (
#             next_day_start + pd.Timedelta(seconds=step * PREDICTION_INTERVAL_SECONDS)
#         ).strftime("%Y-%m-%d %H:%M:%S")
#         predicted_data.append(row)

#         # Update sequence for next step
#         next_prev = blended.copy()
#         next_prev[SAT_IDX] *= SPEED_OF_LIGHT
#         previous_output = next_prev.copy()
#         next_scaled = _safe_scale(
#             scaler, next_prev.reshape(1, -1), inverse=False
#         ).reshape(1, 1, len(FEATURES))
#         current_seq = np.concatenate([current_seq[:, 1:, :], next_scaled], axis=1)

#         model_usage[model_name] += 1

#     # Display table (convert satclockerror back to seconds)
#     display_table = df.copy()
#     display_table["satclockerror"] = display_table["satclockerror"] / SPEED_OF_LIGHT

#     summary = {
#         "lstm_usage": int(model_usage["LSTM"]),
#         "transformer_usage": int(model_usage["Transformer"]),
#         "lstm_percentage": round(model_usage["LSTM"] / NUM_PREDICTIONS * 100, 2),
#         "transformer_percentage": round(model_usage["Transformer"] / NUM_PREDICTIONS * 100, 2),
#     }

#     # Clean data for JSON output
#     predicted_data = _make_json_safe(predicted_data)
#     table_records = _make_json_safe(display_table.to_dict(orient="records"))
#     summary = _make_json_safe(summary)

#     return {
#         "prediction": predicted_data,
#         "table_data": table_records,
#         "summary": summary,
#     }


# # ---------- ENTRY POINT ----------
# async def predict(file: UploadFile):
#     try:
#         df = _load_dataframe_from_upload(file)
#         prepared, meta = _prepare_dataframe(df)
#         result = _generate_predictions(prepared)
#         result["ingest_metadata"] = meta
#         return result
#     except Exception as e:
#         return {"error": str(e)}






















# summa checkkkk


# # backend/predict.py
# import os
# from pathlib import Path
# from typing import Any, Dict, Tuple
# import numpy as np
# import pandas as pd
# from fastapi import UploadFile
# import joblib
# from tensorflow.keras.models import load_model

# BASE_DIR = Path(__file__).resolve().parent
# MODELS_DIR = BASE_DIR / "models"
# SPEED_OF_LIGHT = 299_792_458.0

# FEATURES = ["x_error", "y_error", "z_error", "satclockerror"]
# TIME_STEPS = 20
# NUM_PREDICTIONS = 96
# PREDICTION_INTERVAL_SECONDS = 900
# LONG_HORIZON_THRESHOLD = 3600  # 1 hour
# SAT_IDX = FEATURES.index("satclockerror")

# _lstm_model = None
# _transformer_model = None
# _scaler = None


# def _safe_scale(scaler, arr, inverse=False):
#     """Safe scaling to prevent sklearn feature name warning"""
#     if hasattr(scaler, "feature_names_in_"):
#         df = pd.DataFrame(arr, columns=list(scaler.feature_names_in_))
#         return scaler.inverse_transform(df) if inverse else scaler.transform(df)
#     else:
#         return scaler.inverse_transform(arr) if inverse else scaler.transform(arr)


# def get_models_and_scaler():
#     global _lstm_model, _transformer_model, _scaler
#     if _lstm_model is None:
#         lstm_path = MODELS_DIR / "lstm_model.keras"
#         if not lstm_path.exists():
#             raise FileNotFoundError(f"Missing {lstm_path}")
#         _lstm_model = load_model(str(lstm_path), compile=False)

#     if _transformer_model is None:
#         trans_path = MODELS_DIR / "transformer_model.keras"
#         if not trans_path.exists():
#             raise FileNotFoundError(f"Missing {trans_path}")
#         _transformer_model = load_model(str(trans_path), compile=False)

#     if _scaler is None:
#         scaler_path = MODELS_DIR / "scaler.pkl"
#         if not scaler_path.exists():
#             raise FileNotFoundError(f"Missing {scaler_path}")
#         _scaler = joblib.load(str(scaler_path))

#     return _lstm_model, _transformer_model, _scaler


# def _load_dataframe_from_upload(file: UploadFile) -> pd.DataFrame:
#     df = pd.read_csv(file.file)
#     file.file.seek(0)
#     return df


# def _prepare_dataframe(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
#     df = df.copy()
#     df.columns = df.columns.str.strip().str.lower()
#     df.rename(columns={
#         "x_error (m)": "x_error",
#         "y_error (m)": "y_error",
#         "z_error (m)": "z_error",
#         "satclockerror (m)": "satclockerror"
#     }, inplace=True)

#     if "utc_time" in df.columns:
#         df["utc_time"] = pd.to_datetime(df["utc_time"], errors="coerce")
#         df = df.dropna(subset=["utc_time"]).sort_values("utc_time").reset_index(drop=True)
#         df["delta_sec"] = df["utc_time"].diff().dt.total_seconds().fillna(PREDICTION_INTERVAL_SECONDS)
#     else:
#         df["utc_time"] = pd.NaT
#         df["delta_sec"] = PREDICTION_INTERVAL_SECONDS

#     for c in FEATURES:
#         if c in df.columns:
#             df[c] = pd.to_numeric(df[c], errors="coerce")
#     df = df.dropna(subset=FEATURES)

#     # convert satclockerror to meters if given in seconds
#     if "satclockerror" in df.columns:
#         sat = df["satclockerror"].astype(float)
#         if sat.abs().median() < 10:  # probably in seconds
#             df["satclockerror"] = sat * SPEED_OF_LIGHT

#     metadata = {"record_count": int(len(df))}
#     return df, metadata


# def _generate_predictions(df: pd.DataFrame) -> Dict[str, Any]:
#     """Dynamic hybrid prediction per step based on interval"""
#     lstm_model, transformer_model, scaler = get_models_and_scaler()

#     feature_data = df[FEATURES].values.astype(float)
#     scaled = _safe_scale(scaler, feature_data, inverse=False)

#     if len(scaled) < TIME_STEPS:
#         pad_count = TIME_STEPS - len(scaled)
#         scaled = np.vstack([np.tile(scaled[-1], (pad_count, 1)), scaled])

#     current_seq = scaled[-TIME_STEPS:].reshape(1, TIME_STEPS, len(FEATURES))
#     predicted_data = []
#     model_usage = {"LSTM": 0, "Transformer": 0}
#     previous_output = feature_data[-1].astype(float)
#     hist_std = pd.DataFrame(feature_data, columns=FEATURES).std().replace(0, 1e-6).to_dict()

#     if df["utc_time"].notna().any():
#         last_time = df["utc_time"].iloc[-1]
#         next_pred_time = last_time + pd.Timedelta(seconds=PREDICTION_INTERVAL_SECONDS)
#     else:
#         next_pred_time = pd.Timestamp.now().normalize()

#     rng = np.random.default_rng()

#     for step in range(NUM_PREDICTIONS):
#         # --- Step 1: Determine time gap for this prediction dynamically ---
#         # If there is historical delta just before this prediction, use it
#         if df["delta_sec"].notna().any():
#             local_gap = df["delta_sec"].iloc[-1]  # last actual interval
#         else:
#             local_gap = PREDICTION_INTERVAL_SECONDS

#         # Model choice: LSTM if short gap, Transformer if gap > 1 hour
#         if local_gap >= LONG_HORIZON_THRESHOLD:
#             model = transformer_model
#             model_name = "Transformer"
#         else:
#             model = lstm_model
#             model_name = "LSTM"

#         # --- Step 2: Predict and unscale ---
#         pred_scaled = model.predict(current_seq, verbose=0)
#         pred_unscaled = _safe_scale(scaler, np.atleast_2d(pred_scaled.reshape(-1)), inverse=True)[0]
#         pred_unscaled[SAT_IDX] /= SPEED_OF_LIGHT

#         # --- Step 3: Smooth and add noise ---
#         prev_in_seconds = previous_output.copy()
#         prev_in_seconds[SAT_IDX] /= SPEED_OF_LIGHT
#         blended = 0.88 * pred_unscaled + 0.12 * prev_in_seconds

#         noise = np.zeros_like(blended)
#         for i, feat in enumerate(FEATURES):
#             if feat == "satclockerror":
#                 sat_std_seconds = hist_std[feat] / SPEED_OF_LIGHT
#                 noise_scale = max(1e-6, 0.15 * sat_std_seconds)
#             else:
#                 noise_scale = max(1e-6, 0.12 * hist_std[feat])
#             noise[i] = rng.normal(0.0, noise_scale)
#         blended += noise
#         blended[SAT_IDX] = float(np.clip(blended[SAT_IDX], -4.0, 4.0))

#         # --- Step 4: Save prediction ---
#         row = {FEATURES[i]: float(blended[i]) for i in range(len(FEATURES))}
#         row["model_used"] = model_name
#         row["predicted_time"] = next_pred_time.strftime("%Y-%m-%d %H:%M:%S")
#         predicted_data.append(row)

#         # --- Step 5: Update for next prediction ---
#         previous_output = blended.copy()
#         previous_output[SAT_IDX] *= SPEED_OF_LIGHT  # back to meters
#         next_scaled = _safe_scale(scaler, previous_output.reshape(1, -1), inverse=False).reshape(1, 1, len(FEATURES))
#         current_seq = np.concatenate([current_seq[:, 1:, :], next_scaled], axis=1)

#         # increment next prediction timestamp
#         next_pred_time += pd.Timedelta(seconds=PREDICTION_INTERVAL_SECONDS)

#         model_usage[model_name] += 1

#     # Convert satclock back to seconds for display
#     display_table = df.copy()
#     display_table["satclockerror"] = display_table["satclockerror"] / SPEED_OF_LIGHT

#     summary = {
#         "lstm_usage": int(model_usage["LSTM"]),
#         "transformer_usage": int(model_usage["Transformer"]),
#         "lstm_percentage": round(model_usage["LSTM"] / NUM_PREDICTIONS * 100, 2),
#         "transformer_percentage": round(model_usage["Transformer"] / NUM_PREDICTIONS * 100, 2),
#     }

#     return {
#         "prediction": predicted_data,
#         "table_data": display_table.to_dict(orient="records"),
#         "summary": summary,
#     }


# async def predict(file: UploadFile):
#     try:
#         df = _load_dataframe_from_upload(file)
#         prepared, meta = _prepare_dataframe(df)
#         result = _generate_predictions(prepared)
#         result["ingest_metadata"] = meta
#         return result
#     except Exception as e:
#         return {"error": str(e)}



























# niceeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
















# import os
# from pathlib import Path
# from typing import Any, Dict, Tuple
# import numpy as np
# import pandas as pd
# from fastapi import UploadFile
# import joblib
# from tensorflow.keras.models import load_model

# BASE_DIR = Path(__file__).resolve().parent
# MODELS_DIR = BASE_DIR / "models"
# SPEED_OF_LIGHT = 299_792_458.0

# FEATURES = ["x_error", "y_error", "z_error", "satclockerror"]
# TIME_STEPS = 20
# NUM_PREDICTIONS = 96
# PREDICTION_INTERVAL_SECONDS = 900
# LONG_HORIZON_THRESHOLD = 3600  # 1 hour
# SAT_IDX = FEATURES.index("satclockerror")

# _lstm_model = None
# _transformer_model = None
# _scaler = None


# def _safe_scale(scaler, arr, inverse=False):
#     """Safe scaling to prevent sklearn feature name warning"""
#     if hasattr(scaler, "feature_names_in_"):
#         df = pd.DataFrame(arr, columns=list(scaler.feature_names_in_))
#         return scaler.inverse_transform(df) if inverse else scaler.transform(df)
#     else:
#         return scaler.inverse_transform(arr) if inverse else scaler.transform(arr)


# def get_models_and_scaler():
#     global _lstm_model, _transformer_model, _scaler
#     if _lstm_model is None:
#         lstm_path = MODELS_DIR / "lstm_model.keras"
#         if not lstm_path.exists():
#             raise FileNotFoundError(f"Missing {lstm_path}")
#         _lstm_model = load_model(str(lstm_path), compile=False)

#     if _transformer_model is None:
#         trans_path = MODELS_DIR / "transformer_model.keras"
#         if not trans_path.exists():
#             raise FileNotFoundError(f"Missing {trans_path}")
#         _transformer_model = load_model(str(trans_path), compile=False)

#     if _scaler is None:
#         scaler_path = MODELS_DIR / "scaler.pkl"
#         if not scaler_path.exists():
#             raise FileNotFoundError(f"Missing {scaler_path}")
#         _scaler = joblib.load(str(scaler_path))

#     return _lstm_model, _transformer_model, _scaler


# def _load_dataframe_from_upload(file: UploadFile) -> pd.DataFrame:
#     df = pd.read_csv(file.file)
#     file.file.seek(0)
#     return df


# def _prepare_dataframe(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
#     df = df.copy()
#     df.columns = df.columns.str.strip().str.lower()
#     df.rename(columns={
#         "x_error (m)": "x_error",
#         "y_error (m)": "y_error",
#         "z_error (m)": "z_error",
#         "satclockerror (m)": "satclockerror"
#     }, inplace=True)

#     if "utc_time" in df.columns:
#         df["utc_time"] = pd.to_datetime(df["utc_time"], errors="coerce")
#         df = df.dropna(subset=["utc_time"]).sort_values("utc_time").reset_index(drop=True)
#         df["delta_sec"] = df["utc_time"].diff().dt.total_seconds().fillna(PREDICTION_INTERVAL_SECONDS)
#     else:
#         df["utc_time"] = pd.NaT
#         df["delta_sec"] = PREDICTION_INTERVAL_SECONDS

#     for c in FEATURES:
#         if c in df.columns:
#             df[c] = pd.to_numeric(df[c], errors="coerce")
#     df = df.dropna(subset=FEATURES)

#     # convert satclockerror to meters if given in seconds
#     if "satclockerror" in df.columns:
#         sat = df["satclockerror"].astype(float)
#         if sat.abs().median() < 10:  # probably in seconds
#             df["satclockerror"] = sat * SPEED_OF_LIGHT

#     metadata = {"record_count": int(len(df))}
#     return df, metadata


# def _generate_predictions(df: pd.DataFrame) -> Dict[str, Any]:
#     """Dynamic hybrid prediction per step based on interval"""
#     lstm_model, transformer_model, scaler = get_models_and_scaler()
#     feature_data = df[FEATURES].values.astype(float)
#     scaled = _safe_scale(scaler, feature_data, inverse=False)

#     if len(scaled) < TIME_STEPS:
#         pad_count = TIME_STEPS - len(scaled)
#         scaled = np.vstack([np.tile(scaled[-1], (pad_count, 1)), scaled])

#     current_seq = scaled[-TIME_STEPS:].reshape(1, TIME_STEPS, len(FEATURES))
#     predicted_data = []
#     model_usage = {"LSTM": 0, "Transformer": 0}
#     previous_output = feature_data[-1].astype(float)
#     hist_std = pd.DataFrame(feature_data, columns=FEATURES).std().replace(0, 1e-6).to_dict()

#     if df["utc_time"].notna().any():
#         last_time = df["utc_time"].iloc[-1]
#         next_pred_time = last_time + pd.Timedelta(seconds=PREDICTION_INTERVAL_SECONDS)
#     else:
#         next_pred_time = pd.Timestamp.now().normalize()

#     rng = np.random.default_rng()

#     # Prepare delta series for hybrid decision
#     delta_series = df["delta_sec"].fillna(PREDICTION_INTERVAL_SECONDS).values
#     if len(delta_series) < NUM_PREDICTIONS:
#         delta_series = np.concatenate([delta_series, np.full(NUM_PREDICTIONS - len(delta_series), delta_series[-1])])

#     for step in range(NUM_PREDICTIONS):
#         local_gap = delta_series[step] if step < len(delta_series) else PREDICTION_INTERVAL_SECONDS

#         # --- Hybrid model selection per interval ---
#         if local_gap >= LONG_HORIZON_THRESHOLD:
#             model = transformer_model
#             model_name = "Transformer"
#         else:
#             model = lstm_model
#             model_name = "LSTM"

#         # --- Step 2: Predict and unscale ---
#         pred_scaled = model.predict(current_seq, verbose=0)
#         pred_unscaled = _safe_scale(scaler, np.atleast_2d(pred_scaled.reshape(-1)), inverse=True)[0]
#         pred_unscaled[SAT_IDX] /= SPEED_OF_LIGHT

#         # --- Step 3: Smooth and add noise ---
#         prev_in_seconds = previous_output.copy()
#         prev_in_seconds[SAT_IDX] /= SPEED_OF_LIGHT
#         blended = 0.88 * pred_unscaled + 0.12 * prev_in_seconds

#         noise = np.zeros_like(blended)
#         for i, feat in enumerate(FEATURES):
#             if feat == "satclockerror":
#                 sat_std_seconds = hist_std[feat] / SPEED_OF_LIGHT
#                 noise_scale = max(1e-6, 0.15 * sat_std_seconds)
#             else:
#                 noise_scale = max(1e-6, 0.12 * hist_std[feat])
#             noise[i] = rng.normal(0.0, noise_scale)
#         blended += noise
#         blended[SAT_IDX] = float(np.clip(blended[SAT_IDX], -4.0, 4.0))

#         # --- Step 4: Save prediction ---
#         row = {FEATURES[i]: float(blended[i]) for i in range(len(FEATURES))}
#         row["model_used"] = model_name
#         row["predicted_time"] = next_pred_time.strftime("%Y-%m-%d %H:%M:%S")
#         predicted_data.append(row)

#         # --- Step 5: Update for next prediction ---
#         previous_output = blended.copy()
#         previous_output[SAT_IDX] *= SPEED_OF_LIGHT  # back to meters
#         next_scaled = _safe_scale(scaler, previous_output.reshape(1, -1), inverse=False).reshape(1, 1, len(FEATURES))
#         current_seq = np.concatenate([current_seq[:, 1:, :], next_scaled], axis=1)

#         next_pred_time += pd.Timedelta(seconds=PREDICTION_INTERVAL_SECONDS)
#         model_usage[model_name] += 1

#     display_table = df.copy()
#     display_table["satclockerror"] = display_table["satclockerror"] / SPEED_OF_LIGHT

#     summary = {
#         "lstm_usage": int(model_usage["LSTM"]),
#         "transformer_usage": int(model_usage["Transformer"]),
#         "lstm_percentage": round(model_usage["LSTM"] / NUM_PREDICTIONS * 100, 2),
#         "transformer_percentage": round(model_usage["Transformer"] / NUM_PREDICTIONS * 100, 2),
#     }

#     return {
#         "prediction": predicted_data,
#         "table_data": display_table.to_dict(orient="records"),
#         "summary": summary,
#     }


# async def predict(file: UploadFile):
#     try:
#         df = _load_dataframe_from_upload(file)
#         prepared, meta = _prepare_dataframe(df)
#         result = _generate_predictions(prepared)
#         result["ingest_metadata"] = meta
#         return result
#     except Exception as e:
#         return {"error": str(e)}








# summa checkkkk



# backend/predict.py
import os
from pathlib import Path
from typing import Any, Dict, Tuple
import numpy as np
import pandas as pd
from fastapi import UploadFile
import joblib
from tensorflow.keras.models import load_model

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
SPEED_OF_LIGHT = 299_792_458.0

FEATURES = ["x_error", "y_error", "z_error", "satclockerror"]
TIME_STEPS = 20
NUM_PREDICTIONS = 96
PREDICTION_INTERVAL_SECONDS = 900
LONG_HORIZON_THRESHOLD = 3600  # 1 hour
SAT_IDX = FEATURES.index("satclockerror")

_lstm_model = None
_transformer_model = None
_scaler = None


def _safe_scale(scaler, arr, inverse=False):
    """Scale/ inverse-scale safely handling 1D or 2D arrays and sklearn scalers with feature_names_in_."""
    arr_np = np.asarray(arr, dtype=float)
    if arr_np.ndim == 1:
        arr_2d = arr_np.reshape(1, -1)
    else:
        arr_2d = arr_np
    if hasattr(scaler, "feature_names_in_"):
        cols = list(scaler.feature_names_in_)
        df = pd.DataFrame(arr_2d, columns=cols)
        return scaler.inverse_transform(df) if inverse else scaler.transform(df)
    else:
        return scaler.inverse_transform(arr_2d) if inverse else scaler.transform(arr_2d)


def get_models_and_scaler():
    global _lstm_model, _transformer_model, _scaler
    if _lstm_model is None:
        lstm_path = MODELS_DIR / "lstm_model.keras"
        if not lstm_path.exists():
            raise FileNotFoundError(f"Missing {lstm_path}")
        _lstm_model = load_model(str(lstm_path), compile=False)

    if _transformer_model is None:
        trans_path = MODELS_DIR / "transformer_model.keras"
        if not trans_path.exists():
            raise FileNotFoundError(f"Missing {trans_path}")
        _transformer_model = load_model(str(trans_path), compile=False)

    if _scaler is None:
        scaler_path = MODELS_DIR / "scaler.pkl"
        if not scaler_path.exists():
            raise FileNotFoundError(f"Missing {scaler_path}")
        _scaler = joblib.load(str(scaler_path))

    return _lstm_model, _transformer_model, _scaler


def _load_dataframe_from_upload(file: UploadFile) -> pd.DataFrame:
    df = pd.read_csv(file.file)
    file.file.seek(0)
    return df


def _prepare_dataframe(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    df = df.copy()
    df.columns = df.columns.str.strip().str.lower()
    df.rename(columns={
        "x_error (m)": "x_error",
        "y_error (m)": "y_error",
        "z_error (m)": "z_error",
        "satclockerror (m)": "satclockerror"
    }, inplace=True)

    if "utc_time" in df.columns:
        df["utc_time"] = pd.to_datetime(df["utc_time"], errors="coerce")
        df = df.dropna(subset=["utc_time"]).sort_values("utc_time").reset_index(drop=True)
        df["delta_sec"] = df["utc_time"].diff().dt.total_seconds().fillna(PREDICTION_INTERVAL_SECONDS)
    else:
        df["utc_time"] = pd.NaT
        df["delta_sec"] = PREDICTION_INTERVAL_SECONDS

    for c in FEATURES:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce")
    df = df.dropna(subset=FEATURES).reset_index(drop=True)

    if "satclockerror" in df.columns:
        sat = pd.to_numeric(df["satclockerror"], errors="coerce")
        # If median absolute value < 10, assume seconds -> convert internally to meters
        if sat.abs().median() < 10:
            df["satclockerror"] = sat * SPEED_OF_LIGHT

    metadata = {"record_count": int(len(df))}
    return df, metadata


def _compute_accuracy_backtest(df: pd.DataFrame, lstm_model, transformer_model, scaler) -> Dict[str, Any]:
    """
    Backtest routine:
      - sliding-window predictions from TIME_STEPS..n-1
      - chooses model per-window based on df.delta_sec
      - returns RMSE, MAE and R^2 for each feature (satclock reported in seconds)
      - returns 3D ephemeris RMSE & MAE (meters)
    """
    feature_data = df[FEATURES].values.astype(float)
    n = len(feature_data)
    if n <= TIME_STEPS:
        return {"sample_size": 0}

    y_trues, y_preds, model_used_list = [], [], []

    for t in range(TIME_STEPS, n):
        window = feature_data[t - TIME_STEPS:t]
        scaled_window = _safe_scale(scaler, window, inverse=False)
        current_seq = scaled_window.reshape(1, TIME_STEPS, len(FEATURES))

        local_gap = float(df["delta_sec"].iloc[t - 1]) if "delta_sec" in df.columns else PREDICTION_INTERVAL_SECONDS
        model = transformer_model if local_gap >= LONG_HORIZON_THRESHOLD else lstm_model
        model_name = "Transformer" if local_gap >= LONG_HORIZON_THRESHOLD else "LSTM"

        pred_scaled = model.predict(current_seq, verbose=0)
        pred_unscaled = _safe_scale(scaler, np.atleast_2d(pred_scaled.reshape(-1)), inverse=True)[0]

        # Convert satclock from meters -> seconds for metric comparison
        pred_unscaled_seconds = pred_unscaled.copy()
        pred_unscaled_seconds[SAT_IDX] = pred_unscaled_seconds[SAT_IDX] / SPEED_OF_LIGHT

        true = feature_data[t].copy()
        true_seconds = true.copy()
        true_seconds[SAT_IDX] = true_seconds[SAT_IDX] / SPEED_OF_LIGHT

        y_trues.append(true_seconds)
        y_preds.append(pred_unscaled_seconds)
        model_used_list.append(model_name)

    y_trues = np.vstack(y_trues)
    y_preds = np.vstack(y_preds)
    metrics: Dict[str, Dict[str, Any]] = {}

    for i, feat in enumerate(FEATURES):
        y_true_col = y_trues[:, i]
        y_pred_col = y_preds[:, i]

        rmse = float(np.sqrt(np.mean((y_true_col - y_pred_col) ** 2)))
        mae = float(np.mean(np.abs(y_true_col - y_pred_col)))
        ss_res = np.sum((y_true_col - y_pred_col) ** 2)
        ss_tot = np.sum((y_true_col - np.mean(y_true_col)) ** 2)
        r2 = float(1.0 - ss_res / ss_tot) if ss_tot > 0 else None

        metrics[feat] = {"rmse": rmse, "mae": mae, "r2": r2}

    # 3D ephemeris metrics (X,Y,Z are in meters in y_preds/y_trues)
    pred_xyz = y_preds[:, 0:3]
    true_xyz = y_trues[:, 0:3]
    euclid = np.linalg.norm(pred_xyz - true_xyz, axis=1)
    epi_rmse = float(np.sqrt(np.mean(euclid ** 2)))
    epi_mae = float(np.mean(np.abs(euclid)))

    return {
        "sample_size": int(len(y_trues)),
        "per_axis": {k: metrics[k] for k in ["x_error", "y_error", "z_error"]},
        "three_dimensional": {"rmse": epi_rmse, "mae": epi_mae},
        # satclockerror metrics are in seconds (rmse/mae)
        "satclockerror": metrics["satclockerror"],
        "model_usage_in_backtest": {
            "LSTM": int(model_used_list.count("LSTM")),
            "Transformer": int(model_used_list.count("Transformer")),
        },
    }


def _generate_predictions(df: pd.DataFrame) -> Dict[str, Any]:
    lstm_model, transformer_model, scaler = get_models_and_scaler()
    feature_data = df[FEATURES].values.astype(float)
    scaled = _safe_scale(scaler, feature_data, inverse=False)

    if len(scaled) < TIME_STEPS:
        scaled = np.vstack([np.tile(scaled[-1], (TIME_STEPS - len(scaled), 1)), scaled])

    current_seq = scaled[-TIME_STEPS:].reshape(1, TIME_STEPS, len(FEATURES))
    predicted_data, model_usage = [], {"LSTM": 0, "Transformer": 0}
    previous_output = feature_data[-1].astype(float)
    hist_std = pd.DataFrame(feature_data, columns=FEATURES).std().replace(0, 1e-6).to_dict()

    next_pred_time = (df["utc_time"].iloc[-1] + pd.Timedelta(seconds=PREDICTION_INTERVAL_SECONDS)
                      if df["utc_time"].notna().any() else pd.Timestamp.now().normalize())

    rng = np.random.default_rng()
    delta_series = df["delta_sec"].fillna(PREDICTION_INTERVAL_SECONDS).values
    if len(delta_series) < NUM_PREDICTIONS:
        delta_series = np.concatenate([delta_series, np.full(NUM_PREDICTIONS - len(delta_series), delta_series[-1])])

    for step in range(NUM_PREDICTIONS):
        local_gap = float(delta_series[step]) if step < len(delta_series) else PREDICTION_INTERVAL_SECONDS
        model = transformer_model if local_gap >= LONG_HORIZON_THRESHOLD else lstm_model
        model_name = "Transformer" if local_gap >= LONG_HORIZON_THRESHOLD else "LSTM"

        pred_scaled = model.predict(current_seq, verbose=0)
        pred_unscaled = _safe_scale(scaler, np.atleast_2d(pred_scaled.reshape(-1)), inverse=True)[0]
        # Convert satclock back to seconds for internal blending step
        pred_unscaled[SAT_IDX] /= SPEED_OF_LIGHT

        prev_in_seconds = previous_output.copy()
        prev_in_seconds[SAT_IDX] /= SPEED_OF_LIGHT
        blended = 0.88 * pred_unscaled + 0.12 * prev_in_seconds

        noise = np.zeros_like(blended)
        for i, feat in enumerate(FEATURES):
            std_scale = hist_std[feat] / (SPEED_OF_LIGHT if feat == "satclockerror" else 1)
            noise[i] = rng.normal(0.0, max(1e-8, 0.1 * std_scale))
        blended += noise

        # clamp satclock seconds to reasonable bounds before saving
        blended[SAT_IDX] = float(np.clip(blended[SAT_IDX], -4.0, 4.0))

        row = {FEATURES[i]: float(blended[i]) for i in range(len(FEATURES))}
        row["model_used"] = model_name
        row["predicted_time"] = next_pred_time.strftime("%Y-%m-%d %H:%M:%S")
        predicted_data.append(row)

        # prepare previous_output back in same units as feature_data (satclock in meters)
        previous_output = blended.copy()
        previous_output[SAT_IDX] *= SPEED_OF_LIGHT

        next_scaled = _safe_scale(scaler, previous_output.reshape(1, -1), inverse=False).reshape(1, 1, len(FEATURES))
        current_seq = np.concatenate([current_seq[:, 1:, :], next_scaled], axis=1)

        next_pred_time += pd.Timedelta(seconds=PREDICTION_INTERVAL_SECONDS)
        model_usage[model_name] += 1

    summary = {
        "lstm_usage": model_usage["LSTM"],
        "transformer_usage": model_usage["Transformer"],
        "lstm_percentage": round(model_usage["LSTM"] / NUM_PREDICTIONS * 100, 2),
        "transformer_percentage": round(model_usage["Transformer"] / NUM_PREDICTIONS * 100, 2),
    }

    # compute backtest metrics (RMSE/MAE/R2) — satclock metrics given in seconds
    try:
        accuracy_metrics = _compute_accuracy_backtest(df, lstm_model, transformer_model, scaler)
    except Exception as e:
        accuracy_metrics = {"error": str(e)}

    # Prepare display table: show satclock in seconds and utc_time as string
    display_table = df.copy()
    if "satclockerror" in display_table.columns:
        display_table["satclockerror"] = display_table["satclockerror"].astype(float) / SPEED_OF_LIGHT
    if "utc_time" in display_table.columns:
        display_table["utc_time"] = display_table["utc_time"].dt.strftime("%Y-%m-%d %H:%M:%S").fillna("")

    table_records = []
    for rec in display_table.to_dict(orient="records"):
        sanitized = {}
        for k, v in rec.items():
            if isinstance(v, (np.floating, np.float32, np.float64)):
                sanitized[k] = None if np.isnan(v) else float(v)
            elif isinstance(v, (np.integer, np.int32, np.int64)):
                sanitized[k] = int(v)
            else:
                sanitized[k] = v
        table_records.append(sanitized)

    return {
        "prediction": predicted_data,
        "table_data": table_records,
        "summary": summary,
        "accuracy_metrics": accuracy_metrics,  # contains rmse/mae/r2 for axes and satclock in seconds
    }


async def predict(file: UploadFile):
    try:
        df = _load_dataframe_from_upload(file)
        prepared, meta = _prepare_dataframe(df)
        result = _generate_predictions(prepared)
        result["ingest_metadata"] = meta
        return result
    except Exception as e:
        return {"error": str(e)}
