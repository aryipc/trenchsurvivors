

import { ScoreEntry, CurrentUser } from '../types';

const LEADERBOARD_KEY = 'trenchSurvivorsLeaderboard';

/**
 * Retrieves the leaderboard from localStorage and sorts it by score.
 * @returns A sorted array of ScoreEntry objects.
 */
export const getLeaderboard = (): ScoreEntry[] => {
    try {
        const data = localStorage.getItem(LEADERBOARD_KEY);
        if (!data) return [];
        const scores: ScoreEntry[] = JSON.parse(data);
        // Ensure scores are always sorted when retrieved
        return scores.sort((a, b) => b.score - a.score);
    } catch (error) {
        console.error("Failed to retrieve leaderboard from localStorage", error);
        // In case of error, clear corrupted data
        localStorage.removeItem(LEADERBOARD_KEY);
        return [];
    }
};

/**
 * Adds or updates a score for a user in the localStorage leaderboard.
 * A score is only added if it's higher than the user's previous high score.
 * @param user The current user object containing username and avatarUrl.
 * @param score The market cap score from the game.
 * @returns A boolean indicating if a new high score was saved.
 */
export const addScore = (user: CurrentUser, score: number): boolean => {
    if (!user || !user.username.trim()) return false;

    try {
        const leaderboard = getLeaderboard();
        const existingEntryIndex = leaderboard.findIndex(entry => entry.username.toLowerCase() === user.username.toLowerCase());

        const now = new Date().toISOString();
        let isNewHighScore = false;

        if (existingEntryIndex !== -1) {
            // User exists, check if new score is higher
            if (score > leaderboard[existingEntryIndex].score) {
                leaderboard[existingEntryIndex].score = score;
                leaderboard[existingEntryIndex].date = now;
                leaderboard[existingEntryIndex].avatarUrl = user.avatarUrl; // Update avatar too
                isNewHighScore = true;
            }
        } else {
            // New user, add to leaderboard
            leaderboard.push({ username: user.username, avatarUrl: user.avatarUrl, score, date: now });
            isNewHighScore = true;
        }

        if (isNewHighScore) {
            // Sort before saving to keep the list tidy
            leaderboard.sort((a, b) => b.score - a.score);
            localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
        }

        return isNewHighScore;

    } catch (error) {
        console.error("Failed to save score to localStorage", error);
        return false;
    }
};