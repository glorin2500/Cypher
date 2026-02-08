"""
Feature Extraction for UPI ID Classification
Converts UPI IDs into numerical features for ML model
"""

import re
import math
from typing import Dict, List
from collections import Counter


# Known trusted domains for reputation scoring
TRUSTED_DOMAINS = {
    'paytm', 'phonepe', 'googlepay', 'gpay', 'amazonpay',
    'ybl', 'okaxis', 'oksbi', 'okhdfcbank', 'okicici',
    'ibl', 'axl', 'fbl', 'airtel', 'jio', 'bhim'
}

# Phishing keywords
PHISHING_KEYWORDS = {
    'refund', 'support', 'verify', 'urgent', 'prize', 'winner',
    'claim', 'reward', 'bonus', 'cashback', 'offer', 'customer',
    'service', 'help', 'official', 'team', 'admin', 'security'
}

# Known legitimate brands
LEGITIMATE_BRANDS = {
    'zomato', 'swiggy', 'uber', 'ola', 'flipkart', 'amazon',
    'myntra', 'bigbasket', 'dunzo', 'grofers', 'meesho',
    'bookmyshow', 'makemytrip', 'oyo', 'airbnb', 'paytm',
    'phonepe', 'googlepay', 'gpay'
}


def calculate_entropy(text: str) -> float:
    """Calculate Shannon entropy of text (randomness measure)"""
    if not text:
        return 0.0
    
    counter = Counter(text)
    length = len(text)
    entropy = -sum((count / length) * math.log2(count / length) for count in counter.values())
    return entropy


def levenshtein_distance(s1: str, s2: str) -> int:
    """Calculate Levenshtein distance between two strings"""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    
    if len(s2) == 0:
        return len(s1)
    
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    
    return previous_row[-1]


def min_brand_distance(username: str) -> int:
    """Calculate minimum Levenshtein distance to known brands"""
    if not LEGITIMATE_BRANDS:
        return 999
    return min(levenshtein_distance(username.lower(), brand) for brand in LEGITIMATE_BRANDS)


def extract_features(upi_id: str) -> Dict[str, float]:
    """
    Extract numerical features from UPI ID
    
    Returns:
        Dictionary of feature_name: value pairs
    """
    if '@' not in upi_id:
        # Invalid UPI format - return high-risk features
        return {
            'username_length': 0,
            'domain_length': 0,
            'total_length': len(upi_id),
            'digit_ratio': 0,
            'special_char_ratio': 0,
            'entropy': 0,
            'has_trusted_domain': 0,
            'has_phishing_keyword': 0,
            'starts_with_digits': 0,
            'min_brand_distance': 999,
            'domain_reputation': 0
        }
    
    # Split UPI ID
    username, domain = upi_id.split('@', 1)
    username_lower = username.lower()
    domain_lower = domain.lower()
    
    # Basic length features
    username_length = len(username)
    domain_length = len(domain)
    total_length = len(upi_id)
    
    # Character composition
    digit_count = sum(c.isdigit() for c in username)
    digit_ratio = digit_count / username_length if username_length > 0 else 0
    
    special_char_count = sum(not c.isalnum() for c in username)
    special_char_ratio = special_char_count / username_length if username_length > 0 else 0
    
    # Entropy (randomness)
    entropy = calculate_entropy(username)
    
    # Domain reputation
    has_trusted_domain = 1 if any(trusted in domain_lower for trusted in TRUSTED_DOMAINS) else 0
    
    # Phishing keyword detection
    has_phishing_keyword = 1 if any(keyword in username_lower for keyword in PHISHING_KEYWORDS) else 0
    
    # Suspicious patterns
    starts_with_digits = 1 if username and username[0].isdigit() else 0
    
    # Brand similarity (typosquatting detection)
    brand_distance = min_brand_distance(username_lower)
    
    # Domain reputation score (0-1)
    if has_trusted_domain:
        domain_reputation = 1.0
    elif domain_length < 3 or domain_lower in ['unknown', 'temp', 'test', 'fake']:
        domain_reputation = 0.0
    else:
        domain_reputation = 0.5
    
    return {
        'username_length': username_length,
        'domain_length': domain_length,
        'total_length': total_length,
        'digit_ratio': digit_ratio,
        'special_char_ratio': special_char_ratio,
        'entropy': entropy,
        'has_trusted_domain': has_trusted_domain,
        'has_phishing_keyword': has_phishing_keyword,
        'starts_with_digits': starts_with_digits,
        'min_brand_distance': brand_distance,
        'domain_reputation': domain_reputation
    }


def extract_features_batch(upi_ids: List[str]) -> List[Dict[str, float]]:
    """Extract features for multiple UPI IDs"""
    return [extract_features(upi_id) for upi_id in upi_ids]


if __name__ == "__main__":
    # Test feature extraction
    test_upis = [
        "merchant@paytm",           # Legitimate
        "refund@paytmm",            # Phishing (typosquatting + keyword)
        "98765@unknown",            # Suspicious (numbers + bad domain)
        "zomato123@phonepe",        # Legitimate
        "urgent-prize@fake"         # Phishing (keywords + bad domain)
    ]
    
    print("🔍 Feature Extraction Examples:\n")
    for upi in test_upis:
        features = extract_features(upi)
        print(f"UPI: {upi}")
        print(f"  Features: {features}")
        print()
