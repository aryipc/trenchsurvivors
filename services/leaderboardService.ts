import { ScoreEntry, CurrentUser } from '../types';

const API_ENDPOINT = '/api/leaderboard';

/**
 * Retrieves the leaderboard by fetching from the API endpoint.
 * @returns A promise that resolves to a sorted array of ScoreEntry objects.
 */
export const getLeaderboard = async (): Promise<ScoreEntry[]> => {
    try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`API Error: ${response.status} ${response.statusText}`, errorData);
            return [];
        }
        const scores: ScoreEntry[] = await response.json();
        return scores;
    } catch (error) {
        console.error("Failed to fetch leaderboard from API:", error);
        return [];
    }
};

/**
 * Adds or updates a score for a user via the API endpoint.
 * @param user The current user object containing username and avatarUrl.
 * @param score The market cap score from the game.
 * @param maxBalance The highest balance achieved during the game.
 * @returns A promise that resolves to a boolean indicating if a new high score was saved.
 */
export const addScore = async (user: CurrentUser, score: number, maxBalance: number): Promise<boolean> => {
    if (!user || !user.username.trim()) {
        return false;
    }

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user, score, maxBalance }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`API Error: ${response.status} ${response.statusText}`, errorData);
            return false;
        }

        const result = await response.json();
        return result.newHighScore === true;
    } catch (error) {
        console.error("Failed to save score via API:", error);
        return false;
    }
};