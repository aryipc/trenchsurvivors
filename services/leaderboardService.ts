import { Redis } from '@upstash/redis';
import { ScoreEntry, CurrentUser } from '../types';

let redis: Redis | null = null;
try {
    // This assumes UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are available in the environment.
    // In a real app, this should be handled by a secure backend, not on the client.
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    } else {
        console.warn('Upstash Redis environment variables not set. Leaderboard will be disabled.');
    }
} catch (e) {
    console.error("Could not initialize Upstash Redis client:", e);
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
        const leaderboardData = await redis.zrevrange(LEADERBOARD_KEY, 0, 99, { withScores: true });

        const scores: ScoreEntry[] = [];
        if (leaderboardData.length === 0) return [];
        
        // Batch user data fetching
        const pipeline = redis.pipeline();
        for (let i = 0; i < leaderboardData.length; i += 2) {
            const username = leaderboardData[i] as string;
            pipeline.hgetall(`${USER_KEY_PREFIX}${username}`);
        }
        const usersData = (await pipeline.exec()) as (Record<string, string> | null)[];

        for (let i = 0; i < usersData.length; i++) {
            const username = leaderboardData[i * 2] as string;
            const score = leaderboardData[i * 2 + 1] as number;
            const userData = usersData[i];

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