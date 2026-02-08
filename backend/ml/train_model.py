"""
ML Model Training Pipeline for UPI Phishing Detection
Trains Random Forest classifier on synthetic dataset
"""

import os
import csv
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from feature_extractor import extract_features


def load_dataset(filepath: str = 'ml/data/upi_dataset.csv'):
    """Load UPI dataset from CSV"""
    upi_ids = []
    labels = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            upi_ids.append(row['upi_id'])
            labels.append(int(row['label']))
    
    return upi_ids, labels


def prepare_features(upi_ids):
    """Convert UPI IDs to feature vectors"""
    features_list = []
    
    for upi_id in upi_ids:
        features = extract_features(upi_id)
        # Convert dict to ordered list
        feature_vector = [
            features['username_length'],
            features['domain_length'],
            features['total_length'],
            features['digit_ratio'],
            features['special_char_ratio'],
            features['entropy'],
            features['has_trusted_domain'],
            features['has_phishing_keyword'],
            features['starts_with_digits'],
            features['min_brand_distance'],
            features['domain_reputation']
        ]
        features_list.append(feature_vector)
    
    return np.array(features_list)


def train_model(X_train, y_train):
    """Train Random Forest classifier"""
    print("🔄 Training Random Forest model...")
    
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    print("✅ Model trained successfully!")
    return model


def evaluate_model(model, X_test, y_test):
    """Evaluate model performance"""
    print("\n📊 Model Evaluation:")
    
    y_pred = model.predict(X_test)
    
    # Accuracy
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n  Accuracy: {accuracy:.2%}")
    
    # Classification report
    print("\n  Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Legitimate', 'Phishing']))
    
    # Confusion matrix
    print("\n  Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(f"    [[TN={cm[0][0]:4d}  FP={cm[0][1]:4d}]")
    print(f"     [FN={cm[1][0]:4d}  TP={cm[1][1]:4d}]]")
    
    # Feature importance
    print("\n  Top 5 Important Features:")
    feature_names = [
        'username_length', 'domain_length', 'total_length',
        'digit_ratio', 'special_char_ratio', 'entropy',
        'has_trusted_domain', 'has_phishing_keyword', 'starts_with_digits',
        'min_brand_distance', 'domain_reputation'
    ]
    
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1][:5]
    
    for i, idx in enumerate(indices, 1):
        print(f"    {i}. {feature_names[idx]}: {importances[idx]:.4f}")
    
    return accuracy


def save_model(model, filepath: str = 'ml/models/upi_classifier.pkl'):
    """Save trained model to disk"""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    joblib.dump(model, filepath)
    print(f"\n💾 Model saved to {filepath}")


def main():
    """Main training pipeline"""
    print("=" * 60)
    print("  UPI Phishing Detection - Model Training Pipeline")
    print("=" * 60)
    
    # 1. Load dataset
    print("\n📂 Loading dataset...")
    upi_ids, labels = load_dataset()
    print(f"   Total samples: {len(upi_ids)}")
    print(f"   Legitimate: {labels.count(0)}")
    print(f"   Phishing: {labels.count(1)}")
    
    # 2. Extract features
    print("\n🔍 Extracting features...")
    X = prepare_features(upi_ids)
    y = np.array(labels)
    print(f"   Feature matrix shape: {X.shape}")
    
    # 3. Split dataset
    print("\n✂️  Splitting dataset (80% train, 20% test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"   Train samples: {len(X_train)}")
    print(f"   Test samples: {len(X_test)}")
    
    # 4. Train model
    model = train_model(X_train, y_train)
    
    # 5. Evaluate model
    accuracy = evaluate_model(model, X_test, y_test)
    
    # 6. Save model
    save_model(model)
    
    print("\n" + "=" * 60)
    print(f"  ✅ Training Complete! Accuracy: {accuracy:.2%}")
    print("=" * 60)
    
    # 7. Test on real examples
    print("\n🧪 Testing on real-world examples:")
    test_cases = [
        ("merchant@paytm", "Legitimate"),
        ("refund@paytmm", "Phishing"),
        ("98765@unknown", "Phishing"),
        ("zomato@phonepe", "Legitimate"),
        ("urgent-prize@fake", "Phishing")
    ]
    
    for upi_id, expected in test_cases:
        features = prepare_features([upi_id])
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0][1]
        
        result = "✅" if (prediction == 1 and expected == "Phishing") or (prediction == 0 and expected == "Legitimate") else "❌"
        label = "Phishing" if prediction == 1 else "Legitimate"
        
        print(f"  {result} {upi_id:25s} → {label:12s} (prob: {probability:.2%})")


if __name__ == "__main__":
    main()
