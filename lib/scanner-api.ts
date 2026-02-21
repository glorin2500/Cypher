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
        amount?: string;
        original_upi_string?: string;  // ✅ Full UPI string for payment
        categories?: string[];
    };
    flags?: string[]; // For backward compatibility if needed
    is_safe?: boolean; // For convenience
}

export async function fetchScanHistory(): Promise<AnalysisResult[]> {
    try {
        // Use environment variable or fallback to production backend
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cypher-backend-production.up.railway.app';
        const response = await fetch(`${API_BASE_URL}/history`);
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

    // 4. Enrich with details (PRESERVE ORIGINAL UPI STRING)
    return {
        ...result,
        details: {
            merchant: upiData.pn || 'Unknown Merchant',
            upi_id: upiData.pa,
            amount: upiData.am,
            original_upi_string: text,  // ✅ PRESERVE FULL UPI STRING
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

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cypher-backend-production.up.railway.app';
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Send ALL fields including optional context so backend ML can analyze the real UPI ID
            body: JSON.stringify({
                amount_risk: features.amount_risk,
                payee_risk: features.payee_risk,
                frequency_risk: features.frequency_risk,
                timing_risk: features.timing_risk,
                device_risk: features.device_risk,
                // Optional enriched context — wires the real UPI ID to the ML model
                ...(features.payee_id !== undefined && { payee_id: features.payee_id }),
                ...(features.amount_value !== undefined && { amount_value: features.amount_value }),
                ...(features.hour_of_day !== undefined && { hour_of_day: features.hour_of_day }),
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();
        return data as AnalysisResult;
    } catch (error: any) {
        console.warn('⚠️ Backend unavailable, using local ML analysis:', error.message);

        // ML Fallback: Run ONNX model in browser
        const { runOfflineScoring } = await import('./offline-model');
        const offlineResult = await runOfflineScoring(features.payee_id || '');

        return {
            risk_label: offlineResult.score >= 70 ? 'danger' : offlineResult.score >= 30 ? 'warning' : 'safe',
            risk_score: offlineResult.score,
            reasons: offlineResult.reasons,
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
