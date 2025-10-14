# import pandas as pd
# from sklearn.preprocessing import MinMaxScaler
# import numpy as np
# import joblib

# SPEED_OF_LIGHT = 3e8  # meters/second

# def preprocess(file_paths, features=None, scaler_path=None):
#     """
#     Load multiple CSV files, concatenate, preprocess for LSTM/Transformer.
#     Handles missing values and converts clock error to meters.
#     """
#     dfs = []
#     for path in file_paths:
#         df = pd.read_csv(path)
#         df.columns = df.columns.str.replace('\ufeff', '', regex=False).str.strip().str.lower()
#         df = df.rename(columns={
#             "x_error (m)": "x_error",
#             "y_error (m)": "y_error",
#             "z_error (m)": "z_error",
#             "satclockerror (m)": "satclockerror"
#         })
#         dfs.append(df)
#     combined = pd.concat(dfs, ignore_index=True)
    
#     if "utc_time" in combined.columns:
#         combined["utc_time"] = pd.to_datetime(combined["utc_time"], errors="coerce")
#         combined = combined.dropna(subset=["utc_time"]).sort_values("utc_time").reset_index(drop=True)

#     if features is None:
#         features = ["x_error", "y_error", "z_error", "satclockerror"]
    
#     df_features = combined[features].copy()
#     if "satclockerror" in df_features.columns:
#         df_features["satclockerror"] = df_features["satclockerror"] * SPEED_OF_LIGHT

#     df_features = df_features.dropna().reset_index(drop=True)

#     scaler = MinMaxScaler()
#     scaled_data = scaler.fit_transform(df_features)
#     if scaler_path:
#         joblib.dump(scaler, scaler_path)

#     return scaled_data, scaler, combined


# utils/preprocess.py
import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import MinMaxScaler
from pathlib import Path
from typing import Tuple, List

SPEED_OF_LIGHT = 299_792_458.0  # m/s

def load_and_normalize_csv(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    # normalize BOM, trim headers
    df.columns = df.columns.str.replace('\ufeff', '', regex=False).str.strip().str.lower()
    # rename common columns
    df = df.rename(columns={
        "x_error (m)": "x_error",
        "y_error (m)": "y_error",
        "z_error (m)": "z_error",
        "satclockerror (m)": "satclockerror"
    })
    if "utc_time" in df.columns:
        df["utc_time"] = pd.to_datetime(df["utc_time"], errors="coerce")
        df = df.dropna(subset=["utc_time"]).sort_values("utc_time").reset_index(drop=True)
    return df

def preprocess(file_paths: List[str], features=None, scaler_path: str | None = None
              ) -> Tuple[np.ndarray, MinMaxScaler, pd.DataFrame]:
    """
    Loads multiple CSVs, concatenates, converts satclockerror to meters (for scaling),
    drops NaNs, fits MinMaxScaler and returns scaled_data, scaler, combined_df.
    """
    if features is None:
        features = ["x_error", "y_error", "z_error", "satclockerror"]

    dfs = []
    for p in file_paths:
        dfs.append(load_and_normalize_csv(p))
    combined = pd.concat(dfs, ignore_index=True)

    # keep only features and drop rows with NaNs in features
    df_features = combined[features].copy()
    # convert satclockerror (if in seconds) to meters for scaling consistency
    # If magnitudes are small (abs median < 10), assume it's seconds -> convert to meters
    sat = pd.to_numeric(df_features.get("satclockerror"), errors="coerce")
    if not sat.dropna().empty and sat.abs().median() < 10:
        df_features["satclockerror"] = sat * SPEED_OF_LIGHT

    df_features = df_features.dropna().reset_index(drop=True)

    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(df_features)
    if scaler_path:
        joblib.dump(scaler, scaler_path)

    return scaled_data, scaler, combined

def create_sequences(data: np.ndarray, time_steps: int = 20):
    """
    Create (X, y) windows using vectorized sliding windows.
    data is 2D (n_samples, n_features) scaled.
    """
    n = data.shape[0]
    if n <= time_steps:
        return np.empty((0, time_steps, data.shape[1])), np.empty((0, data.shape[1]))
    X = np.lib.stride_tricks.sliding_window_view(data, (time_steps, data.shape[1]))[:, 0, :, :]
    # sliding_window_view gives shape (n-time_steps+1, 1, time_steps, n_features) in some numpy versions,
    # but the above indexing extracts (num_windows, time_steps, n_features)
    y = data[time_steps:]
    return X, y
