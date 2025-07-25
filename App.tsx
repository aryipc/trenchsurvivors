import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameScreen from './components/GameScreen';
import { Hud } from './components/ui/Hud';
import LevelUpModal from './components/ui/LevelUpModal';
import GameOverScreen from './components/ui/GameOverScreen';
import StartScreen from './components/ui/StartScreen';
import VirtualJoystick from './components/ui/VirtualJoystick';
import SkillButton from './components/ui/SkillButton';
import LeaderboardScreen from './components/ui/LeaderboardScreen';
import { useGameLoop } from './hooks/useGameLoop';
import { useTouchControls } from './hooks/useTouch';
import { useSettings } from './hooks/useSettings';
import { GameState, Player, Enemy, Projectile, ExperienceGem, GameStatus, WeaponType, Weapon, UpgradeOption, FloatingText, EnemyType, Airdrop, VisualEffect, LaserBeam, ItemDrop, ActiveItem, ActiveCandle, CandleVariant, ItemType, ScoreEntry, CurrentUser, Settings } from './types';
import { WEAPON_DATA, ENEMY_DATA, LEVEL_THRESHOLDS, GAME_AREA_WIDTH, GAME_AREA_HEIGHT, ITEM_DROP_CHANCE, ITEM_DATA, BOSS_SPAWN_MC, MC_PER_SECOND, STARTING_MC, MC_VOLATILITY_INTERVAL, MC_VOLATILITY_AMOUNT, BOSS_RANGED_ATTACK_COOLDOWN, BOSS_RANGED_ATTACK_DAMAGE, BOSS_RANGED_ATTACK_SPEED, BOSS_PROJECTILE_WIDTH, BOSS_PROJECTILE_HEIGHT, BOSS_RED_CANDLE_COOLDOWN, BOSS_RED_CANDLE_WARNING_DURATION, BOSS_RED_CANDLE_WIDTH, BOSS_RED_CANDLE_ATTACK_DURATION, BOSS_RED_CANDLE_DAMAGE_PER_SEC } from './constants';
import { getUpgradeOptions } from './utils/upgradeHelper';
import { generateBatchDescriptions } from './services/geminiService';
import { getLeaderboard, addScore } from './services/leaderboardService';
import { runGameTick } from './logic/gameLogic';


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
            devLockMode: null,
            airdropBonkEvent: null,
            isPaperHandsUpgraded: false,
            upcomingRedCandleAttack: null,
            devLockHasDropped: false,
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
                // Only pause if the game is actively running and not already paused by other means (like level up)
                if (prev.status === GameStatus.Playing || prev.status === GameStatus.BossFight) {
                    setPausedFromStatus(prev.status);
                    return { ...prev, status: GameStatus.Paused };
                }
                return prev;
            });
        };

        const resumeGame = () => {
            setGameState(prev => {
                // Only resume if it was paused by this specific blur/visibility logic
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
                // On some systems, focus fires before visibilitychange.
                // Resuming here ensures we catch the user coming back to the tab.
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

        setGameState({
            status: GameStatus.Playing,
            player: initialPlayer,
            enemies: [],
            projectiles: [],
            gems: [],
            floatingTexts: [],
            airdrops: [],
            visualEffects: [],
            itemDrops: [startingCandle],
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
            devLockMode: null,
            airdropBonkEvent: null,
            isPaperHandsUpgraded: false,
            upcomingRedCandleAttack: null,
            devLockHasDropped: false,
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
            // Prevent leveling up if not in a playable state or if already leveling up.
            if (prev.status !== GameStatus.Playing && prev.status !== GameStatus.BossFight) return prev;

            const options = getUpgradeOptions(prev.player.weapons);
            setUpgradeOptions(options);
            setLoadingDescriptions(true);
            
            const fetchDescriptions = async () => {
                try {
                    const newDescriptions = await generateBatchDescriptions(options);
                    setDescriptions(prevDesc => ({ ...prevDesc, ...newDescriptions }));
                } catch (error) {
                    console.error("Failed to generate batch descriptions:", error);
                } finally {
                    setLoadingDescriptions(false);
                }
            };

            fetchDescriptions();
            
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
            // Delegate all game logic to the optimized runGameTick function.
            // This avoids the expensive JSON.parse(JSON.stringify()) and keeps the component clean.
            return runGameTick(prev, delta, isTouch, settings);
        });
    }, [isTouch, settings]); 

    useGameLoop(gameTick, gameState.status === GameStatus.Playing || gameState.status === GameStatus.BossFight);

    // This effect safely triggers the level-up modal AFTER the game state has been updated.
    const prevLevelRef = useRef(gameState.player.level);
    useEffect(() => {
        if (gameState.player.level > prevLevelRef.current) {
            handleLevelUp();
        }
        prevLevelRef.current = gameState.player.level;
    }, [gameState.player.level, handleLevelUp]);

    useEffect(() => {
        // Post score to leaderboard when game is over
        if (gameState.status === GameStatus.GameOver && gameState.currentUser && !gameState.isNewHighScore) {
            const postScore = async () => {
                const newHighScore = await addScore(gameState.currentUser!, gameState.marketCap, gameState.maxBalanceAchieved);
                // Only update state if the component is still mounted and the game is over
                setGameState(prev => {
                    if (prev.status === GameStatus.GameOver) {
                        return { ...prev, isNewHighScore: newHighScore };
                    }
                    return prev;
                });
            };
            postScore();
        }
    }, [gameState.status, gameState.marketCap, gameState.currentUser, gameState.isNewHighScore, gameState.maxBalanceAchieved]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { (window as any).pressedKeys = (window as any).pressedKeys || {}; if ((window as any).pressedKeys[e.key] !== true) (window as any).pressedKeys[e.key] = true; };
        const handleKeyUp = (e: KeyboardEvent) => { (window as any).pressedKeys = (window as any).pressedKeys || {}; (window as any).pressedKeys[e.key] = false; };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
    }, []);

    const renderGameContent = () => {
        switch (gameState.status) {
            case GameStatus.NotStarted:
                return <StartScreen 
                            onStart={handleStartGame} 
                            onShowLeaderboard={handleShowLeaderboard}
                            settings={settings}
                            onUpdateSettings={updateSettings}
                        />;
            case GameStatus.Leaderboard:
                return <LeaderboardScreen scores={leaderboard} onBack={handleBackToMenu} loading={leaderboardLoading} />;
            case GameStatus.GameOver:
                return <GameOverScreen 
                            score={gameState.kills} 
                            marketCap={gameState.marketCap} 
                            maxBalance={gameState.maxBalanceAchieved}
                            onRestart={() => handleStartGame(gameState.currentUser)}
                            onBackToHome={handleBackToMenu}
                            isNewHighScore={gameState.isNewHighScore}
                            username={gameState.currentUser}
                        />;
            case GameStatus.Playing:
            case GameStatus.BossFight:
            case GameStatus.LevelUp:
            case GameStatus.Paused:
                return (
                    <>
                        <Hud 
                            player={gameState.player} 
                            marketCap={gameState.marketCap} 
                            kills={gameState.kills} 
                            status={gameState.status} 
                            isTouch={isTouch}
                            lastSkillUsed={gameState.lastSkillUsed}
                            specialEventMessage={gameState.specialEventMessage}
                            isBonked={gameState.bonkMode !== null}
                            bonkMode={gameState.bonkMode}
                            devLockMode={gameState.devLockMode}
                        />
                        <GameScreen gameState={gameState} isTouch={isTouch} />
                       
                        {gameState.status === GameStatus.LevelUp && (
                            <LevelUpModal
                                options={upgradeOptions}
                                onSelect={handleUpgradeSelected}
                                descriptions={descriptions}
                                loading={loadingDescriptions}
                            />
                        )}

                        {gameState.status === GameStatus.Paused && (
                            <div className="absolute inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-sm">
                                <h2 className="text-7xl font-cinzel text-yellow-300 text-shadow animate-pulse">
                                    PAUSED
                                </h2>
                            </div>
                        )}
                    </>
                );
        }
    };

    return (
        <div 
            className="relative w-screen h-screen overflow-hidden bg-gray-800 text-white select-none"
            style={{ touchAction: 'none' }}
        >
            {renderGameContent()}
            {isTouch && gameIsRunning && (
                <VirtualJoystick />
            )}
        </div>
    );
};

export default App;
