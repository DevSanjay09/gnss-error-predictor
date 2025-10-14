# Hybrid Model Implementation for GNSS Error Prediction

## Overview
This implementation introduces a **hybrid model approach** that dynamically switches between LSTM and Transformer models based on real-time time gap detection during prediction. This ensures optimal model selection for different temporal patterns in GNSS data.

## Key Features

### 🔄 Dynamic Model Switching
- **LSTM Model**: Triggered for short time intervals (≤ 30 minutes)
- **Transformer Model**: Triggered for long time intervals (≥ 1 hour)
- **Real-time Decision**: Model selection happens for each prediction step

### ⏱️ Time Gap Detection
- **Short Horizon Threshold**: 1800 seconds (30 minutes)
- **Long Horizon Threshold**: 3600 seconds (1 hour)
- **Adaptive Analysis**: Considers both historical patterns and current prediction gaps

## Implementation Details

### Modified Files

#### 1. `backend/predict.py`
**New Functions:**
- `detect_gap_type(time_delta_seconds)`: Classifies time gaps as "short" or "long"
- `get_adaptive_model_choice(df, current_time, last_predicted_time)`: Dynamically selects the appropriate model

**Key Changes:**
- Hybrid prediction loop that switches models based on time gaps
- Enhanced prediction output with model usage statistics
- Real-time gap analysis during prediction sequence

#### 2. `backend/utils/timeutils.py`
**New Functions:**
- `analyze_time_patterns(df)`: Comprehensive time pattern analysis
- `detect_data_continuity(df)`: Determines data continuity patterns for model recommendation

**Enhanced Features:**
- Advanced gap statistics calculation
- Continuity pattern detection
- Model recommendation based on historical data

#### 3. `frontend/src/components/UploadForm.js`
**New Features:**
- Hybrid model summary display
- Model usage statistics visualization
- Enhanced table styling for model indicators
- Time gap information display

### Prediction Logic Flow

```
1. Load and preprocess data
2. Analyze historical time patterns
3. For each prediction step:
   a. Calculate time gap from previous prediction
   b. Classify gap as "short" or "long"
   c. Select appropriate model (LSTM/Transformer)
   d. Make prediction using selected model
   e. Update sequence for next prediction
4. Generate comprehensive summary
```

### Model Selection Criteria

| Time Gap | Model Used | Reasoning |
|----------|------------|-----------|
| ≤ 30 minutes | LSTM | Excellent for continuous, short-term patterns |
| 30-60 minutes | LSTM | Default for medium gaps |
| ≥ 1 hour | Transformer | Better for handling large temporal gaps |

### Output Enhancement

The prediction response now includes:

```json
{
  "prediction": [
    {
      "x_error": 0.123,
      "y_error": 0.456,
      "z_error": 0.789,
      "satclockerror": 0.321,
      "model_used": "LSTM",
      "prediction_step": 1,
      "predicted_time": "2024-01-01 12:15:00",
      "time_gap_seconds": 900,
      "gap_type": "short"
    }
  ],
  "table_data": [...],
  "prediction_summary": {
    "total_predictions": 96,
    "lstm_usage": 85,
    "transformer_usage": 11,
    "lstm_percentage": 88.54,
    "transformer_percentage": 11.46,
    "hybrid_approach": "Adaptive model switching based on time gaps"
  }
}
```

## Testing

A comprehensive test suite (`test_hybrid_model.py`) validates:
- ✅ Gap detection accuracy
- ✅ Data analysis functionality
- ✅ Model selection logic
- ✅ Edge case handling

## Benefits

### 🎯 Improved Accuracy
- **Short-term predictions**: LSTM excels at capturing recent trends
- **Long-term predictions**: Transformer handles temporal discontinuities better

### 🔍 Intelligent Adaptation
- Real-time gap analysis ensures optimal model selection
- Historical pattern analysis for initial model recommendation

### 📊 Enhanced Visibility
- Detailed model usage statistics
- Visual indicators for model switching
- Time gap analysis in predictions

## Configuration

### Thresholds (in `predict.py`):
```python
SHORT_HORIZON_THRESHOLD = 1800  # 30 minutes
LONG_HORIZON_THRESHOLD = 3600   # 1 hour
```

### Customization Options:
- Adjust thresholds based on data characteristics
- Modify model selection logic in `get_adaptive_model_choice()`
- Add additional gap classification levels

## Usage Examples

### Scenario 1: Continuous 15-minute intervals
```
Input: Regular 15-minute GPS measurements
Result: LSTM used for all 96 predictions (100% LSTM usage)
```

### Scenario 2: Data with 2-hour gap
```
Input: 15-min intervals + 2-hour gap + 15-min intervals
Result: LSTM for normal intervals, Transformer after large gaps
Model Usage: ~85% LSTM, ~15% Transformer
```

### Scenario 3: Irregular data with multiple gaps
```
Input: Mixed intervals with several 1+ hour gaps
Result: Dynamic switching based on each gap
Model Usage: Balanced LSTM/Transformer usage
```

## Performance Monitoring

The system provides real-time insights:
- Model usage percentages
- Time gap distribution
- Prediction confidence indicators
- Historical pattern analysis results

## Future Enhancements

1. **Machine Learning Gap Threshold**: Learn optimal thresholds from data
2. **Model Confidence Weighting**: Use prediction confidence for model selection
3. **Ensemble Predictions**: Combine both models for critical predictions
4. **Adaptive Thresholds**: Dynamic threshold adjustment based on data patterns

---

**Note**: This hybrid approach ensures that the prediction system automatically adapts to different temporal characteristics in GNSS data, providing more accurate and contextually appropriate predictions.