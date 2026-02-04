# User Settings Storage (Simple JSON-based persistence)
import json
import os
from pathlib import Path

SETTINGS_FILE = Path(__file__).parent / "user_settings.json"

def load_settings():
    """Load user settings from JSON file"""
    if SETTINGS_FILE.exists():
        with open(SETTINGS_FILE, 'r') as f:
            return json.load(f)
    return get_default_settings()

def save_settings(settings):
    """Save user settings to JSON file"""
    with open(SETTINGS_FILE, 'w') as f:
        json.dump(settings, f, indent=2)
    return settings

def get_default_settings():
    """Get default user settings"""
    return {
        "user": {
            "name": "Glorin",
            "email": "glorin@cypher.app",
            "member_since": "January 2026",
            "avatar_url": ""
        },
        "notifications": {
            "push_enabled": True,
            "email_alerts": True,
            "security_alerts": True
        },
        "preferences": {
            "dark_mode": True,
            "haptic_feedback": True,
            "language": "English"
        }
    }

def update_user_info(name=None, email=None):
    """Update user information"""
    settings = load_settings()
    if name:
        settings["user"]["name"] = name
    if email:
        settings["user"]["email"] = email
    return save_settings(settings)

def update_notifications(push_enabled=None, email_alerts=None, security_alerts=None):
    """Update notification settings"""
    settings = load_settings()
    if push_enabled is not None:
        settings["notifications"]["push_enabled"] = push_enabled
    if email_alerts is not None:
        settings["notifications"]["email_alerts"] = email_alerts
    if security_alerts is not None:
        settings["notifications"]["security_alerts"] = security_alerts
    return save_settings(settings)

def update_preferences(dark_mode=None, haptic_feedback=None, language=None):
    """Update user preferences"""
    settings = load_settings()
    if dark_mode is not None:
        settings["preferences"]["dark_mode"] = dark_mode
    if haptic_feedback is not None:
        settings["preferences"]["haptic_feedback"] = haptic_feedback
    if language is not None:
        settings["preferences"]["language"] = language
    return save_settings(settings)
