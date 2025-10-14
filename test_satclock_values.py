#!/usr/bin/env python3
"""
Test script to verify satclockerror values are in the expected range
"""

import os
import sys
from pathlib import Path

import numpy as np
import pandas as pd

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from predict import predict_from_csv  # type: ignore

def test_satclock_values():
    """Test if satclockerror values are in the expected range (-4 to +4)"""
    
    # Create sample test data
    test_data = {
        'UTC_Time': pd.date_range('2024-01-01', periods=50, freq='15T'),
        'x_error': np.random.normal(0, 2, 50),
        'y_error': np.random.normal(0, 2, 50), 
        'z_error': np.random.normal(0, 2, 50),
        'satclockerror': np.random.normal(0, 2, 50)  # Input in realistic range
    }
    
    df = pd.DataFrame(test_data)
    
    # Save to CSV for testing
    test_file = 'test_data.csv'
    df.to_csv(test_file, index=False)
    
    print("Testing satclockerror value ranges...")
    print(f"Input satclockerror range: {df['satclockerror'].min():.6f} to {df['satclockerror'].max():.6f}")
    
    try:
        result = predict_from_csv(Path(test_file))

        if 'error' in result:
            print(f"Error in prediction: {result['error']}")
            return

        day8_predictions = result.get('prediction', [])
        if not day8_predictions:
            print("No predictions returned")
            return

        day8_satclock = [pred['satclockerror'] for pred in day8_predictions]

        print(f"\nDay 8 Prediction satclockerror values:")
        for i, val in enumerate(day8_satclock[:10]):
            print(f"  {i+1}: {val:.9f}")

        print(f"\nDay 8 satclockerror range: {min(day8_satclock):.9f} to {max(day8_satclock):.9f}")

        in_range = all(-4.0 <= val <= 4.0 for val in day8_satclock)
        print(f"All values in range [-4, 4]: {in_range}")

        if in_range:
            print("✅ SUCCESS: satclockerror values are in the expected range!")
        else:
            print("❌ ISSUE: Some satclockerror values are outside the expected range")

    except Exception as e:
        print(f"Test failed with error: {e}")
    finally:
        if os.path.exists(test_file):
            os.remove(test_file)

if __name__ == "__main__":
    test_satclock_values()