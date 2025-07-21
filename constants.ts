import { WeaponType, WeaponData, EnemyType, EnemyData, ItemType, ItemVariantData, ItemData } from './types';

export const SHIBA_HELMET_ICON = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImhlbG1ldEdyYWQiIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNkI4RTIzIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzU1NmIyZiIgLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iZG9nRnVyIiB4MT0iMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2YwOWEzYSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNjdlMjIiIC8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9Im11enpsZUZ1ciIgeDE9IjAiIHkxPSIwIiB4Mj0iMCIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZGY1ZTYiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZjNkMWI3IiAvPjwvbGluZWFyR3JhZGllbnQ+PGNsaXBQYXRoIGlkPSJoZWxtZXRNYXNrIj48cGF0aCBkPSJNMTgsNTggQzE1LDM1IDg1LDM1IDgyLDU4IEEgNDUgNDUgMCAwIDEgMTggNTggWiIgLz48L2NsaXBQYXRoPjwvZGVmcz48ZyB0cmFuc2Zvcm09InJvdGF0ZSgtNSA1MCA1MCkiPjxnPjxwYXRoIGZpbGw9InVybCgjZG9nRnVyKSIgc3Ryb2tlPSIjNGEzYTJhIiBzdHJva2Utd2lkdGg9IjMiIGQ9Ik04MCw3MiBDODgsNTUgNzgsNDAgNzAsMzggQzYwLDM1IDQwLDM1IDMwLDM4IEMyMiw0MCAxMiw1NSAyMCw3MiBDMjUsODUgMzgsOTIgNTAsOTIgQzYyLDkyIDc1LDg1IDgwLDcyIFoiIC8+PHBhdGggZmlsbD0idXJsKCNtdXp6bGVGdXIpIiBzdHJva2U9IiM0YTNhMmEiIHN0cm9rZS13aWR0aD0iMyIgZD0iTTM4LDg0IEMzNSw3NSA0MCw2OCA1MCw2OCBDNjAsNjggNjUsNzUgNjIsODQgQzYwLDg4IDU1LDkwIDUwLDkwIEM0NSw5MCA0MCw4OCAzOCw4NCBaIiAvPjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzRhM2EyYSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIGQ9Ik00OCw3OCBRNTAsODEgNTIsNzgiIC8+PHBhdGggZmlsbD0iIzJjMjAxYSIgZD0iTTUwLDczIG0tNCwwIGE0LDQgMCAxLDEgOCwwIGE0LDQgMCAxLDEgLTgsMCIgLz48Zz48cGF0aCBmaWxsPSIjMmMyMDFhIiBkPSJNMzUsNjAgYSA2LDYgMCAxIDEgMTIsMCBhIDYsNiAwIDEgMSAtMTIsMCIgLz48cGF0aCBmaWxsPSIjMmMyMDFhIiBkPSJNNTgsNjAgYSA2LDYgMCAxIDEgMTIsMCBhIDYsNiAwIDEgMSAtMTIsMCIgLz48Y2lyY2xlIGN4PSIzOCIgY3k9IjU4IiByPSIxLjUiIGZpbGw9IndoaXRlIiAvPjxjaXJjbGUgY3g9IjYxIiBjeT0iNTgiIHI9IjEuNSIgZmlsbD0id2hpdGUiIC8+PC9nPjxwYXRoIGZpbGw9InVybCgjZG9nRnVyKSIgc3Ryb2tlPSIjNGEzYTJhIiBzdHJva2Utd2lkdGg9IjMiIGQ9Ik0yNSw1MCBDMjAsMzUgMzUsMzUgMzUsMzUgTDQwLDU1IFoiLz48cGF0aCBmaWxsPSIjZjNkMWI3IiBzdHJva2U9IiM0YTNhMmEiIHN0cm9rZS13aWR0aD0iMS41IiBkPSJNMjgsNDggQzI1LDQwIDM1LDQwIDM1LDQwIEwzOCw1MyBaIiAvPjxwYXRoIGZpbGw9InVybCgjZG9nRnVyKSIgc3Ryb2tlPSIjNGEzYTJhIiBzdHJva2Utd2lkdGg9IjMiIGQ9Ik03NSw1MCBDODAsMzUgNjUsMzUgNjUsMzUgTDYwLDU1IFoiLz48cGF0aCBmaWxsPSIjZjNkMWI3IiBzdHJva2U9IiM0YTNhMmEiIHN0cm9rZS13aWR0aD0iMS41IiBkPSJNNzIsNDggQzc1LDQwIDY1LDQwIDY1LDQwIEw2Miw1MyBaIiAvPjwvZz48Zz48cGF0aCBkPSJNMTgsNTggQzE1LDM1IDg1LDM1IDgyLDU4IEEgNDUgNDUgMCAwIDEgMTggNTggWiIgZmlsbD0idXJsKCNoZWxtZXRHcmFkKSIgc3Ryb2tlPSIjM2U0YTJlIiBzdHJva2Utd2lkdGg9IjMuNSIgLz48ZyBjbGlwLXBhdGg9InVybCgjaGVsbWV0TWFzaykiIG9wYWNpdHk9IjAuNSI+PHBhdGggZmlsbD0iIzZCOEUyMyIgZD0iTTI1LDM1IEMzNSwzMCA0MCw0MCA1MCw0MCBTNjAsMzUgNzAsNDIgTDc1LDU1IEwyMCw1NSBaIiAvPjxwYXRoIGZpbGw9IiM4RkJDODkiIGQ9Ik0xNSw0NSBDMjUsNTAgMzAsNTUgNDAsNTUgUzUwLDUwIDYwLDUyIEw2NSwzMCBMMjAsMzAgWiIgLz48cGF0aCBmaWxsPSIjNTU2YjJmIiBkPSJNNTAsMzIgQzY1LDM1IDcwLDQ1IDgwLDQ1IFM5MCw1MCA4NSw2MCBMNzAsNTggTDU1LDQwIFoiIC8+PC9nPjxwYXRoIGQ9Ik0zMCwzOCBRNTAsMzIgNzAsMzgiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIwLjE1IiAvPjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzRiNTgzYSIgc3Ryb2tlLXdpZHRoPSI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIGQ9Ik0xOSw1OCBRMTUsNzAgMjQsNzUiIC8+PHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNGI1ODNhIiBzdHJva2Utd2lkdGg9IjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgZD0iTTgxLDU4IFE4NSw3MCA3Niw3NSIgLz48L2c+PC9nPjwvc3ZnPg==';

export const CROCODILE_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InNoYXBlR3JhZCIgeDE9IjAuNSIgeTE9IjAiIHgyPSIwLjUiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZTBlN2ZmIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjYzdkMmZlIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9Imdsb3dHcmFkTGVmdCIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjAiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0ZjQ2ZTUiIHN0b3Atb3BhY2l0eT0iMC42Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDAwMDAwIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iZ2xvd0dyYWRSaWdodCIgeDE9IjEiIHkxPSIwIiB4Mj0iMCIgeTI9IjAiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0ZjQ2ZTUiIHN0b3Atb3BhY2l0eT0iMC42Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDAwMDAwIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iYmxhY2siLz48cGF0aCBkPSJNLTIwIC0yMCBMIDUwIDAgTCAtMjAgMTIwIFoiIGZpbGw9InVybCgjZ2xvd0dyYWRsZWZ0KSIvPjxwYXRoIGQ9Ik0xMjAgLTIwIEwgNTAgMCBMIDEyMCAxMjAgWiIgZmlsbD0idXJsKCNnbG93R3JhZFJpZ2h0KSIvPjxwb2x5Z29uIHBvaW50cz0iNDIsMjUgNTgsMjUgNTAsNDIiIGZpbGw9InVybCgjc2hhcGVHcmFkKSIvPjxwb2x5Z29uIHBvaW50cz0iMzUsNDggNjUsNDggNzAsNjUgMzAsNjUiIGZpbGw9InVybCgjc2hhcGVHcmFkKSIvPjwvc3ZnPg==';

export const GROUND_CRACK_ICON = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNlZjQ0NDQiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiPjxwYXRoIGQ9Ik01MCA1MCBMIDYwIDQwIEwgNjUgNDUgTCA4MCAyMyIvPjxwYXRoIGQ9Ik01MCA1MCBMIDQwIDM4IEwgMzAgNDIgTCAxNSA0MCBMIDEwIDQ4Ii8+PHBhdGggZD0iTTUwIDUwIEwgNDUgNjAgTCAzNSA2MiBMIDMwIDc1IEwgMzUgOTIiLz48cGF0aCBkPSJNNTAgNTIgTCA2MCA2NSBMIDcwIDYyIEwgODAgNzAgTCA4NSA4MiBMIDc4IDkwIi8+PHBhdGggZD0iTTUwIDUwIEwgMzUgMjUgTCAyOCAxOCIvPjxwYXRoIGQ9Ik01MCA1MCBMIDc4IDUwIEwgOTAgNTgiLz48L2c+PC9zdmc+';

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
};