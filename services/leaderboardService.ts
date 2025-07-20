import { kv } from '@vercel/kv';
import { ScoreEntry, CurrentUser } from '../types';

// The 'kv' object is automatically configured by Vercel's environment variables.
// No need to manually initialize or check for process.env.

const LEADERBOARD_KEY = 'trench_survivors_leaderboard_v2';
const USER_KEY_PREFIX = 'trench_survivors_user_v2:';

/**
 * Retrieves the leaderboard from Vercel KV.
 * @returns A promise that resolves to a sorted array of ScoreEntry objects.
 */
export const getLeaderboard = async (): Promise<ScoreEntry[]> => {
    try {
        // Fetch top 100 usernames and their scores from the sorted set.
        const leaderboardData = await kv.zrange(LEADERBOARD_KEY, 0, 99, { withScores: true, rev: true });

        const scores: ScoreEntry[] = [];
        if (!leaderboardData || leaderboardData.length === 0) {
            return [];
        }
        
        // Prepare to fetch metadata for all users in parallel.
        const userPromises: Promise<Record<string, unknown> | null>[] = [];
        for (let i = 0; i < leaderboardData.length; i += 2) {
            const username = leaderboardData[i] as string;
            userPromises.push(kv.hgetall(`${USER_KEY_PREFIX}${username}`));
        }
        const usersDataResults = await Promise.all(userPromises);

        // Combine the scores with the user metadata.
        for (let i = 0; i < usersDataResults.length; i++) {
            const username = leaderboardData[i * 2] as string;
            const score = leaderboardData[i * 2 + 1] as number;
            const userData = usersDataResults[i];

            scores.push({
                username,
                score,
                avatarUrl: userData?.avatarUrl as string | undefined,
                date: (userData?.date as string) || new Date().toISOString(),
            });
        }
        
        return scores;
    } catch (error) {
        console.error("Failed to retrieve leaderboard from Vercel KV", error);
        return [];
    }
};

/**
 * Adds or updates a score for a user in the Vercel KV leaderboard.
 * @param user The current user object containing username and avatarUrl.
 * @param score The market cap score from the game.
 * @returns A promise that resolves to a boolean indicating if a new high score was saved.
 */
export const addScore = async (user: CurrentUser, score: number): Promise<boolean> => {
    if (!user || !user.username.trim()) {
        return false;
    }

    try {
        const username = user.username;
        const existingScore = await kv.zscore(LEADERBOARD_KEY, username);
        let isNewHighScore = false;

        // Only update if the new score is higher.
        if (existingScore === null || score > existingScore) {
            const pipeline = kv.pipeline();
            
            // Add/update score in the sorted set.
            pipeline.zadd(LEADERBOARD_KEY, { score, member: username });

            // Store/update user metadata in a hash.
            pipeline.hset(`${USER_KEY_PREFIX}${username}`, {
                avatarUrl: user.avatarUrl,
                date: new Date().toISOString(),
            });

            await pipeline.exec();
            isNewHighScore = true;
        }

        return isNewHighScore;
    } catch (error) {
        console.error("Failed to save score to Vercel KV", error);
        return false;
    }
};