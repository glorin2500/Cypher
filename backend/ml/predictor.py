"""
ML Predictor for UPI Phishing Detection
Loads trained model and provides prediction interface
"""

import os
import joblib
import numpy as np
from ml.feature_extractor import extract_features


class UPIPhishingPredictor:
    """Wrapper class for UPI phishing detection model"""
    
    def __init__(self, model_path: str = 'ml/models/upi_classifier.pkl'):
        """Initialize predictor with trained model"""
        self.model_path = model_path
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load trained model from disk"""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"Model file not found: {self.model_path}\n"
                "Please run 'python ml/train_model.py' to train the model first."
            )
        
        self.model = joblib.load(self.model_path)
        print(f"✅ ML model loaded from {self.model_path}")
    
    def prepare_features(self, upi_id: str) -> np.ndarray:
        """Convert UPI ID to feature vector"""
        features = extract_features(upi_id)
        
        # Convert dict to ordered array (must match training order)
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
        
        return np.array([feature_vector])
    
    def predict_phishing_probability(self, upi_id: str) -> float:
        """
        Predict phishing probability for a UPI ID
        
        Args:
            upi_id: UPI ID string (e.g., "merchant@paytm")
        
        Returns:
            Phishing probability (0.0 - 1.0)
        """
        if not self.model:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        # Extract features
        X = self.prepare_features(upi_id)
        
        # Predict probability
        probability = self.model.predict_proba(X)[0][1]  # Probability of class 1 (phishing)
        
        return float(probability)
    
    def predict(self, upi_id: str) -> dict:
        """
        Full prediction with label and probability
        
        Returns:
            {
                'upi_id': str,
                'is_phishing': bool,
                'phishing_probability': float,
                'confidence': str
            }
        """
        probability = self.predict_phishing_probability(upi_id)
        is_phishing = probability >= 0.5
        
        # Confidence levels
        if probability >= 0.8 or probability <= 0.2:
            confidence = "high"
        elif probability >= 0.6 or probability <= 0.4:
            confidence = "medium"
        else:
            confidence = "low"
        
        return {
            'upi_id': upi_id,
            'is_phishing': is_phishing,
            'phishing_probability': round(probability, 4),
            'confidence': confidence
        }


# Global predictor instance (singleton)
_predictor = None


def get_predictor() -> UPIPhishingPredictor:
    """Get or create global predictor instance"""
    global _predictor
    if _predictor is None:
        _predictor = UPIPhishingPredictor()
    return _predictor


def predict_phishing_probability(upi_id: str) -> float:
    """
    Convenience function for quick predictions
    
    Args:
        upi_id: UPI ID string
    
    Returns:
        Phishing probability (0.0 - 1.0)
    """
    predictor = get_predictor()
    return predictor.predict_phishing_probability(upi_id)


if __name__ == "__main__":
    # Test predictor
    print("🧪 Testing UPI Phishing Predictor\n")
    
    test_cases = [
        "merchant@paytm",
        "refund@paytmm",
        "98765@unknown",
        "zomato@phonepe",
        "urgent-prize@fake",
        "support-team@googlepay",
        "customer123@okaxis"
    ]
    
    try:
        predictor = UPIPhishingPredictor()
        
        for upi_id in test_cases:
            result = predictor.predict(upi_id)
            
            status = "🚨 PHISHING" if result['is_phishing'] else "✅ SAFE"
            prob = result['phishing_probability']
            conf = result['confidence'].upper()
            
            print(f"{status:15s} {upi_id:30s} (prob: {prob:.2%}, conf: {conf})")
    
    except FileNotFoundError as e:
        print(f"❌ Error: {e}")
        print("\n💡 Run this command first:")
        print("   python ml/train_model.py")
