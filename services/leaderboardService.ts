import { Redis } from '@upstash/redis';
import { ScoreEntry, CurrentUser } from '../types';

let redis: Redis | null = null;
try {
    // Look for Upstash Redis or Vercel KV environment variables.
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

    if (url && token) {
        redis = new Redis({
            url: url.trim(),
            token: token.trim(),
        });
        console.log("Successfully initialized Redis client for leaderboard.");
    } else {
        console.warn('Redis environment variables (UPSTASH_... or KV_...) not set. Leaderboard will be disabled.');
    }
} catch (e) {
    console.error("Could not initialize Redis client:", e);
}

const LEADERBOARD_KEY = 'trench_survivors_leaderboard_v2'; // Use a new key to avoid conflicts with old structure
const USER_KEY_PREFIX = 'trench_survivors_user_v2:';

/**
 * Retrieves the leaderboard from Upstash Redis.
 * @returns A promise that resolves to a sorted array of ScoreEntry objects.
 */
export const getLeaderboard = async (): Promise<ScoreEntry[]> => {
    if (!redis) return [];
    try {
        // Fetch top 100 usernames and their scores
        const leaderboardData = await redis.zrange(LEADERBOARD_KEY, 0, 99, { withScores: true, rev: true });

        const scores: ScoreEntry[] = [];
        if (leaderboardData.length === 0) return [];
        
        // Batch user data fetching
        const pipeline = redis.pipeline();
        for (let i = 0; i < leaderboardData.length; i += 2) {
            const username = leaderboardData[i] as string;
            pipeline.hgetall(`${USER_KEY_PREFIX}${username}`);
        }
        const usersDataResults = (await pipeline.exec()) as (Record<string, string> | null | Error)[];

        for (let i = 0; i < usersDataResults.length; i++) {
            const username = leaderboardData[i * 2] as string;
            const score = leaderboardData[i * 2 + 1] as number;
            const userDataResult = usersDataResults[i];

            if (userDataResult instanceof Error) {
                console.error(`Failed to fetch data for user ${username}`, userDataResult);
                continue; // Skip entries that failed to load
            }
            
            const userData = userDataResult;

            scores.push({
                username,
                score,
                avatarUrl: userData?.avatarUrl,
                date: userData?.date || new Date().toISOString(),
            });
        }
        
        return scores;
    } catch (error) {
        console.error("Failed to retrieve leaderboard from Upstash Redis", error);
        return [];
    }
};

/**
 * Adds or updates a score for a user in the Upstash Redis leaderboard.
 * @param user The current user object containing username and avatarUrl.
 * @param score The market cap score from the game.
 * @returns A promise that resolves to a boolean indicating if a new high score was saved.
 */
export const addScore = async (user: CurrentUser, score: number): Promise<boolean> => {
    if (!redis) return false;
    if (!user || !user.username.trim()) return false;

    try {
        const username = user.username;
        const existingScore = await redis.zscore(LEADERBOARD_KEY, username);
        let isNewHighScore = false;

        if (existingScore === null || score > existingScore) {
            const pipeline = redis.pipeline();
            
            // Add/update score in the sorted set
            pipeline.zadd(LEADERBOARD_KEY, { score, member: username });

            // Store/update user metadata in a hash
            pipeline.hset(`${USER_KEY_PREFIX}${username}`, {
                avatarUrl: user.avatarUrl,
                date: new Date().toISOString(),
            });

            await pipeline.exec();
            isNewHighScore = true;
        }

        return isNewHighScore;
    } catch (error) {
        console.error("Failed to save score to Upstash Redis", error);
        return false;
    }
};