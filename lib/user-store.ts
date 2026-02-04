"use client";

// Simple persistence for the "Drunken Grandma" UX
// We don't need Redux for a single string.

const STORAGE_KEY = "cypher_user_name";

export const getUserName = (): string | null => {
    if (typeof window !== "undefined") {
        return localStorage.getItem(STORAGE_KEY);
    }
    return null;
};

export const setUserName = (name: string): void => {
    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, name);
        // Dispatch specific event for instant UI updates across components
        window.dispatchEvent(new Event("storage"));
    }
};
