import pandas as pd
import numpy as np

# Parameters
num_rows = 10000
start_time = pd.Timestamp("2025-09-01 00:00:00")
time_delta = pd.Timedelta(minutes=5)  # 5 min intervals

# Create timestamps
timestamps = [start_time + i * time_delta for i in range(num_rows)]

# Set random seed for reproducibility
np.random.seed(42)

# Simulate MEO satellite errors with smooth drift
x_error = np.cumsum(np.random.normal(0, 0.5, num_rows))  # slow drift
y_error = np.cumsum(np.random.normal(0, 0.5, num_rows))
z_error = np.cumsum(np.random.normal(0, 0.3, num_rows))  # smaller z variation
satclockerror = np.cumsum(np.random.normal(0, 0.05, num_rows))  # clock drift

# Optional: introduce occasional jumps (e.g., maneuver or anomaly)
for i in range(0, num_rows, 2000):
    x_error[i:i+5] += np.random.normal(0, 5, 5)
    y_error[i:i+5] += np.random.normal(0, 5, 5)
    z_error[i:i+5] += np.random.normal(0, 2, 5)
    satclockerror[i:i+5] += np.random.normal(0, 0.2, 5)

# Combine into DataFrame
df = pd.DataFrame({
    "utc_time": timestamps,
    "x_error (m)": x_error,
    "y_error (m)": y_error,
    "z_error (m)": z_error,
    "satclockerror (m)": satclockerror
})

# Save to CSV
df.to_csv("synthetic_meo_drift_10k.csv", index=False)

print("CSV generated: synthetic_meo_drift_10k.csv with 10,000 rows")
