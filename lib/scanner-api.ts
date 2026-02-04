/**
 * Scanner API - Backend communication with fallback
 * Handles /analyze endpoint calls with deterministic mock for unavailability
 */

export interface AnalysisFeatures {
    // Required 5-feature contract
    amount_risk: number;
    payee_risk: number;
    frequency_risk: number;
    timing_risk: number;
    device_risk: number;
    // Optional enhanced context fields
    amount_value?: number;
    hour_of_day?: number;
    payee_id?: string;
}

export interface AnalysisResult {
    risk_label: 'safe' | 'warning' | 'danger';
    risk_score: number;
    reasons: string[];
    timestamp?: string;
    details?: {
        merchant?: string;
        upi_id?: string;
        categories?: string[];
    };
    flags?: string[]; // For backward compatibility if needed
    is_safe?: boolean; // For convenience
}

export async function fetchScanHistory(): Promise<AnalysisResult[]> {
    try {
        const response = await fetch('http://localhost:8000/history');
        if (!response.ok) throw new Error('Failed to fetch history');
        return await response.json();
    } catch (error) {
        console.error('Failed to load history:', error);
        return [];
    }
}

/**
 * Call backend /analyze endpoint
 * Falls back to mock if backend unavailable
 */
/**
 * Helper to analyze raw QR text
 */
export async function analyzeQRString(text: string): Promise<AnalysisResult> {
    // 1. Parse UPI string
    const params = new URLSearchParams(text.replace('upi://pay?', ''));
    const upiData = {
        pa: params.get('pa') || '',
        am: params.get('am') || '',
        pn: params.get('pn') || ''
    };

    // 2. Extract features
    const features = extractFeaturesFromUPI(upiData);

    // 3. Analyze
    const result = await analyzeQRPayload(features);

    // 4. Enrich with details
    return {
        ...result,
        details: {
            merchant: upiData.pn || 'Unknown Merchant',
            upi_id: upiData.pa,
            categories: []
        },
        is_safe: result.risk_label === 'safe'
    };
}

/**
 * Call backend /analyze endpoint
 * Falls back to mock if backend unavailable
 */
export async function analyzeQRPayload(
    features: AnalysisFeatures,
    timeout: number = 10000
): Promise<AnalysisResult> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch('http://localhost:8000/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(features),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();
        return data as AnalysisResult;
    } catch (error: any) {
        console.warn('⚠️ Backend unavailable, using local analysis:', error.message);

        // Enhanced Fallback: Deterministic analysis based on features
        const riskScore = Math.round(
            (features.amount_risk * 30) +
            (features.payee_risk * 40) +
            (features.frequency_risk * 15) +
            (features.timing_risk * 10) +
            (features.device_risk * 5)
        );

        const reasons: string[] = [];

        if (features.payee_risk > 0.6) reasons.push('Unverified payment provider detected');
        if (features.amount_risk > 0.7) reasons.push('Unusual transaction amount');
        if (features.timing_risk > 0.5) reasons.push('Transaction at unusual hours');
        if (features.frequency_risk > 0.6) reasons.push('High transaction frequency');
        if (features.device_risk > 0.5) reasons.push('Device security concerns');

        if (reasons.length === 0) {
            reasons.push('Transaction pattern appears normal');
        }

        return {
            risk_label: riskScore >= 60 ? 'danger' : riskScore >= 30 ? 'warning' : 'safe',
            risk_score: riskScore,
            reasons,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Extract ML features from UPI parameters
 * Enhanced with realistic heuristics for payee and timing risk
 */
export function extractFeaturesFromUPI(upiData: {
    pa: string;
    am?: string;
    pn?: string;
}): AnalysisFeatures {
    // Parse amount
    const amount = parseFloat(upiData.am || '0');

    // Get current time context
    const now = new Date();
    const hour_of_day = now.getHours();

    // Amount Risk: Higher for large transactions
    const amount_risk = amount > 10000 ? 0.8 : amount > 5000 ? 0.5 : amount > 1000 ? 0.3 : 0.1;

    // Payee Risk: Check for suspicious patterns in UPI ID
    const payee_risk = calculatePayeeRisk(upiData.pa, upiData.pn);

    // Timing Risk: Higher risk for late-night transactions (11 PM - 6 AM)
    const timing_risk = calculateTimingRisk();

    // Frequency Risk: Placeholder - needs transaction history
    const frequency_risk = 0.1;

    // Device Risk: Placeholder - needs device fingerprinting
    const device_risk = 0.0;

    return {
        // Required 5-feature contract
        amount_risk,
        payee_risk,
        frequency_risk,
        timing_risk,
        device_risk,
        // Optional enhanced context (backward compatible)
        amount_value: amount > 0 ? amount : undefined,
        hour_of_day,
        payee_id: upiData.pa,
    };
}

/**
 * Calculate payee risk based on UPI ID patterns
 */
function calculatePayeeRisk(upiId: string, payeeName?: string): number {
    let risk = 0.0;

    // Check for suspicious patterns
    const suspiciousPatterns = [
        /^\d+@/,                    // Starts with only numbers (e.g., "12345@paytm")
        /@(unknown|temp|test)/i,    // Unknown/temporary domains
        /random|temp|fake/i,        // Suspicious keywords in ID
    ];

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(upiId)) {
            risk += 0.3;
        }
    }

    // Check for known trusted domains (lower risk)
    const trustedDomains = ['paytm', 'phonepe', 'googlepay', 'amazonpay', 'ybl', 'okaxis', 'oksbi', 'okhdfcbank', 'okicici'];
    const domain = upiId.split('@')[1]?.toLowerCase() || '';

    if (trustedDomains.some(trusted => domain.includes(trusted))) {
        risk = Math.max(0, risk - 0.2); // Reduce risk for trusted domains
    } else if (!domain || domain.length < 3) {
        risk += 0.2; // Increase risk for missing or very short domains
    }

    // Check if payee name is missing or suspicious
    if (!payeeName || payeeName === 'Unknown Merchant' || payeeName.length < 3) {
        risk += 0.1;
    }

    // Clamp to 0-1 range
    return Math.min(1.0, Math.max(0.0, risk));
}

/**
 * Calculate timing risk based on current hour
 * Higher risk for late-night transactions (11 PM - 6 AM)
 */
function calculateTimingRisk(): number {
    const currentHour = new Date().getHours();

    // High risk: 11 PM - 6 AM (23:00 - 06:00)
    if (currentHour >= 23 || currentHour < 6) {
        return 0.7;
    }

    // Medium risk: 6 AM - 8 AM or 9 PM - 11 PM
    if ((currentHour >= 6 && currentHour < 8) || (currentHour >= 21 && currentHour < 23)) {
        return 0.4;
    }

    // Low risk: Normal business hours (8 AM - 9 PM)
    return 0.1;
}
