
import { WeaponType, WeaponData, EnemyType, EnemyData, ItemType, ItemVariantData, ItemData } from './types';

export const SHIBA_HELMET_ICON = "data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='dogFurT4L' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23f4a161'/%3E%3Cstop offset='100%25' stop-color='%23e77f51'/%3E%3C/linearGradient%3E%3ClinearGradient id='muzzleFurT4L' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23fff5e6'/%3E%3Cstop offset='100%25' stop-color='%23fde1c7'/%3E%3C/linearGradient%3E%3Cpattern id='camoT4L' patternUnits='userSpaceOnUse' width='50' height='50'%3E%3Crect width='50' height='50' fill='%23556B2F'/%3E%3Cpath d='M 0 0 C 10 20 20 0 30 15 C 40 30 50 10 50 50 L 0 50 Z' fill='%236B8E23'/%3E%3Cpath d='M 20 10 C 30 30 40 15 50 25 L 50 0 L 30 0 C 20 -10 10 10 20 10 Z' fill='%238B4513' opacity='0.6'/%3E%3C/pattern%3E%3C/defs%3E%3Cg transform='rotate(-5 50 50)'%3E%3Cg%3E%3Cpath fill='url(%23dogFurT4L)' stroke='%234f423a' stroke-width='3' d='M80,72 C88,55 78,40 70,38 C60,35 40,35 30,38 C22,40 12,55 20,72 C25,85 38,92 50,92 C62,92 75,85 80,72 Z'/%3E%3Cpath fill='url(%23muzzleFurT4L)' stroke='%234f423a' stroke-width='3' d='M38,84 C35,75 40,68 50,68 C60,68 65,75 62,84 C60,88 55,90 50,90 C45,90 40,88 38,84 Z'/%3E%3Cpath fill='none' stroke='%234f423a' stroke-width='2' stroke-linecap='round' d='M46,80 Q50,82 56,79'/%3E%3Cpath fill='%232c201a' d='M50,73 m-4,0 a4,4 0 1 1 8,0 a4,4 0 1 1 -8,0'/%3E%3Cg%3E%3Cellipse cx='41' cy='62' rx='7' ry='3.5' fill='%232c201a'/%3E%3Cellipse cx='64' cy='62' rx='7' ry='3.5' fill='%232c201a'/%3E%3Ccircle cx='38' cy='61' r='1.5' fill='white'/%3E%3Ccircle cx='61' cy='61' r='1.5' fill='white'/%3E%3C/g%3E%3Cpath fill='url(%23dogFurT4L)' stroke='%234f423a' stroke-width='3' d='M25,50 C20,35 45,35 45,35 L40,55 Z'/%3E%3Cpath fill='%23fde1c7' stroke='%234f423a' stroke-width='1.5' d='M28,48 C25,40 35,40 35,40 L48,53 Z'/%3E%3Cpath fill='url(%23dogFurT4L)' stroke='%234f423a' stroke-width='3' d='M75,58 C80,35 65,35 65,35 L60,55 Z'/%3E%3Cpath fill='%23fde1c7' stroke='%234f423a' stroke-width='1.5' d='M72,48 C75,40 65,40 65,40 L62,53 Z'/%3E%3C/g%3E%3Cg transform='translate(0, -15) scale(1.15)'%3E%3Cpath d='M14 58 C 12 40, 25 26, 50 26 C 75 26, 88 40, 86 58 L 89 60 Q 50 64, 11 60 L 14 58 Z' fill='url(%23camoT4L)' stroke='%23333' stroke-width='2.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

export const CROCODILE_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InNoYXBlR3JhZCIgeDE9IjAuNSIgeTE9IjAiIHgyPSIwLjUiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZTBlN2ZmIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjYzdkMmZlIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9Imdsb3dHcmFkTGVmdCIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjAiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0ZjQ2ZTUiIHN0b3Atb3BhY2l0eT0iMC42Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDAwMDAwIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iZ2xvd0dyYWRSaWdodCIgeDE9IjEiIHkxPSIwIiB4Mj0iMCIgeTI9IjAiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0ZjQ2ZTUiIHN0b3Atb3BhY2l0eT0iMC42Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDAwMDAwIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iYmxhY2siLz48cGF0aCBkPSJNLTIwIC0yMCBMIDUwIDAgTCAtMjAgMTIwIFoiIGZpbGw9InVybCgjZ2xvd0dyYWRsZWZ0KSIvPjxwYXRoIGQ9Ik0xMjAgLTIwIEwgNTAgMCBMIDEyMCAxMjAgWiIgZmlsbD0idXJsKCNnbG93R3JhZFJpZ2h0KSIvPjxwb2x5Z29uIHBvaW50cz0iNDIsMjUgNTgsMjUgNTAsNDIiIGZpbGw9InVybCgjc2hhcGVHcmFkKSIvPjxwb2x5Z29uIHBvaW50cz0iMzUsNDggNjUsNDggNzAsNjUgMzAsNjUiIGZpbGw9InVybCgjc2hhcGVHcmFkKSIvPjwvc3ZnPg==';

export const GROUND_CRACK_ICON = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNlZjQ0NDQiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiPjxwYXRoIGQ9Ik01MCA1MCBMIDYwIDQwIEwgNjUgNDUgTCA4MCAyMyIvPjxwYXRoIGQ9Ik01MCA1MCBMIDQwIDM4IEwgMzAgNDIgTCAxNSA0MCBMIDEwIDQ4Ii8+PHBhdGggZD0iTTUwIDUwIEwgNDUgNjAgTCAzNSA2MiBMIDMwIDc1IEwgMzUgOTIiLz48cGF0aCBkPSJNNTAgNTIgTCA2MCA2NSBMIDcwIDYyIEwgODAgNzAgTCA4NSA4MiBMIDc4IDkwIi8+PHBhdGggZD0iTTUwIDUwIEwgMzUgMjUgTCAyOCAxOCIvPjxwYXRoIGQ9Ik01MCA1MCBMIDc4IDUwIEwgOTAgNTgiLz48L2c+PC9zdmc+';

export const DEV_LOCK_ICON = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIxNSIgeT0iNDAiIHdpZHRoPSI3MCIgaGVpZ2h0PSI1MCIgcng9IjEwIiBmaWxsPSIjRkZENzAwIiBzdHJva2U9IiNEQUE1MjAiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik0zMCA0NSBWIDI1IEMgMzAgMTAsIDcwIDEwLCA3MCAyNSBWIDQ1IiBmaWxsPSJub25lIiBzdHJva2U9IiNEQUE1MjAiIHN0cm9rZS13aWR0aD0iMTQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNjUiIHI9IjciIGZpbGw9IiM0MDQwNDAiLz48L3N2Zz4=';

export const DEV_LOCK_MESSAGES = [
    'dev lock',
    '???',
    'WTF?!',
    'Unfair!',
    'Dev? Pls',
    'Can’t move. Send help',
    'This is abuse',
    'This game sucks',
    'Tell my family...',
    'fund you',
    'who launched this?',
];

export const GAME_AREA_WIDTH = 3840;
export const GAME_AREA_HEIGHT = 2160;

export const MC_PER_SECOND = 500;
export const STARTING_MC = 4500;
export const BOSS_SPAWN_MC = 70000;
export const MC_VOLATILITY_INTERVAL = 0.5; // How often the MC drops
export const MC_VOLATILITY_AMOUNT = 250; // Max random amount to drop by

// BOSS ATTACK CONSTANTS
export const BOSS_RANGED_ATTACK_COOLDOWN = 3.0; // seconds
export const BOSS_RANGED_ATTACK_DAMAGE = 15;
export const BOSS_RANGED_ATTACK_SPEED = 350;
export const BOSS_PROJECTILE_WIDTH = 80; // Length of the candle
export const BOSS_PROJECTILE_HEIGHT = 20; // Width of the candle
export const BOSS_RED_CANDLE_COOLDOWN = 15.0; // seconds
export const BOSS_RED_CANDLE_WARNING_DURATION = 3.0;
export const BOSS_RED_CANDLE_ATTACK_DURATION = 2.0;
export const BOSS_RED_CANDLE_DAMAGE_PER_SEC = 30;
export const BOSS_RED_CANDLE_WIDTH = 150;


export const WEAPON_DATA: Record<WeaponType, WeaponData> = {
    [WeaponType.ShillTweet]: {
        name: 'Shill Tweet',
        damage: 15,
        speed: 400, // Projectile speed
        cooldown: 1.5,
        width: 12,
        height: 12,
        radius: 300, // Targeting range
        maxLevel: 8,
    },
    [WeaponType.HODLerArea]: { // Renamed from Diamond Hands
        name: 'HODLer Area',
        damage: 5, // Damage per second
        speed: 0,
        cooldown: 1, // Tick rate for damage
        width: 100,
        height: 100,
        radius: 100, // Starting radius
        maxLevel: 8,
    },
    [WeaponType.TradingBot]: { // New orbiting bot weapon
        name: 'Trading Bot',
        damage: 25, // Damage per hit
        speed: 2, // Rotation speed in rad/s
        cooldown: 0, // Not a fire-rate weapon
        width: 32, // Bot size
        height: 32,
        radius: 80, // Orbit radius
        maxLevel: 6, // Max number of bots
        hitCooldown: 0.75, // Seconds enemy is immune after a hit
    },
    [WeaponType.LaserEyes]: {
        name: 'Laser Eyes',
        damage: 20, // Damage Per Second
        speed: 0,
        cooldown: 4, // 4 second cycle time
        duration: 2, // 2 seconds active within cycle
        width: 15,   // Beam width
        height: 0, // Length is now dynamic
        maxLevel: 6,
    },
    [WeaponType.Airdrop]: {
        name: 'Airdrop',
        damage: 50,
        speed: 0,
        cooldown: 10,
        width: 30, // Crate size
        height: 30,
        radius: 120, // Explosion radius
        maxLevel: 8,
    },
};

export const ENEMY_DATA: Record<EnemyType, EnemyData> = {
    [EnemyType.FUD]: {
        name: 'FUD',
        health: 20,
        speed: 90,
        damage: 5,
        width: 20,
        height: 20,
        xpValue: 2,
        levelData: {
            2: {
                health: 40,
                damage: 8,
                width: 24,
                height: 24,
                xpValue: 4,
            }
        }
    },
    [EnemyType.PaperHands]: {
        name: 'Paper Hands',
        health: 10,
        speed: 150,
        damage: 3,
        width: 18,
        height: 18,
        xpValue: 1,
        levelData: {
            2: {
                health: 15,
                speed: 165,
                damage: 5,
                width: 20,
                height: 20,
                xpValue: 2,
            }
        }
    },
    [EnemyType.RivalWhale]: {
        name: 'Rival Whale',
        health: 250,
        speed: 50,
        damage: 20,
        width: 50,
        height: 50,
        xpValue: 15,
    },
    [EnemyType.MigratingBoss]: {
        name: 'Migrating Boss',
        health: 50000,
        speed: 30,
        damage: 25, // Contact damage
        width: 120,
        height: 120,
        xpValue: 500,
        isBoss: true,
    },
};


export const LEVEL_THRESHOLDS: { [level: number]: number } = {
    1: 10,
    2: 25,
    3: 45,
    4: 70,
    5: 100,
    6: 140,
    7: 190,
    8: 250,
    9: 320,
    10: 400,
};

// Add more levels programmatically
for (let i = 11; i <= 100; i++) {
    LEVEL_THRESHOLDS[i] = Math.floor(LEVEL_THRESHOLDS[i - 1] * 1.15);
}

// Item constants
export const ITEM_DROP_CHANCE = 0.05; // 5% chance to drop an item

const hodlerAreaData = WEAPON_DATA[WeaponType.HODLerArea];

export const ITEM_DATA: Record<ItemType, ItemData> = {
    [ItemType.Candle]: {
        name: 'Candle',
        svg: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNDAgMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9IiMxMEI5ODEiPjxyZWN0IHg9IjE4IiB5PSIwIiB3aWR0aD0iNCIgaGVpZ2h0PSIxMDAiIC8+PHJlY3QgeD0iNSIgeT0iMjAiIHdpZHRoPSIzMCIgaGVpZ2h0PSI2MCIgLz48L3N2Zz4=",
        variants: {
            'Gake': {
                name: 'Gake Candle',
                duration: 1.0,      // Slower rotation to prevent tunneling, still completes 2 rotations
                length: 900,        // Largest range
                width: 35,          // Thickest beam
                rotations: 2,
            },
            'West': {
                name: 'West Candle',
                duration: 0.75,     // Medium speed
                length: hodlerAreaData.radius! * 1.8, // Slightly smaller than L1 HODLer area diameter
                width: 30,
                rotations: 1,
            },
            '奶牛candle': {
                name: '奶牛candle',
                duration: 1.0,      // Slowest speed
                length: hodlerAreaData.radius! * 1.8, // Slightly smaller than L1 HODLer area diameter
                width: 25,
                rotations: 1,
            }
        }
    },
    [ItemType.BONKAura]: {
        name: 'BONK Mode',
        svg: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNTAgNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iI2VmNDQ0NCI+PHJlY3QgeD0iMjIiIHk9IjgiIHdpZHRoPSI2IiBoZWlnaHQ9IjI1IiByeD0iMyIgLz48Y2lyY2xlIGN4PSIyNSIgY3k9IjQwIiByPSI0IiAvPjwvZz48L3N2Zz4=",
        duration: 5,
    },
    [ItemType.DevLock]: {
        name: 'Dev Lock',
        svg: DEV_LOCK_ICON,
        duration: 5,
    },
};

// Solana Token Upgrades
export const TOKEN_UPGRADES = {
    BONUS_DAMAGE: {
        id: 'bonusDamage' as const,
        name: 'Diamond Hands',
        cost: 100,
        description: 'Permanently increase all damage by 10%.',
        damageBonus: 0.1,
        icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2M0YjVmZCI+PHBhdGggZD0iTTEyIDJMMCAxMmg5djlMMjIgMTJoLTlWMnoiLz48L3N2Zz4='
    },
    BONUS_XP: {
        id: 'bonusXp' as const,
        name: 'Market Insight',
        cost: 250,
        description: 'Permanently gain 10% more Hype from all sources.',
        xpBonus: 0.1,
        icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2M0YjVmZCI+PHBhdGggZD0iTTEyIDhsLTYgNmgxMmwLTYtNnoiLz48L3N2Zz4='
    },
};