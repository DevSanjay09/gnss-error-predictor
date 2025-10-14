import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Number of data points
num_rows = 10000

# Start time
start_time = datetime(2025, 9, 3, 10, 0)

# Generate time intervals (random between 5 to 60 minutes)
time_intervals = np.random.randint(5, 61, size=num_rows)

# Generate timestamps
timestamps = [start_time + timedelta(minutes=int(sum(time_intervals[:i+1]))) for i in range(num_rows)]
timestamps_str = [dt.strftime("%m/%d/%Y %H:%M") for dt in timestamps]

# Generate GNSS-like errors (x, y, z in meters, satclockerror in meters)
# Using normal distribution with mean 0 and std deviation similar to your data
x_error = np.random.normal(0, 0.3, num_rows)
y_error = np.random.normal(0, 0.3, num_rows)
z_error = np.random.normal(0, 0.4, num_rows)
satclockerror = np.random.normal(0, 0.05, num_rows)

# Create DataFrame
df = pd.DataFrame({
    "utc_time": timestamps_str,
    "x_error (m)": x_error,
    "y_error (m)": y_error,
    "z_error (m)": z_error,
    "satclockerror (m)": satclockerror
})

# Save to CSV
df.to_csv("gnss_generated_10k.csv", index=False)

print("10,000 GNSS-like error data rows generated successfully!")
