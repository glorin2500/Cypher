/**
 * Offline ML Inference for Cypher
 * Replicates backend feature extraction and runs ONNX model in-browser.
 */

import * as ort from 'onnxruntime-web';

// Replicate backend constants
const TRUSTED_DOMAINS = new Set([
    'paytm', 'phonepe', 'googlepay', 'gpay', 'amazonpay',
    'ybl', 'okaxis', 'oksbi', 'okhdfcbank', 'okicici',
    'ibl', 'axl', 'fbl', 'airtel', 'jio', 'bhim'
]);

const PHISHING_KEYWORDS = new Set([
    'refund', 'support', 'verify', 'urgent', 'prize', 'winner',
    'claim', 'reward', 'bonus', 'cashback', 'offer', 'customer',
    'service', 'help', 'official', 'team', 'admin', 'security'
]);

const LEGITIMATE_BRANDS = [
    'zomato', 'swiggy', 'uber', 'ola', 'flipkart', 'amazon',
    'myntra', 'bigbasket', 'dunzo', 'grofers', 'meesho',
    'bookmyshow', 'makemytrip', 'oyo', 'airbnb', 'paytm',
    'phonepe', 'googlepay', 'gpay'
];

/**
 * Calculate Shannon entropy of text
 */
function calculateEntropy(text: string): number {
    if (!text) return 0;
    const chars = text.split('');
    const counts: Record<string, number> = {};
    chars.forEach(c => counts[c] = (counts[c] || 0) + 1);
    const len = chars.length;
    return -Object.values(counts).reduce((sum, count) => {
        const p = count / len;
        return sum + p * Math.log2(p);
    }, 0);
}

/**
 * Levenshtein Distance
 */
function levenshteinDistance(s1: string, s2: string): number {
    const m = s1.length;
    const n = s2.length;
    const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) d[i][0] = i;
    for (let j = 0; j <= n; j++) d[0][j] = j;

    for (let j = 1; j <= n; j++) {
        for (let i = 1; i <= m; i++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            d[i][j] = Math.min(
                d[i - 1][j] + 1,      // deletion
                d[i][j - 1] + 1,      // insertion
                d[i - 1][j - 1] + cost // substitution
            );
        }
    }
    return d[m][n];
}

/**
 * Feature Extraction
 */
export function extractFeatures(upiId: string): number[] {
    if (!upiId.includes('@')) {
        return [0, 0, upiId.length, 0, 0, 0, 0, 0, 0, 999, 0];
    }

    const [username, domain] = upiId.split('@');
    const userLow = username.toLowerCase();
    const domainLow = domain.toLowerCase();

    const userLen = username.length;
    const domLen = domain.length;
    const totalLen = upiId.length;

    const digitCount = (username.match(/\d/g) || []).length;
    const digitRatio = userLen > 0 ? digitCount / userLen : 0;

    const specialCount = (username.match(/[^a-zA-Z0-9]/g) || []).length;
    const specialRatio = userLen > 0 ? specialCount / userLen : 0;

    const entropy = calculateEntropy(username);
    const hasTrustedDomain = Array.from(TRUSTED_DOMAINS).some(d => domainLow.includes(d)) ? 1 : 0;
    const hasPhishingKeyword = Array.from(PHISHING_KEYWORDS).some(k => userLow.includes(k)) ? 1 : 0;
    const startsWithDigits = /^\d/.test(username) ? 1 : 0;

    const minBrandDist = Math.min(...LEGITIMATE_BRANDS.map(b => levenshteinDistance(userLow, b)));

    let domainReputation = 0.5;
    if (hasTrustedDomain) domainReputation = 1.0;
    else if (domLen < 3 || ['unknown', 'temp', 'test', 'fake'].includes(domainLow)) domainReputation = 0;

    return [
        userLen, domLen, totalLen, digitRatio, specialRatio,
        entropy, hasTrustedDomain, hasPhishingKeyword,
        startsWithDigits, minBrandDist, domainReputation
    ];
}

let session: ort.InferenceSession | null = null;

/**
 * Run Inference locally
 */
export async function runOfflineScoring(upiId: string): Promise<{ score: number; reasons: string[] }> {
    try {
        if (!session) {
            // Use local path to serving model
            session = await ort.InferenceSession.create('/models/upi_classifier.onnx');
        }

        const features = extractFeatures(upiId);
        const tensor = new ort.Tensor('float32', new Float32Array(features), [1, 11]);

        const feeds = { [session.inputNames[0]]: tensor };
        const results = await session.run(feeds);

        // results contains 'label' and 'probabilities'
        // The probabilities output (usually index 1) is a sequence of maps or a tensor
        const probs = results[session.outputNames[1]].data as Float32Array;

        // Random Forest ONNX output: [prob_class_0, prob_class_1]
        const phishingProb = probs[1] * 100; // 0-100 range

        const reasons: string[] = ["Offline analysis"];
        if (phishingProb > 20) {
            if (features[7]) reasons.push("Suspicious keywords detected");
            if (features[9] < 3) reasons.push("Brand typosquatting detected");
            if (features[10] < 0.5) reasons.push("Untrusted domain");
        }

        return {
            score: Math.round(phishingProb),
            reasons
        };
    } catch (error) {
        console.error("Offline scoring failed", error);
        return { score: 0, reasons: ["Analysis unavailable"] };
    }
}
