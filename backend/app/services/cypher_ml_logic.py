def analyze_transaction(features: dict) -> dict:
    """
    Cypher – Enhanced Explainable UPI Threat Detection Logic
    NOW WITH ML-POWERED PHISHING DETECTION!
    
    MANDATORY CONTRACT (Backward Compatible):
    Input (REQUIRED):
    {
        "amount_risk": float,      # 0–1
        "payee_risk": float,       # 0–1
        "frequency_risk": float,   # 0–1
        "timing_risk": float,      # 0–1
        "device_risk": float       # 0–1
    }
    
    Input (OPTIONAL - Enhanced Context):
    {
        "amount_value": float,     # Actual amount in ₹
        "hour_of_day": int,        # 0-23
        "payee_id": str            # UPI ID (e.g., "merchant@paytm")
    }
    
    Output:
    {
        "risk_score": int,         # 0–100 (MANDATORY INTEGER)
        "risk_label": "safe" | "warning" | "danger",
        "reasons": [string]        # Always at least one reason
    }
    """
    
    # --- ML Model Integration ---
    try:
        import sys
        import os
        # Add parent directory to path to import ml module
        sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        from ml.predictor import predict_phishing_probability
        ml_available = True
    except Exception as e:
        print(f"⚠️  ML model not available: {e}")
        ml_available = False
    
    # --- Extract Required Features (with safe defaults) ---
    amount_risk = features.get("amount_risk", 0.0)
    payee_risk = features.get("payee_risk", 0.0)
    frequency_risk = features.get("frequency_risk", 0.0)
    timing_risk = features.get("timing_risk", 0.0)
    device_risk = features.get("device_risk", 0.0)
    
    # --- Extract Optional Enhanced Features (safe defaults) ---
    amount_value = features.get("amount_value", None)
    hour_of_day = features.get("hour_of_day", None)
    payee_id = features.get("payee_id", None)
    
    # --- ML-Enhanced Payee Risk ---
    if ml_available and payee_id:
        try:
            ml_phishing_prob = predict_phishing_probability(payee_id)
            # Blend rule-based (40%) with ML (60%)
            original_payee_risk = payee_risk
            payee_risk = (payee_risk * 0.4) + (ml_phishing_prob * 0.6)
            
            print(f"🤖 ML Enhancement: {payee_id}")
            print(f"   Rule-based risk: {original_payee_risk:.2f}")
            print(f"   ML phishing prob: {ml_phishing_prob:.2f}")
            print(f"   Final payee_risk: {payee_risk:.2f}")
        except Exception as e:
            print(f"⚠️  ML prediction failed: {e}")
    
    
    # --- Base Weights (UPI-specific reasoning) ---
    WEIGHTS = {
        "amount_risk": 0.30,       # Large transfers are strong fraud signals
        "payee_risk": 0.25,        # Unknown / flagged receiver
        "frequency_risk": 0.20,    # Rapid transaction velocity
        "timing_risk": 0.15,       # Odd hours (night scams)
        "device_risk": 0.10        # New / untrusted device
    }
    
    reasons = []
    
    # --- Calculate Base Weighted Risk Score ---
    base_risk = (
        amount_risk * WEIGHTS["amount_risk"] +
        payee_risk * WEIGHTS["payee_risk"] +
        frequency_risk * WEIGHTS["frequency_risk"] +
        timing_risk * WEIGHTS["timing_risk"] +
        device_risk * WEIGHTS["device_risk"]
    )
    
    # --- Risk Amplification (Dangerous Combinations) ---
    amplification_factor = 1.0
    
    # Late night + high amount = scam pattern
    if timing_risk > 0.6 and amount_risk > 0.5:
        amplification_factor *= 1.3
        reasons.append("High-risk pattern: Large transaction during unusual hours")
    
    # Unknown payee + high amount = potential fraud
    if payee_risk > 0.6 and amount_risk > 0.5:
        amplification_factor *= 1.25
        reasons.append("High-risk pattern: Large payment to unverified recipient")
    
    # Rapid frequency = velocity attack
    if frequency_risk > 0.7:
        amplification_factor *= 1.15
        reasons.append("Suspicious velocity: Multiple rapid transactions detected")
    
    # Apply amplification
    risk_score = base_risk * amplification_factor
    
    # Clamp to valid range
    risk_score = max(0.0, min(1.0, risk_score))
    
    # --- Enhanced Explainability with Context ---
    
    # Amount-specific reasons
    if amount_risk > 0.6:
        if amount_value is not None:
            # Round number detection (scammers often use round amounts)
            if amount_value >= 5000 and amount_value % 1000 == 0:
                reasons.append(f"₹{amount_value:,.0f} is a round amount (common in scams)")
            elif amount_value > 10000:
                reasons.append(f"High-value transaction: ₹{amount_value:,.0f}")
            else:
                reasons.append(f"Transaction amount: ₹{amount_value:,.0f} flagged as unusual")
        else:
            reasons.append("Unusually high transaction amount")
    
    # Payee-specific reasons
    if payee_risk > 0.5:
        if payee_id is not None and "@" in payee_id:
            domain = payee_id.split("@")[1]
            # Check for known trusted providers
            trusted_providers = ["paytm", "phonepe", "googlepay", "gpay", "amazonpay", "bhim"]
            if not any(provider in domain.lower() for provider in trusted_providers):
                reasons.append(f"Unverified payment provider: @{domain}")
            else:
                reasons.append(f"First-time transaction to {payee_id}")
        else:
            reasons.append("Payee has suspicious or unverified history")
    
    # Timing-specific reasons
    if timing_risk > 0.6:
        if hour_of_day is not None:
            if hour_of_day >= 23 or hour_of_day < 6:
                reasons.append(f"Transaction at {hour_of_day:02d}:00 (high-risk hours: 11 PM - 6 AM)")
            else:
                reasons.append(f"Transaction at unusual time: {hour_of_day:02d}:00")
        else:
            reasons.append("Transaction initiated at unusual hours")
    
    # Frequency-specific reasons
    if frequency_risk > 0.5:
        reasons.append("Rapid transaction frequency detected")
    
    # Device-specific reasons
    if device_risk > 0.5:
        reasons.append("Transaction from a new or untrusted device")
    
    # --- Risk Label Mapping (Conservative Thresholds) ---
    if risk_score >= 0.60:
        risk_label = "danger"
    elif risk_score >= 0.30:
        risk_label = "warning"
    else:
        risk_label = "safe"
    
    # --- Ensure at least one reason (MANDATORY) ---
    if not reasons:
        if risk_score < 0.30:
            reasons.append("Transaction pattern appears normal")
        else:
            reasons.append("Multiple minor risk factors detected")
    
    # --- Convert to 0-100 Integer (MANDATORY) ---
    risk_score_int = int(round(risk_score * 100))
    
    return {
        "risk_score": risk_score_int,  # 0-100 integer
        "risk_label": risk_label,
        "reasons": reasons
    }
