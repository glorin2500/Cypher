"""
Model Conversion Script: Scikit-learn (.pkl) -> ONNX (.onnx)
For offline frontend inference using onnxruntime-web.
"""

import joblib
import numpy as np
from skl2onnx import to_onnx
import onnxruntime as rt
import os

# Paths
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
PKL_PATH = os.path.join(MODEL_DIR, "models", "upi_classifier.pkl")
ONNX_PATH = os.path.join(MODEL_DIR, "models", "upi_classifier.onnx")

def convert():
    print(f"Loading scikit-learn model from {PKL_PATH}...")
    if not os.path.exists(PKL_PATH):
        print(f"Error: Model file not found at {PKL_PATH}")
        return

    model = joblib.load(PKL_PATH)
    
    # Define input type (11 features as float32)
    # feature list: username_length, domain_length, total_length, digit_ratio, 
    # special_char_ratio, entropy, has_trusted_domain, has_phishing_keyword, 
    # starts_with_digits, min_brand_distance, domain_reputation
    initial_type = np.zeros((1, 11)).astype(np.float32)
    
    print("Converting to ONNX format...")
    onx = to_onnx(model, initial_type, target_opset=12)
    
    with open(ONNX_PATH, "wb") as f:
        f.write(onx.SerializeToString())
    
    print(f"Model successfully converted to {ONNX_PATH}")
    
    # Verification
    print("Verifying ONNX model output matches sklearn...")
    sess = rt.InferenceSession(ONNX_PATH, providers=["CPUExecutionProvider"])
    
    # Test with random inputs
    test_input = np.random.rand(1, 11).astype(np.float32)
    
    input_name = sess.get_inputs()[0].name
    
    onnx_pred = sess.run(None, {input_name: test_input})
    sklearn_pred = model.predict_proba(test_input)
    
    print(f"   Sklearn prob (class 1): {sklearn_pred[0][1]:.4f}")
    
    try:
        # Probability for class 1
        # For RF classifier, the second output is a list of dicts or a tensor
        # In most cases with to_onnx, it's a list of probabilities as second output
        onnx_prob = onnx_pred[1][0][1]
        print(f"   ONNX prob (class 1):    {onnx_prob:.4f}")
        
        diff = abs(sklearn_pred[0][1] - onnx_prob)
        if diff < 1e-5:
            print("Verification PASSED: Outputs match!")
        else:
            print(f"Warning: Outputs differ by {diff:.6f}")
    except Exception as e:
        print(f"Could not verify prob specifically: {e}. Output structure was: {type(onnx_pred)}")

if __name__ == "__main__":
    convert()
