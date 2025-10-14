import pandas as pd
import numpy as np

def median_interval(df, timestamp_col="utc_time"):
    """Calculate median time interval between consecutive timestamps."""
    if timestamp_col not in df.columns or df[timestamp_col].isna().all():
        return 60
    deltas = df[timestamp_col].diff().dropna().dt.total_seconds()
    return np.median(deltas) if not deltas.empty else 60

def large_gap_detected(df, threshold_seconds=3600, timestamp_col="utc_time"):
    """Detect if any large gap exists in UTC timestamps."""
    interval = median_interval(df, timestamp_col)
    return interval > threshold_seconds

def analyze_time_patterns(df, timestamp_col="utc_time"):
    """
    Analyze time patterns in the dataset to understand data characteristics.
    
    Returns:
        dict: Analysis results including gap statistics
    """
    if timestamp_col not in df.columns or df[timestamp_col].isna().all():
        return {
            "has_timestamps": False,
            "median_interval": 60,
            "max_gap": 0,
            "min_gap": 0,
            "gap_count": 0
        }
    
    deltas = df[timestamp_col].diff().dropna().dt.total_seconds()
    
    if deltas.empty:
        return {
            "has_timestamps": True,
            "median_interval": 60,
            "max_gap": 0,
            "min_gap": 0,
            "gap_count": 0
        }
    
    return {
        "has_timestamps": True,
        "median_interval": np.median(deltas),
        "mean_interval": np.mean(deltas),
        "max_gap": np.max(deltas),
        "min_gap": np.min(deltas),
        "gap_count": len(deltas),
        "large_gaps_count": len(deltas[deltas > 3600]),  # Gaps > 1 hour
        "short_gaps_count": len(deltas[deltas <= 1800])  # Gaps <= 30 minutes
    }

def detect_data_continuity(df, timestamp_col="utc_time", short_threshold=1800, long_threshold=3600):
    """
    Detect data continuity patterns for hybrid model selection.
    
    Args:
        df: DataFrame with timestamp data
        timestamp_col: Name of timestamp column
        short_threshold: Threshold for short intervals (seconds)
        long_threshold: Threshold for long intervals (seconds)
        
    Returns:
        dict: Continuity analysis results
    """
    analysis = analyze_time_patterns(df, timestamp_col)
    
    if not analysis["has_timestamps"]:
        return {
            "continuity_type": "unknown",
            "recommended_model": "LSTM",
            "confidence": 0.5
        }
    
    max_gap = analysis["max_gap"]
    median_interval = analysis["median_interval"]
    large_gaps = analysis.get("large_gaps_count", 0)
    total_gaps = analysis.get("gap_count", 1)
    
    # Decision logic for model recommendation
    if max_gap >= long_threshold:
        if large_gaps / total_gaps > 0.3:  # More than 30% large gaps
            return {
                "continuity_type": "irregular_with_large_gaps",
                "recommended_model": "Transformer",
                "confidence": 0.8
            }
        else:
            return {
                "continuity_type": "mostly_continuous_with_some_gaps",
                "recommended_model": "Hybrid",
                "confidence": 0.7
            }
    elif median_interval <= short_threshold:
        return {
            "continuity_type": "continuous_short_intervals",
            "recommended_model": "LSTM",
            "confidence": 0.9
        }
    else:
        return {
            "continuity_type": "medium_intervals",
            "recommended_model": "LSTM",
            "confidence": 0.6
        }

