

import React, { useState, useEffect, useCallback } from 'react';
import GameScreen from './components/GameScreen';
import { Hud } from './components/ui/Hud';
import LevelUpModal from './components/ui/LevelUpModal';
import GameOverScreen from './components/ui/GameOverScreen';
import StartScreen from './components/ui/StartScreen';
import VirtualJoystick from './components/ui/VirtualJoystick';
import LeaderboardScreen from './components/ui/LeaderboardScreen';
import VictoryScreen from './components/ui/VictoryScreen';
import { useGameLoop } from './hooks/useGameLoop';
import { useTouchControls } from './hooks/useTouch';
import { useSettings } from './hooks/useSettings';
import { GameState, Player, Enemy, Projectile, ExperienceGem, GameStatus, WeaponType, Weapon, UpgradeOption, FloatingText, EnemyType, Airdrop, VisualEffect, LaserBeam, ItemDrop, ActiveItem, ActiveCandle, CandleVariant, ItemType, ScoreEntry, CurrentUser, GameObject } from './types';
import { WEAPON_DATA, ENEMY_DATA, LEVEL_THRESHOLDS, GAME_AREA_WIDTH, GAME_AREA_HEIGHT, ITEM_DROP_CHANCE, ITEM_DATA, BOSS_SPAWN_MC, MC_PER_SECOND, STARTING_MC, MC_VOLATILITY_INTERVAL, MC_VOLATILITY_AMOUNT, BOSS_RANGED_ATTACK_COOLDOWN, BOSS_RANGED_ATTACK_SPEED, BOSS_PROJECTILE_WIDTH, BOSS_PROJECTILE_HEIGHT, BOSS_RED_CANDLE_COOLDOWN, BOSS_RED_CANDLE_WARNING_DURATION, BOSS_RED_CANDLE_ATTACK_DURATION, DEV_LOCK_SPAWN_MC, DEV_LOCK_DROP_CHANCE, DEV_LOCK_MESSAGES, BOSS_RED_CANDLE_WIDTH, MAX_CANDLE_DROPS, BOSS_SHOCKWAVE_COOLDOWN, BOSS_SHOCKWAVE_DURATION, BOSS_SHOCKWAVE_RADIUS } from './constants';
import { getUpgradeOptions } from './utils/upgradeHelper';
import { generateBatchDescriptions } from './services/geminiService';
import { getLeaderboard, addScore } from './services/leaderboardService';

const chooseCandleVariant = (): CandleVariant => {
    const rand = Math.random() * 100;

    if (rand < 85) { // 85% chance
        return 'West';
    } else if (rand < 95) { // 10% chance (85 + 10)
        return '奶牛candle';
    } else { // 5% chance
        return 'Gake';
    }
};

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(() => {
        const initialPlayer: Player = {
            id: 'player',
            x: GAME_AREA_WIDTH / 2,
            y: GAME_AREA_HEIGHT / 2,
            width: 40,
            height: 40,
            health: 100,
            maxHealth: 100,
            level: 1,
            xp: 0,
            xpToNextLevel: LEVEL_THRESHOLDS[1],
            gold: 0,
            weapons: [{ type: WeaponType.ShillTweet, level: 1, cooldown: WEAPON_DATA[WeaponType.ShillTweet].cooldown, timer: 0 }],
            lastMoveDx: 0,
            lastMoveDy: -1,
        };
        return {
            status: GameStatus.NotStarted,
            player: initialPlayer,
            enemies: [],
            projectiles: [],
            gems: [],
            floatingTexts: [],
            airdrops: [],
            visualEffects: [],
            itemDrops: [],
            activeItems: [],
            activeLaser: null,
            gameTime: 0,
            marketCap: STARTING_MC,
            maxBalanceAchieved: initialPlayer.health,
            kills: 0,
            camera: { x: initialPlayer.x - window.innerWidth / 2, y: initialPlayer.y - window.innerHeight / 2 },
            orbitAngle: 0,
            bossState: null,
            bossHasBeenDefeated: false,
            currentUser: null,
            isNewHighScore: false,
            lastSkillUsed: null,
            specialEventMessage: null,
            isHardMode: false,
            bonkMode: null,
            airdropBonkEvent: null,
            isPaperHandsUpgraded: false,
            upcomingRedCandleAttack: null,
            devLockEffect: null,
            enemyScalingLevel: 0,
        };
    });

    const [upgradeOptions, setUpgradeOptions] = useState<UpgradeOption[]>([]);
    const [descriptions, setDescriptions] = useState<Record<string, string>>({});
    const [loadingDescriptions, setLoadingDescriptions] = useState(false);
    const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);
    const [settings, updateSettings] = useSettings();
    const [pausedFromStatus, setPausedFromStatus] = useState<GameStatus | null>(null);

    const gameIsRunning = gameState.status === GameStatus.Playing || gameState.status === GameStatus.BossFight;
    const { isTouch } = useTouchControls(gameIsRunning);

    // Effect for handling game pause/resume on tab visibility/focus change
    useEffect(() => {
        const pauseGame = () => {
            setGameState(prev => {
                if (prev.status === GameStatus.Playing || prev.status === GameStatus.BossFight) {
                    setPausedFromStatus(prev.status);
                    return { ...prev, status: GameStatus.Paused };
                }
                return prev;
            });
        };

        const resumeGame = () => {
            setGameState(prev => {
                if (prev.status === GameStatus.Paused && pausedFromStatus) {
                    const statusToResume = pausedFromStatus;
                    setPausedFromStatus(null);
                    return { ...prev, status: statusToResume };
                }
                return prev;
            });
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                pauseGame();
            } else {
                resumeGame();
            }
        };

        window.addEventListener('blur', pauseGame);
        window.addEventListener('focus', resumeGame);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('blur', pauseGame);
            window.removeEventListener('focus', resumeGame);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [pausedFromStatus]);

    // Effect for handling keyboard input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            (window as any).pressedKeys = (window as any).pressedKeys || {};
            (window as any).pressedKeys[e.key] = true;
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            (window as any).pressedKeys = (window as any).pressedKeys || {};
            (window as any).pressedKeys[e.key] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        (window as any).pressedKeys = {};

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);


    const handleStartGame = (user: CurrentUser | null) => {
        const initialPlayer: Player = {
            id: 'player',
            x: GAME_AREA_WIDTH / 2,
            y: GAME_AREA_HEIGHT / 2,
            width: 40,
            height: 40,
            health: 100,
            maxHealth: 100,
            level: 1,
            xp: 0,
            xpToNextLevel: LEVEL_THRESHOLDS[1],
            gold: 0,
            weapons: [{ type: WeaponType.ShillTweet, level: 1, cooldown: WEAPON_DATA[WeaponType.ShillTweet].cooldown, timer: 0 }],
            lastMoveDx: 0,
            lastMoveDy: -1,
            avatarUrl: user?.avatarUrl,
        };

        const startingCandle: ItemDrop = {
            id: `item_start_gake_${Date.now()}`,
            x: initialPlayer.x + 80,
            y: initialPlayer.y,
            type: ItemType.Candle,
            variant: 'Gake',
        };
        
        const startingDevLock: ItemDrop = {
            id: `item_start_devlock_${Date.now()}`,
            x: initialPlayer.x - 80,
            y: initialPlayer.y,
            type: ItemType.DevLock,
        };

        setGameState({
            status: GameStatus.Playing,
            player: initialPlayer,
            enemies: [],
            projectiles: [],
            gems: [],
            floatingTexts: [],
            airdrops: [],
            visualEffects: [],
            itemDrops: [startingCandle, startingDevLock],
            activeItems: [],
            activeLaser: null,
            gameTime: 0,
            marketCap: STARTING_MC,
            maxBalanceAchieved: initialPlayer.health,
            kills: 0,
            camera: { x: initialPlayer.x - window.innerWidth / 2, y: initialPlayer.y - window.innerHeight / 2 },
            orbitAngle: 0,
            bossState: null,
            bossHasBeenDefeated: false,
            currentUser: user,
            isNewHighScore: false,
            lastSkillUsed: null,
            specialEventMessage: null,
            isHardMode: false,
            bonkMode: null,
            airdropBonkEvent: null,
            isPaperHandsUpgraded: false,
            upcomingRedCandleAttack: null,
            devLockEffect: null,
            enemyScalingLevel: 0,
        });
    };

    const handleShowLeaderboard = async () => {
        setLeaderboardLoading(true);
        setGameState(prev => ({ ...prev, status: GameStatus.Leaderboard }));
        const scores = await getLeaderboard();
        setLeaderboard(scores);
        setLeaderboardLoading(false);
    };

    const handleBackToMenu = () => {
        setGameState(prev => ({ ...prev, status: GameStatus.NotStarted, isNewHighScore: false }));
    };

    const handleLevelUp = useCallback(() => {
        setGameState(prev => {
            if (prev.status !== GameStatus.Playing && prev.status !== GameStatus.BossFight) return prev;

            const options = getUpgradeOptions(prev.player.weapons);
            setUpgradeOptions(options);
            setLoadingDescriptions(true);
            
            generateBatchDescriptions(options).then(newDescriptions => {
                setDescriptions(prevDesc => ({ ...prevDesc, ...newDescriptions }));
                setLoadingDescriptions(false);
            }).catch(error => {
                console.error("Failed to generate batch descriptions:", error);
                setLoadingDescriptions(false);
            });
            
            return { ...prev, status: GameStatus.LevelUp };
        });
    }, []);

    const handleUpgradeSelected = (option: UpgradeOption) => {
        setGameState(prev => {
            const newWeapons = [...prev.player.weapons];
            const existingWeaponIndex = newWeapons.findIndex(w => w.type === option.type);

            if (existingWeaponIndex !== -1) {
                newWeapons[existingWeaponIndex] = { ...newWeapons[existingWeaponIndex], level: option.level };
            } else {
                newWeapons.push({ type: option.type, level: 1, cooldown: WEAPON_DATA[option.type].cooldown, timer: 0 });
            }
            
            const newStatus = prev.bossState ? GameStatus.BossFight : GameStatus.Playing;

            return {
                ...prev,
                status: newStatus,
                player: {
                    ...prev.player,
                    weapons: newWeapons,
                }
            };
        });
    };

    const gameTick = useCallback((delta: number) => {
        setGameState(prev => {
            if (prev.status !== GameStatus.Playing && prev.status !== GameStatus.BossFight) {
                return prev;
            }

            const checkCollision = (obj1: GameObject, obj2: GameObject) => {
                // AABB check using center coordinates and width/height
                const obj1Left = obj1.x - obj1.width / 2;
                const obj1Right = obj1.x + obj1.width / 2;
                const obj1Top = obj1.y - obj1.height / 2;
                const obj1Bottom = obj1.y + obj1.height / 2;

                const obj2Left = obj2.x - obj2.width / 2;
                const obj2Right = obj2.x + obj2.width / 2;
                const obj2Top = obj2.y - obj2.height / 2;
                const obj2Bottom = obj2.y + obj2.height / 2;

                return obj1Left < obj2Right && obj1Right > obj2Left && obj1Top < obj2Bottom && obj1Bottom > obj2Top;
            };
            
            // Create mutable copies for this tick
            let {
                player, enemies, projectiles, gems, floatingTexts, airdrops, visualEffects, itemDrops, activeItems,
                camera, bossState, bonkMode, devLockEffect, airdropBonkEvent, upcoming