/**
 * UPI Handler - Deep-linking and clipboard fallback
 * Handles UPI payment redirection with graceful degradation
 */

export interface UPIParams {
    pa: string;        // Payment address (VPA)
    pn?: string;       // Payee name
    am?: string;       // Amount
    cu?: string;       // Currency (default: INR)
    tn?: string;       // Transaction note
    tr?: string;       // Transaction reference
}

/**
 * Parse UPI string from QR code data
 * Supports both upi:// URLs and raw UPI strings
 */
export function parseUPIString(qrData: string): UPIParams | null {
    try {
        // Handle upi:// protocol
        let upiString = qrData;
        if (qrData.startsWith('upi://')) {
            upiString = qrData.replace('upi://', '');
        }

        // Extract parameters from query string
        const url = new URL(`https://dummy.com/${upiString}`);
        const params: UPIParams = {
            pa: url.searchParams.get('pa') || '',
        };

        // Optional parameters
        if (url.searchParams.get('pn')) params.pn = url.searchParams.get('pn')!;
        if (url.searchParams.get('am')) params.am = url.searchParams.get('am')!;
        if (url.searchParams.get('cu')) params.cu = url.searchParams.get('cu')!;
        if (url.searchParams.get('tn')) params.tn = url.searchParams.get('tn')!;
        if (url.searchParams.get('tr')) params.tr = url.searchParams.get('tr')!;

        // Validate minimum required field
        if (!params.pa) return null;

        return params;
    } catch (error) {
        console.error('Failed to parse UPI string:', error);
        return null;
    }
}

/**
 * Build UPI deep-link URL from parameters
 */
export function buildUPIDeepLink(params: UPIParams): string {
    // Validate VPA format
    if (!params.pa || !params.pa.includes('@')) {
        throw new Error('Invalid UPI ID format - must contain @');
    }

    // Validate amount if present
    if (params.am) {
        const amount = parseFloat(params.am);
        if (isNaN(amount) || amount <= 0) {
            throw new Error('Invalid amount - must be a positive number');
        }
    }

    const queryParams = new URLSearchParams();
    queryParams.set('pa', params.pa);
    if (params.pn) queryParams.set('pn', params.pn);
    if (params.am) queryParams.set('am', params.am);
    queryParams.set('cu', params.cu || 'INR');  // Always include currency (default: INR)
    if (params.tn) queryParams.set('tn', params.tn);
    if (params.tr) queryParams.set('tr', params.tr);

    return `upi://pay?${queryParams.toString()}`;
}

/**
 * Attempt UPI deep-link redirect
 * Returns true if redirect was attempted, false if blocked
 */
export function attemptUPIRedirect(upiParams: UPIParams): boolean {
    try {
        const deepLink = buildUPIDeepLink(upiParams);

        // Attempt redirect
        window.location.href = deepLink;

        return true;
    } catch (error) {
        console.error('UPI redirect failed:', error);
        return false;
    }
}

/**
 * Copy UPI string to clipboard
 * Returns true if successful
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            if (typeof document === 'undefined' || !document.body) {
                return false;
            }

            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');

            // Safe removal
            if (textarea.parentNode) {
                textarea.parentNode.removeChild(textarea);
            }

            return success;
        }
    } catch (error) {
        console.error('Clipboard copy failed:', error);
        return false;
    }
}

/**
 * Format user-facing instructions for manual UPI payment
 */
export function formatUPIInstructions(params: UPIParams): string {
    const lines = [
        'Open your UPI app (GPay / PhonePe / Paytm)',
        '',
        'Payment Details:',
        `• To: ${params.pn || params.pa}`,
    ];

    if (params.am) lines.push(`• Amount: ₹${params.am}`);
    if (params.tn) lines.push(`• Note: ${params.tn}`);

    lines.push('', 'UPI ID copied to clipboard');

    return lines.join('\n');
}
