
import { CurrentUser } from '../types';

const LAST_PROFILE_KEY = 'trench4LifeLastProfile';

/**
 * Saves the last used user profile to localStorage.
 * @param user The user profile to save.
 */
export const saveLastProfile = (user: CurrentUser): void => {
    try {
        localStorage.setItem(LAST_PROFILE_KEY, JSON.stringify(user));
    } catch (error) {
        console.error("Failed to save last profile to localStorage", error);
    }
};

/**
 * Retrieves the last used user profile from localStorage.
 * @returns The last saved CurrentUser object, or null if not found.
 */
export const getLastProfile = (): CurrentUser | null => {
    try {
        const data = localStorage.getItem(LAST_PROFILE_KEY);
        if (!data) return null;
        return JSON.parse(data) as CurrentUser;
    } catch (error) {
        console.error("Failed to retrieve last profile from localStorage", error);
        // In case of parsing error, clear corrupted data
        localStorage.removeItem(LAST_PROFILE_KEY);
        return null;
    }
};