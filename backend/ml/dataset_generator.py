"""
Synthetic UPI Dataset Generator
Generates realistic UPI IDs for training ML phishing detection model
"""

import random
import string
from typing import List, Tuple

# Known legitimate UPI providers
TRUSTED_DOMAINS = [
    'paytm', 'phonepe', 'googlepay', 'gpay', 'amazonpay', 
    'ybl', 'okaxis', 'oksbi', 'okhdfcbank', 'okicici',
    'ibl', 'axl', 'fbl', 'airtel', 'jio'
]

# Typosquatting variations (brand impersonation)
TYPOSQUATTING_DOMAINS = [
    'paytmm', 'paytnn', 'paytam', 'paytym',
    'phonepee', 'phonepe1', 'phonepay', 'phonpe',
    'googlepey', 'googlepay1', 'googlepai', 'goooglepay',
    'gpey', 'gpai', 'gpaay',
    'amazonpey', 'amazanpay', 'amazonpay1'
]

# Phishing keywords
PHISHING_KEYWORDS = [
    'refund', 'support', 'verify', 'urgent', 'prize', 'winner',
    'claim', 'reward', 'bonus', 'cashback', 'offer', 'customer',
    'service', 'help', 'official', 'team', 'admin', 'security'
]

# Legitimate merchant names
LEGITIMATE_MERCHANTS = [
    'zomato', 'swiggy', 'uber', 'ola', 'flipkart', 'amazon',
    'myntra', 'bigbasket', 'dunzo', 'grofers', 'meesho',
    'bookmyshow', 'makemytrip', 'oyo', 'airbnb'
]

# Generic/suspicious merchant names
SUSPICIOUS_MERCHANTS = [
    'shop', 'store', 'merchant', 'seller', 'vendor', 'dealer',
    'trader', 'business', 'enterprise', 'company', 'services'
]


def generate_legitimate_upi(count: int) -> List[Tuple[str, int]]:
    """Generate legitimate UPI IDs with trusted domains"""
    upis = []
    
    for _ in range(count):
        # Choose between merchant name or random username
        if random.random() < 0.6:
            # Legitimate merchant
            username = random.choice(LEGITIMATE_MERCHANTS)
            if random.random() < 0.3:
                username += str(random.randint(1, 999))
        else:
            # Personal account (name-based)
            username = ''.join(random.choices(string.ascii_lowercase, k=random.randint(5, 12)))
            if random.random() < 0.5:
                username += str(random.randint(1, 99))
        
        domain = random.choice(TRUSTED_DOMAINS)
        upi = f"{username}@{domain}"
        upis.append((upi, 0))  # Label: 0 = legitimate
    
    return upis


def generate_typosquatting_upi(count: int) -> List[Tuple[str, int]]:
    """Generate typosquatting UPI IDs (brand impersonation)"""
    upis = []
    
    for _ in range(count):
        # Mix of legitimate-looking usernames with typosquatted domains
        if random.random() < 0.5:
            username = random.choice(LEGITIMATE_MERCHANTS + SUSPICIOUS_MERCHANTS)
        else:
            username = ''.join(random.choices(string.ascii_lowercase, k=random.randint(5, 10)))
        
        if random.random() < 0.3:
            username += str(random.randint(1, 999))
        
        domain = random.choice(TYPOSQUATTING_DOMAINS)
        upi = f"{username}@{domain}"
        upis.append((upi, 1))  # Label: 1 = phishing
    
    return upis


def generate_phishing_keyword_upi(count: int) -> List[Tuple[str, int]]:
    """Generate UPI IDs with phishing keywords"""
    upis = []
    
    for _ in range(count):
        # Combine phishing keyword with brand or generic term
        keyword = random.choice(PHISHING_KEYWORDS)
        
        if random.random() < 0.5:
            # Brand + keyword (e.g., paytm-refund)
            brand = random.choice(['paytm', 'phonepe', 'gpay', 'amazon', 'flipkart'])
            username = f"{brand}{random.choice(['-', '_', ''])}{keyword}"
        else:
            # Keyword + number
            username = f"{keyword}{random.randint(1, 999)}"
        
        # Mix of legitimate and suspicious domains
        if random.random() < 0.4:
            domain = random.choice(TRUSTED_DOMAINS)
        else:
            domain = random.choice(TYPOSQUATTING_DOMAINS + ['unknown', 'temp', 'test', 'fake'])
        
        upi = f"{username}@{domain}"
        upis.append((upi, 1))  # Label: 1 = phishing
    
    return upis


def generate_random_id_upi(count: int) -> List[Tuple[str, int]]:
    """Generate high-entropy random UPI IDs (suspicious)"""
    upis = []
    
    for _ in range(count):
        # Random character sequences
        length = random.randint(8, 15)
        username = ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))
        
        # Mix of domains
        if random.random() < 0.3:
            domain = random.choice(TRUSTED_DOMAINS)
        else:
            domain = ''.join(random.choices(string.ascii_lowercase, k=random.randint(4, 8)))
        
        upi = f"{username}@{domain}"
        upis.append((upi, 1))  # Label: 1 = phishing
    
    return upis


def generate_numbers_only_upi(count: int) -> List[Tuple[str, int]]:
    """Generate UPI IDs starting with only numbers (suspicious pattern)"""
    upis = []
    
    for _ in range(count):
        # Numbers-only username
        username = ''.join(random.choices(string.digits, k=random.randint(5, 10)))
        
        # Mix of domains
        domain = random.choice(TRUSTED_DOMAINS + TYPOSQUATTING_DOMAINS + ['unknown', 'temp'])
        
        upi = f"{username}@{domain}"
        upis.append((upi, 1))  # Label: 1 = phishing
    
    return upis


def generate_dataset(total_samples: int = 10000) -> List[Tuple[str, int]]:
    """
    Generate balanced synthetic UPI dataset
    
    Returns:
        List of (upi_id, label) tuples where label is 0 (legitimate) or 1 (phishing)
    """
    # Distribution of samples
    legitimate_count = int(total_samples * 0.5)  # 50% legitimate
    typosquatting_count = int(total_samples * 0.15)  # 15% typosquatting
    phishing_keyword_count = int(total_samples * 0.15)  # 15% phishing keywords
    random_id_count = int(total_samples * 0.1)  # 10% random IDs
    numbers_only_count = int(total_samples * 0.1)  # 10% numbers-only
    
    dataset = []
    dataset.extend(generate_legitimate_upi(legitimate_count))
    dataset.extend(generate_typosquatting_upi(typosquatting_count))
    dataset.extend(generate_phishing_keyword_upi(phishing_keyword_count))
    dataset.extend(generate_random_id_upi(random_id_count))
    dataset.extend(generate_numbers_only_upi(numbers_only_count))
    
    # Shuffle dataset
    random.shuffle(dataset)
    
    return dataset


def save_dataset(dataset: List[Tuple[str, int]], filepath: str = 'upi_dataset.csv'):
    """Save dataset to CSV file"""
    import csv
    
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['upi_id', 'label'])  # Header
        writer.writerows(dataset)
    
    print(f"✅ Dataset saved to {filepath}")
    print(f"   Total samples: {len(dataset)}")
    print(f"   Legitimate: {sum(1 for _, label in dataset if label == 0)}")
    print(f"   Phishing: {sum(1 for _, label in dataset if label == 1)}")


if __name__ == "__main__":
    # Generate dataset
    print("🔄 Generating synthetic UPI dataset...")
    dataset = generate_dataset(total_samples=10000)
    
    # Save to file
    save_dataset(dataset, filepath='ml/data/upi_dataset.csv')
    
    # Show examples
    print("\n📋 Sample UPI IDs:")
    print("\nLegitimate:")
    for upi, label in dataset[:5]:
        if label == 0:
            print(f"  ✅ {upi}")
    
    print("\nPhishing:")
    phishing_samples = [upi for upi, label in dataset if label == 1][:5]
    for upi in phishing_samples:
        print(f"  🚨 {upi}")
