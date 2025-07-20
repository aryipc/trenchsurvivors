


import { WeaponType, WeaponData, EnemyType, ItemType, ItemVariantData } from './types';

export const CROCODILE_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InNoYXBlR3JhZCIgeDE9IjAuNSIgeTE9IjAiIHgyPSIwLjUiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZTBlN2ZmIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjYzdkMmZlIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9Imdsb3dHcmFkTGVmdCIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjAiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0ZjQ2ZTUiIHN0b3Atb3BhY2l0eT0iMC42Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDAwMDAwIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iZ2xvd0dyYWRSaWdodCIgeDE9IjEiIHkxPSIwIiB4Mj0iMCIgeTI9IjAiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0ZjQ2ZTUiIHN0b3Atb3BhY2l0eT0iMC42Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDAwMDAwIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iYmxhY2siLz48cGF0aCBkPSJNLTIwIC0yMCBMIDUwIDAgTCAtMjAgMTIwIFoiIGZpbGw9InVybCgjZ2xvd0dyYWRsZWZ0KSIvPjxwYXRoIGQ9Ik0xMjAgLTIwIEwgNTAgMCBMIDEyMCAxMjAgWiIgZmlsbD0idXJsKCNnbG93R3JhZFJpZ2h0KSIvPjxwb2x5Z29uIHBvaW50cz0iNDIsMjUgNTgsMjUgNTAsNDIiIGZpbGw9InVybCgjc2hhcGVHcmFkKSIvPjxwb2x5Z29uIHBvaW50cz0iMzUsNDggNjUsNDggNzAsNjUgMzAsNjUiIGZpbGw9InVybCgjc2hhcGVHcmFkKSIvPjwvc3ZnPg==';

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
export const BOSS_PROJECTILE_WIDTH = 25;
export const BOSS_PROJECTILE_HEIGHT = 25;


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

type EnemyData = { name: string, health: number, speed: number, damage: number, width: number, height: number, xpValue: number, isBoss?: boolean };

export const ENEMY_DATA: Record<EnemyType, EnemyData> = {
    [EnemyType.FUD]: {
        name: 'FUD',
        health: 20,
        speed: 90,
        damage: 5,
        width: 20,
        height: 20,
        xpValue: 2,
    },
    [EnemyType.PaperHands]: {
        name: 'Paper Hands',
        health: 10,
        speed: 150,
        damage: 3,
        width: 18,
        height: 18,
        xpValue: 1,
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

export interface ItemData {
    name: string;
    svg: string;
    variants?: Record<string, ItemVariantData>;
}

const hodlerAreaData = WEAPON_DATA[WeaponType.HODLerArea];
const hodlerAreaLevelBonus = 15;

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
};