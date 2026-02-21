/**
 * Haptic Feedback Utility
 * Provides tactile feedback for user interactions
 */

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

/**
 * Trigger haptic feedback if supported by the device
 */
export function triggerHaptic(style: HapticStyle = 'light'): void {
    // Check if running in browser
    if (typeof window === 'undefined') return;

    // Vibration API (widely supported on mobile)
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
        const patterns: Record<HapticStyle, number | number[]> = {
            light: 10,
            medium: 20,
            heavy: 30,
            selection: 5,
            success: [10, 50, 10],
            warning: [20, 100, 20],
            error: [30, 100, 30, 100, 30],
        };

        navigator.vibrate(patterns[style]);
    }

    // iOS Haptic Feedback (if available via webkit)
    // @ts-ignore - webkit specific API
    if (window.webkit?.messageHandlers?.haptic) {
        // @ts-ignore
        window.webkit.messageHandlers.haptic.postMessage(style);
    }
}

/**
 * Haptic feedback for navigation
 */
export const hapticNav = () => triggerHaptic('selection');

/**
 * Haptic feedback for button press
 */
export const hapticButton = () => triggerHaptic('light');

/**
 * Haptic feedback for important action
 */
export const hapticImpact = () => triggerHaptic('medium');

/**
 * Haptic feedback for success
 */
export const hapticSuccess = () => triggerHaptic('success');

/**
 * Haptic feedback for error
 */
export const hapticError = () => triggerHaptic('error');

/**
 * Haptic feedback for warning
 */
export const hapticWarning = () => triggerHaptic('warning');
