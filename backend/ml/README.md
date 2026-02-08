# ML-Powered UPI Threat Detection System

## Overview
This system uses a **Random Forest classifier** trained on 10,000 synthetic UPI IDs to detect phishing and fraudulent payment requests. The ML model enhances the existing rule-based risk scoring with learned patterns.

## Architecture

```
Frontend (Next.js)
    ↓
Backend API (FastAPI)
    ↓
┌─────────────────────────────────────┐
│  Risk Analysis Engine               │
│  ┌──────────────┐  ┌──────────────┐│
│  │ Rule-Based   │  │  ML Model    ││
│  │ Heuristics   │  │  (Random     ││
│  │ (40% weight) │  │   Forest)    ││
│  │              │  │  (60% weight)││
│  └──────────────┘  └──────────────┘│
│         └────────┬────────┘         │
│              Blended Risk Score     │
└─────────────────────────────────────┘
```

## ML Model Details

### Training Data
- **Total Samples**: 10,000 UPI IDs
- **Legitimate**: 5,000 (50%)
- **Phishing**: 5,000 (50%)
  - Typosquatting: 1,500 (15%)
  - Phishing keywords: 1,500 (15%)
  - Random IDs: 1,000 (10%)
  - Numbers-only: 1,000 (10%)

### Features (11 total)
1. `username_length` - Length of username part
2. `domain_length` - Length of domain part
3. `total_length` - Total UPI ID length
4. `digit_ratio` - Proportion of digits in username
5. `special_char_ratio` - Proportion of special characters
6. `entropy` - Shannon entropy (randomness measure)
7. `has_trusted_domain` - Binary flag for trusted domains
8. `has_phishing_keyword` - Binary flag for suspicious keywords
9. `starts_with_digits` - Binary flag for number-only start
10. `min_brand_distance` - Levenshtein distance to known brands
11. `domain_reputation` - Domain trust score (0-1)

### Model Performance
- **Algorithm**: Random Forest (100 trees, max depth 10)
- **Accuracy**: ~95%+ on test set
- **Training Time**: ~2 seconds
- **Inference Time**: <10ms per prediction

## Usage

### 1. Generate Dataset
```bash
cd backend
python ml/dataset_generator.py
```

### 2. Train Model
```bash
python ml/train_model.py
```

### 3. Test Predictor
```bash
python ml/predictor.py
```

### 4. API Endpoints

#### Predict Phishing Probability
```http
POST /api/ml/predict_payee_risk
Content-Type: application/json

{
  "upi_id": "refund@paytmm"
}
```

**Response:**
```json
{
  "upi_id": "refund@paytmm",
  "is_phishing": true,
  "phishing_probability": 0.95,
  "confidence": "high",
  "ml_available": true
}
```

#### Health Check
```http
GET /api/ml/health
```

**Response:**
```json
{
  "ml_available": true,
  "model_path": "ml/models/upi_classifier.pkl"
}
```

## Integration with Risk Scoring

The ML model is automatically integrated into the main `/analyze` endpoint:

1. **Frontend** sends UPI data with `payee_id`
2. **Rule-based system** calculates initial `payee_risk` (0-1)
3. **ML model** predicts `phishing_probability` (0-1)
4. **Blending**: `final_payee_risk = (rule_risk × 0.4) + (ml_prob × 0.6)`
5. **Final risk score** uses blended payee_risk in weighted calculation

## Example Predictions

| UPI ID | Rule-Based Risk | ML Probability | Final Risk | Label |
|--------|----------------|----------------|------------|-------|
| `merchant@paytm` | 0.0 | 0.02 | 0.01 | ✅ Safe |
| `zomato@phonepe` | 0.0 | 0.05 | 0.03 | ✅ Safe |
| `refund@paytmm` | 0.5 | 0.95 | 0.77 | 🚨 Phishing |
| `98765@unknown` | 0.7 | 0.88 | 0.81 | 🚨 Phishing |
| `urgent-prize@fake` | 0.6 | 0.99 | 0.83 | 🚨 Phishing |

## Files Structure

```
backend/
├── ml/
│   ├── __init__.py
│   ├── dataset_generator.py    # Synthetic data generation
│   ├── feature_extractor.py    # Feature engineering
│   ├── train_model.py          # Training pipeline
│   ├── predictor.py            # Inference wrapper
│   ├── data/
│   │   └── upi_dataset.csv     # Generated dataset
│   └── models/
│       └── upi_classifier.pkl  # Trained model
├── app/
│   ├── routers/
│   │   └── ml.py               # ML API endpoints
│   └── services/
│       └── cypher_ml_logic.py  # Enhanced with ML
└── main.py                     # FastAPI app (ML router registered)
```

## Retraining the Model

To retrain with new data:

1. Update `dataset_generator.py` with new patterns
2. Run `python ml/dataset_generator.py`
3. Run `python ml/train_model.py`
4. Restart backend server

The new model will be automatically loaded on next prediction.

## Future Enhancements

1. **Active Learning**: Collect real-world UPI IDs and user feedback
2. **Deep Learning**: LSTM/Transformer for character-level patterns
3. **Ensemble Models**: Combine multiple classifiers
4. **Real-time Updates**: Periodic retraining with new fraud patterns
5. **Explainability**: SHAP values for feature importance per prediction
