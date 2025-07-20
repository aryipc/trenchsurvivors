import { kv } from '@vercel/kv';
// @ts-ignore
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Type definitions needed for the API route, mirroring the frontend types.
interface ScoreEntry {
    username: string;
    avatarUrl?: string;
    score: number;
    maxBalance: number;
    date: string;
}

interface CurrentUser {
    username:string;
    avatarUrl: string;
}

const LEADERBOARD_KEY = 'trench_survivors_leaderboard_v2';
const USER_KEY_PREFIX = 'trench_survivors_user_v2:';

// This function runs on the server and can securely access KV.
const getLeaderboardFromKV = async (): Promise<ScoreEntry[]> => {
    try {
        const leaderboardData = await kv.zrange(LEADERBOARD_KEY, 0, 99, { rev: true, withScores: true });

        if (!leaderboardData || leaderboardData.length === 0) {
            return [];
        }
        
        const scores: ScoreEntry[] = [];
        const userPromises: Promise<Record<string, any> | null>[] = [];
        const usernames: string[] = [];
        
        // Collect usernames and create promises to fetch their metadata
        for (let i = 0; i < leaderboardData.length; i += 2) {
            const username = leaderboardData[i] as string;
            usernames.push(username);
            userPromises.push(kv.hgetall(`${USER_KEY_PREFIX}${username}`));
        }
        
        const usersDataResults = await Promise.all(userPromises);

        // Combine scores with user metadata
        for (let i = 0; i < usersDataResults.length; i++) {
            const username = usernames[i];
            const score = leaderboardData[i * 2 + 1] as number;
            const userData = usersDataResults[i];

            scores.push({
                username,
                score,
                avatarUrl: userData?.avatarUrl,
                maxBalance: userData?.maxBalance || 0,
                date: userData?.date || new Date().toISOString(),
            });
        }
        
        return scores;
    } catch (error) {
        console.error("KV Error in getLeaderboardFromKV:", error);
        return []; // Return empty array on error so the frontend doesn't break
    }
};

// This function also runs on the server.
const addScoreToKV = async (user: CurrentUser, score: number, maxBalance: number): Promise<boolean> => {
    if (!user || !user.username || !user.username.trim() || typeof score !== 'number') {
        return false;
    }

    try {
        const username = user.username;
        const existingScore = await kv.zscore(LEADERBOARD_KEY, username);
        
        if (existingScore !== null && score <= existingScore) {
            return false; // Not a new high score
        }

        const pipeline = kv.pipeline();
        pipeline.zadd(LEADERBOARD_KEY, { score, member: username });
        pipeline.hset(`${USER_KEY_PREFIX}${username}`, {
            avatarUrl: user.avatarUrl,
            date: new Date().toISOString(),
            maxBalance: maxBalance,
        });
        await pipeline.exec();
        
        return true; // It is a new high score
    } catch (error) {
        console.error("KV Error in addScoreToKV:", error);
        return false;
    }
};

// The main API handler for Vercel Serverless Functions.
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers for all responses to allow frontend access
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        try {
            const scores = await getLeaderboardFromKV();
            return res.status(200).json(scores);
        } catch (error) {
            console.error("API Error fetching leaderboard:", error);
            return res.status(500).json({ error: 'Failed to fetch leaderboard' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { user, score, maxBalance } = req.body;
            if (!user || typeof score !== 'number' || typeof maxBalance !== 'number') {
                return res.status(400).json({ error: 'Invalid request: "user", "score", and "maxBalance" are required.' });
            }
            const isNewHighScore = await addScoreToKV(user, score, maxBalance);
            return res.status(200).json({ success: true, newHighScore: isNewHighScore });
        } catch (error) {
            console.error("API Error adding score:", error);
            return res.status(500).json({ error: 'Failed to add score' });
        }
    }

    // If method is not GET or POST
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}