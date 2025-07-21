


import { WeaponType, UpgradeOption } from '../types';

// Static, hardcoded descriptions to replace the Gemini API calls.
export const STATIC_DESCRIPTIONS: Record<WeaponType, string[]> = {
    [WeaponType.ShillTweet]: [
        'Fires a tweet that automatically seeks the nearest source of FUD.', // Lvl 1 (New)
        'Faster tweets, harder impact. Your alpha is spreading.', // Lvl 2
        'Adds piercing. One tweet can now hit two bears.', // Lvl 3
        'Increased projectile speed and range. No FUD is safe.', // Lvl 4
        'Greatly increased damage. Your words are now law.', // Lvl 5
        'Adds another piercing target. Hit three bears with one stone-cold tweet.', // Lvl 6
        'Drastic fire rate increase. Spam the timeline into submission.', // Lvl 7
        'Maximum shill. Tweets now explode on impact, damaging nearby FUD.', // Lvl 8
    ],
    [WeaponType.HODLerArea]: [
        'Creates a field of conviction that continuously damages and slows nearby enemies by 10%.', // Lvl 1 (New)
        'Increased aura damage and radius. Your conviction is growing.', // Lvl 2
        'Further increases damage and the slowing area.', // Lvl 3
        'A significant boost to aura radius and damage.', // Lvl 4
        'Greatly increased damage. The FUD melts in your presence.', // Lvl 5
        'The aura becomes much larger, controlling a huge area of the trench.', // Lvl 6
        'Massive damage upgrade. Only the strongest whales can survive this.', // Lvl 7
        'Your conviction is absolute. The aura reaches its maximum size and damage.', // Lvl 8
    ],
    [WeaponType.TradingBot]: [
        'Deploys an orbiting trading bot that executes hostile takeovers on threats.', // Lvl 1 (New)
        'Deploys a second bot. Double the trading power.', // Lvl 2
        'Deploys a third bot. A powerful trading trio.', // Lvl 3
        'Deploys a fourth bot. A quad-core of profit.', // Lvl 4
        'Deploys a fifth bot. High-frequency trading enabled.', // Lvl 5
        'Deploys a sixth bot. Maximum market dominance.', // Lvl 6
    ],
    [WeaponType.LaserEyes]: [
        'Fires a continuous, auto-targeting beam that melts a single enemy.', // Lvl 1 (New)
        'Increases beam damage. The hype is getting real.', // Lvl 2
        'The beam gets wider and deals more damage. Your influence grows.', // Lvl 3
        'A significant damage boost. Bears are starting to notice.', // Lvl 4
        'Massive damage increase. This is the final form of hype.', // Lvl 5
        'Maximum power. The beam is wider and deals extreme damage.', // Lvl 6
    ],
    [WeaponType.Airdrop]: [
        'Calls in a tactical airdrop, dealing massive area damage.', // Lvl 1 (New)
        'Bigger explosion radius and more damage. It\'s free money (for you).', // Lvl 2
        'Reduced cooldown. Call in support more often.', // Lvl 3
        'The airdrop now leaves a temporary slowing field on the ground.', // Lvl 4
        'Greatly increased damage and blast radius. A true market-mover.', // Lvl 5
        'The drop now splits into three smaller explosions. Carpet bomb the FUD.', // Lvl 6
        'Drastic increase in airdrop frequency. It\'s raining gains, hallelujah!', // Lvl 7
        'The ultimate airdrop. A massive explosion that also stuns all enemies hit.', // Lvl 8
    ],
};

/**
 * Generates descriptions for upgrade options from a static list.
 * This function mimics the async behavior of an API call for compatibility.
 * It is now offline-first and avoids any API rate limit issues.
 */
export async function generateBatchDescriptions(options: UpgradeOption[]): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    for (const option of options) {
        const descKey = `${option.type}_${option.level}`;
        const descriptionsForWeapon = STATIC_DESCRIPTIONS[option.type];
        
        // Level is 1-based, array is 0-based.
        const description = descriptionsForWeapon?.[option.level - 1];

        if (description) {
            results[descKey] = description;
        } else {
            // Fallback in case a description for a specific level is missing.
            results[descKey] = `A powerful level ${option.level} upgrade for ${option.type}.`;
        }
    }
    
    // Wrap in a promise to maintain the async signature.
    return Promise.resolve(results);
}