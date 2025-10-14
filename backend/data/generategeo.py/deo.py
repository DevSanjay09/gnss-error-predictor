import pandas as pd
import numpy as np

# Parameters
num_rows = 10000
start_time = pd.Timestamp("2025-09-01 00:00:00")
time_delta = pd.Timedelta(minutes=5)  # 5 min intervals

# Create timestamps
timestamps = [start_time + i * time_delta for i in range(num_rows)]

# Generate synthetic GNSS errors (similar magnitude as your dataset)
np.random.seed(42)

x_error = np.cumsum(np.random.normal(0, 1, num_rows)) / 10  # smooth cumulative random walk
y_error = np.cumsum(np.random.normal(0, 1, num_rows)) / 10
z_error = np.cumsum(np.random.normal(0, 1, num_rows)) / 10
satclockerror = np.cumsum(np.random.normal(0, 0.5, num_rows))  # smaller variations

# Combine into DataFrame
df = pd.DataFrame({
    "utc_time": timestamps,
    "x_error (m)": x_error,
    "y_error (m)": y_error,
    "z_error (m)": z_error,
    "satclockerror (m)": satclockerror
})

# Save to CSV
df.to_csv("synthetic_gnss_10k.csv", index=False)

print("CSV with 10,000 rows generated: synthetic_gnss_10k.csv")
