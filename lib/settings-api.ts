// API client for user settings
const API_BASE = 'http://localhost:8000';

export interface UserSettings {
    user: {
        name: string;
        email: string;
        member_since: string;
        avatar_url?: string;
    };
    notifications: {
        push_enabled: boolean;
        email_alerts: boolean;
        security_alerts: boolean;
    };
    preferences: {
        dark_mode: boolean;
        haptic_feedback: boolean;
        language: string;
    };
}

export async function getUserSettings(): Promise<UserSettings> {
    try {
        const response = await fetch(`${API_BASE}/api/user/settings`);
        if (!response.ok) throw new Error('Failed to fetch settings');
        return response.json();
    } catch (error) {
        console.warn('Settings API unavailable, using defaults:', error);
        // Return default settings if API is unavailable
        return {
            user: { name: "Glorin", email: "glorin@cypher.app", member_since: "January 2026" },
            notifications: { push_enabled: true, email_alerts: true, security_alerts: true },
            preferences: { dark_mode: true, haptic_feedback: true, language: "English" }
        };
    }
}

export async function updateUserInfo(name?: string, email?: string) {
    try {
        const response = await fetch(`${API_BASE}/api/user/info`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email }),
        });
        if (!response.ok) throw new Error('Failed to update user info');
        return response.json();
    } catch (error) {
        console.error('Failed to update user info:', error);
        throw error;
    }
}

export async function updateNotifications(settings: Partial<UserSettings['notifications']>) {
    try {
        const response = await fetch(`${API_BASE}/api/user/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        if (!response.ok) throw new Error('Failed to update notifications');
        return response.json();
    } catch (error) {
        console.error('Failed to update notifications:', error);
        throw error;
    }
}

export async function updatePreferences(settings: Partial<UserSettings['preferences']>) {
    try {
        const response = await fetch(`${API_BASE}/api/user/preferences`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        if (!response.ok) throw new Error('Failed to update preferences');
        return response.json();
    } catch (error) {
        console.error('Failed to update preferences:', error);
        throw error;
    }
}
