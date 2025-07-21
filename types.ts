



export enum GameStatus {
    NotStarted,
    Playing,
    Paused,
    LevelUp,
    GameOver,
    BossFight,
    Leaderboard,
}

export enum WeaponType {
    ShillTweet = 'Shill Tweet',
    HODLerArea = 'HODLer Area',
    TradingBot = 'Trading Bot',
    LaserEyes = 'Laser Eyes',
    Airdrop = 'Airdrop',
}

export enum EnemyType {
    FUD,
    PaperHands,
    RivalWhale,
    MigratingBoss,
}

export enum ItemType {
    Candle = 'Candle',
}

export type CandleVariant = 'Gake' | 'West' | '奶牛candle';

export interface GameObject {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Weapon {
    type: WeaponType;
    level: number;
    cooldown: number;
    timer: number;
}

export interface Player extends GameObject {
    health: number;
    maxHealth: number;
    level: number;
    xp: number;
    xpToNextLevel: number;
    gold: number;
    weapons: Weapon[];
    lastMoveDx: number;
    lastMoveDy: number;
    avatarUrl?: string;
}

export interface Enemy extends GameObject {
    type: EnemyType;
    health: number;
    speed: number;
    damage: number;
    xpValue: number;
    isBoss?: boolean;
    lastHitBy: { [weaponType: string]: number };
    knockback?: {
        dx: number;
        dy: number;
        duration: number;
        speed: number;
    };
}

export interface Projectile extends GameObject {
    damage: number;
    speed: number;
    owner: 'player' | 'enemy';
    isBossProjectile?: boolean;
    targetId?: string; // For homing
    dx?: number; // For straight line movement
    dy?: number; // For straight line movement
}

export interface ExperienceGem {
    id: string;
    x: number;
    y: number;
    value: number;
}

export interface FloatingText {
    id: string;
    x: number;
    y: number;
    text: string;
    color: string;
    life: number;
}

export interface Airdrop {
    id: string;
    x: number;
    y: number;
    startY: number;
    fallTimer: number;
    totalFallTime: number;
    radius: number;
    damage: number;
}

export interface VisualEffect {
    id: string;
    x: number;
    y: number;
    type: 'explosion' | 'airdrop_target' | 'shockwave';
    radius: number;
    life: number;
    totalLife: number;
    color: string;
}

export interface LaserBeam {
    targetId: string;
    width: number;
    damage: number; // Damage per second
    level: number;
}

export interface ItemDrop {
    id:string;
    x: number;
    y: number;
    type: ItemType;
}

export interface ActiveCandle {
    id: string;
    type: ItemType.Candle;
    variant: CandleVariant;
    life: number;
    angle: number;
    length: number;
    width: number;
    hitEnemyIds: string[];
    rotationSpeed: number;
}

export type ActiveItem = ActiveCandle;

export interface CurrentUser {
    username: string;
    avatarUrl: string;
}

export interface CameraState {
    x: number; 
    y: number;
    shake?: {
        duration: number;
        intensity: number;
    };
}

export interface Settings {
    screenShake: boolean;
    floatingText: boolean;
}

export interface GameState {
    status: GameStatus;
    player: Player;
    enemies: Enemy[];
    projectiles: Projectile[];
    gems: ExperienceGem[];
    floatingTexts: FloatingText[];
    airdrops: Airdrop[];
    visualEffects: VisualEffect[];
    itemDrops: ItemDrop[];
    activeItems: ActiveItem[];
    activeLaser: LaserBeam | null;
    gameTime: number;
    marketCap: number;
    maxBalanceAchieved: number;
    kills: number;
    camera: CameraState;
    orbitAngle: number;
    bossState: {
        shockwaveTimer: number;
        spawnTimer: number;
        marketCapVolatilityTimer: number;
        rangedAttackTimer: number;
    } | null;
    bossHasBeenDefeated: boolean;
    currentUser: CurrentUser | null;
    isNewHighScore: boolean;
    lastSkillUsed: { id: string, name: string; life: number } | null;
}

export interface UpgradeOption {
    type: WeaponType;
    name: string;
    level: number;
    isNew: boolean;
}

export interface ScoreEntry {
    username: string;
    avatarUrl?: string; // Optional for backward compatibility
    score: number;
    maxBalance: number;
    date: string;
}

export interface WeaponData {
    name: string;
    damage: number;
    speed: number;
    cooldown: number;
    width: number;
    height: number;
    radius?: number;
    maxLevel: number;
    hitCooldown?: number;
    duration?: number; // For channeled/active weapons like Laser Eyes
    blockChance?: number; // Kept for type safety, but unused
}

export interface ItemVariantData {
    name: string;
    duration: number;
    length: number;
    width: number;
    rotations?: number;
}