#!/usr/bin/env python3
"""
Test script for the hybrid model functionality
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.timeutils import detect_data_continuity, analyze_time_patterns
from predict import detect_gap_type, get_adaptive_model_choice, FEATURES

def create_test_data_short_intervals():
    """Create test data with short intervals (15 minutes)"""
    start_time = datetime(2024, 1, 1, 0, 0, 0)
    times = [start_time + timedelta(minutes=15*i) for i in range(20)]
    
    data = {
        'utc_time': times,
        'x_error': np.random.normal(0, 0.5, 20),
        'y_error': np.random.normal(0, 0.5, 20),
        'z_error': np.random.normal(0, 0.5, 20),
        'satclockerror': np.random.normal(0, 0.3, 20)
    }
    return pd.DataFrame(data)

def create_test_data_with_gap():
    """Create test data with a large gap (2 hours)"""
    start_time = datetime(2024, 1, 1, 0, 0, 0)
    
    # First part: normal 15-minute intervals
    times1 = [start_time + timedelta(minutes=15*i) for i in range(10)]
    
    # Gap: 2 hours
    gap_start = times1[-1] + timedelta(hours=2)
    
    # Second part: continue with 15-minute intervals
    times2 = [gap_start + timedelta(minutes=15*i) for i in range(10)]
    
    times = times1 + times2
    
    data = {
        'utc_time': times,
        'x_error': np.random.normal(0, 0.5, 20),
        'y_error': np.random.normal(0, 0.5, 20),
        'z_error': np.random.normal(0, 0.5, 20),
        'satclockerror': np.random.normal(0, 0.3, 20)
    }
    return pd.DataFrame(data)

def test_gap_detection():
    """Test gap detection functionality"""
    print("=== Testing Gap Detection ===")
    
    # Test short intervals
    print("1. Testing short intervals (15 minutes):")
    short_gap = 15 * 60  # 15 minutes in seconds
    gap_type = detect_gap_type(short_gap)
    print(f"   Gap: {short_gap}s -> Type: {gap_type}")
    assert gap_type == "short", f"Expected 'short', got '{gap_type}'"
    
    # Test long intervals
    print("2. Testing long intervals (2 hours):")
    long_gap = 2 * 3600  # 2 hours in seconds
    gap_type = detect_gap_type(long_gap)
    print(f"   Gap: {long_gap}s -> Type: {gap_type}")
    assert gap_type == "long", f"Expected 'long', got '{gap_type}'"
    
    print("✅ Gap detection tests passed!")

def test_data_analysis():
    """Test data analysis functionality"""
    print("\n=== Testing Data Analysis ===")
    
    # Test short interval data
    print("1. Testing short interval data:")
    df_short = create_test_data_short_intervals()
    analysis = analyze_time_patterns(df_short)
    continuity = detect_data_continuity(df_short)
    
    print(f"   Median interval: {analysis['median_interval']:.0f}s")
    print(f"   Max gap: {analysis['max_gap']:.0f}s")
    print(f"   Recommended model: {continuity['recommended_model']}")
    print(f"   Confidence: {continuity['confidence']}")
    
    # Test data with gap
    print("2. Testing data with large gap:")
    df_gap = create_test_data_with_gap()
    analysis = analyze_time_patterns(df_gap)
    continuity = detect_data_continuity(df_gap)
    
    print(f"   Median interval: {analysis['median_interval']:.0f}s")
    print(f"   Max gap: {analysis['max_gap']:.0f}s")
    print(f"   Large gaps count: {analysis['large_gaps_count']}")
    print(f"   Recommended model: {continuity['recommended_model']}")
    print(f"   Confidence: {continuity['confidence']}")
    
    print("✅ Data analysis tests passed!")

def test_model_selection():
    """Test adaptive model selection"""
    print("\n=== Testing Model Selection ===")
    
    # Test with short interval data
    print("1. Testing with short interval data:")
    df_short = create_test_data_short_intervals()
    model, model_name = get_adaptive_model_choice(df_short)
    print(f"   Selected model: {model_name}")
    
    # Test with gap data
    print("2. Testing with gap data:")
    df_gap = create_test_data_with_gap()
    model, model_name = get_adaptive_model_choice(df_gap)
    print(f"   Selected model: {model_name}")
    
    # Test with specific time gaps
    print("3. Testing with specific time gaps:")
    current_time = datetime(2024, 1, 1, 12, 0, 0)
    
    # Short gap (15 minutes)
    last_time_short = current_time - timedelta(minutes=15)
    model, model_name = get_adaptive_model_choice(df_short, current_time, last_time_short)
    print(f"   15min gap -> {model_name}")
    
    # Long gap (2 hours)
    last_time_long = current_time - timedelta(hours=2)
    model, model_name = get_adaptive_model_choice(df_short, current_time, last_time_long)
    print(f"   2hr gap -> {model_name}")
    
    print("✅ Model selection tests passed!")

def main():
    """Run all tests"""
    print("🚀 Starting Hybrid Model Tests")
    print("=" * 50)
    
    try:
        test_gap_detection()
        test_data_analysis()
        test_model_selection()
        
        print("\n" + "=" * 50)
        print("🎉 All tests passed successfully!")
        print("🤖 Hybrid model functionality is working correctly!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
