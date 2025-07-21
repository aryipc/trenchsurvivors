







import React, { useState, useEffect, useCallback } from 'react';
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
            airdropBonkEvent: null,
            isPaperHandsUpgraded: false,
            upcomingRedCandleAttack: null,
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

    const handleLevelUp = useCallback((isFromDebugButton: boolean = false) => {
        setGameState(prev => {
            if (prev.status !== GameStatus.Playing && prev.status !== GameStatus.BossFight) return prev; // Prevent multiple level-ups

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
            if (prev.status !== GameStatus.Playing && prev.status !== GameStatus.BossFight) return prev;

            let { player, enemies, projectiles, gems, floatingTexts, airdrops, visualEffects, itemDrops, activeItems, gameTime, marketCap, kills, orbitAngle, activeLaser, bossState, bossHasBeenDefeated, camera, lastSkillUsed, specialEventMessage, isHardMode, bonkMode, airdropBonkEvent, isPaperHandsUpgraded, upcomingRedCandleAttack } = JSON.parse(JSON.stringify(prev));
            let currentStatus: GameStatus = prev.status;
            
            gameTime += delta;

            if (lastSkillUsed) {
                lastSkillUsed.life -= delta;
                if (lastSkillUsed.life <= 0) {
                    lastSkillUsed = null;
                }
            }
            if (specialEventMessage) {
                specialEventMessage.life -= delta;
                if (specialEventMessage.life <= 0) {
                    specialEventMessage = null;
                }
            }
            if (bonkMode) {
                bonkMode.timer -= delta;
                if (bonkMode.timer <= 0) {
                    bonkMode = null;
                }
            }
             // --- CAMERA SHAKE ---
            if (camera.shake && camera.shake.duration > 0) {
                camera.shake.duration -= delta;
            } else {
                camera.shake = undefined;
            }
            
            const zoom = isTouch ? 0.75 : 1.0;

            // --- FLOATING TEXT ---
            floatingTexts = floatingTexts
                .map((ft: FloatingText) => ({ ...ft, life: ft.life - delta }))
                .filter((ft: FloatingText) => ft.life > 0);

            const addFloatingText = (text: string, x: number, y: number, color: string = 'white', life: number = 1.0) => {
                if (!settings.floatingText) return;
                floatingTexts.push({
                    id: `ft_${Date.now()}_${Math.random()}`,
                    text,
                    x,
                    y,
                    color,
                    life,
                });
            };
            
            const touchState = (window as any).touchState || { joystick: { x: 0, y: 0 } };
            const keys: Record<string, boolean> = (window as any).pressedKeys || {};

            // --- MOVEMENT ---
            const speed = 250 * delta;
            let moveX = 0;
            let moveY = 0;

            if (touchState.joystick.x !== 0 || touchState.joystick.y !== 0) {
                moveX = touchState.joystick.x;
                moveY = touchState.joystick.y;
            } else {
                if (keys['w'] || keys['ArrowUp']) moveY -= 1;
                if (keys['s'] || keys['ArrowDown']) moveY += 1;
                if (keys['a'] || keys['ArrowLeft']) moveX -= 1;
                if (keys['d'] || keys['ArrowRight']) moveX += 1;
            }

            if (moveX !== 0 || moveY !== 0) {
                const magnitude = Math.sqrt(moveX * moveX + moveY * moveY);
                const moveDx = moveX / magnitude;
                const moveDy = moveY / magnitude;
                player.x += moveDx * speed;
                player.y += moveDy * speed;
                player.lastMoveDx = moveDx;
                player.lastMoveDy = moveDy;
            }
            
            player.x = Math.max(player.width / 2, Math.min(GAME_AREA_WIDTH - player.width / 2, player.x));
            player.y = Math.max(player.height / 2, Math.min(GAME_AREA_HEIGHT - player.height / 2, player.y));
            
            // --- CAMERA SMOOTHING ---
            const cameraTargetX = player.x - (window.innerWidth / zoom) / 2;
            const cameraTargetY = player.y - (window.innerHeight / zoom) / 2;
            const smoothFactor = 5; // Higher value means faster, more rigid camera. Lower is smoother.
            const cameraLerpFactor = 1 - Math.exp(-smoothFactor * delta);
            camera.x = camera.x * (1 - cameraLerpFactor) + cameraTargetX * cameraLerpFactor;
            camera.y = camera.y * (1 - cameraLerpFactor) + cameraTargetY * cameraLerpFactor;

            
            // --- MC & BOSS LOGIC ---
            if (currentStatus === GameStatus.Playing) {
                 marketCap += MC_PER_SECOND * delta;
            }

            // --- HARD MODE & ENEMY UPGRADE TRIGGERS ---
            if (!isHardMode && marketCap >= 100000) {
                isHardMode = true;
                specialEventMessage = { id: `hardmode_${Date.now()}`, text: 'MARKET PANIC!', life: 4.0 };
                addFloatingText('FUD has mutated!', player.x, player.y - 40, '#ef4444', 3.0);
            }

            if (!isPaperHandsUpgraded && marketCap >= 120000) {
                isPaperHandsUpgraded = true;
                addFloatingText('Paper Hands are getting stronger!', player.x, player.y - 60, '#f87171', 3.0);
            }

            if (marketCap >= BOSS_SPAWN_MC && prev.status === GameStatus.Playing && !prev.bossHasBeenDefeated) {
                currentStatus = GameStatus.BossFight;
                enemies = []; // Clear existing enemies
                const bossData = ENEMY_DATA[EnemyType.MigratingBoss];
                enemies.push({ id: 'boss_cex', type: EnemyType.MigratingBoss, ...bossData, x: player.x, y: player.y - 800, lastHitBy: {} });
                bossState = { shockwaveTimer: 8, spawnTimer: 5, marketCapVolatilityTimer: MC_VOLATILITY_INTERVAL, rangedAttackTimer: BOSS_RANGED_ATTACK_COOLDOWN, redCandleAttackTimer: BOSS_RED_CANDLE_COOLDOWN / 2 };
                addFloatingText('WARNING: MIGRATING BOSS INBOUND', player.x, player.y - 100, '#ef4444');
                 if (settings.screenShake) camera.shake = { duration: 2.0, intensity: 10 };
            }

            if(currentStatus === GameStatus.BossFight && bossState) {
                bossState.shockwaveTimer -= delta;
                bossState.spawnTimer -= delta;
                bossState.marketCapVolatilityTimer -= delta;
                bossState.rangedAttackTimer -= delta;
                bossState.redCandleAttackTimer -= delta;
                const boss = enemies.find(e => e.isBoss);

                if (bossState.marketCapVolatilityTimer <= 0) {
                    bossState.marketCapVolatilityTimer = MC_VOLATILITY_INTERVAL;
                    const dropAmount = Math.random() * MC_VOLATILITY_AMOUNT;
                    marketCap -= dropAmount;
                    addFloatingText(`-$${Math.floor(dropAmount)}`, player.x, player.y - 60, '#ef4444');
                }
                 
                if (boss && bossState.rangedAttackTimer <= 0) {
                    bossState.rangedAttackTimer = BOSS_RANGED_ATTACK_COOLDOWN;
                    const dx = player.x - boss.x;
                    const dy = player.y - boss.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    projectiles.push({
                        id: `b_proj_${Date.now()}`,
                        x: boss.x,
                        y: boss.y,
                        width: BOSS_PROJECTILE_WIDTH,
                        height: BOSS_PROJECTILE_HEIGHT,
                        damage: BOSS_RANGED_ATTACK_DAMAGE,
                        speed: BOSS_RANGED_ATTACK_SPEED,
                        owner: 'enemy',
                        isBossProjectile: true,
                        dx: dx / dist,
                        dy: dy / dist,
                    });
                }

                if (boss && bossState.redCandleAttackTimer <= 0) {
                    bossState.redCandleAttackTimer = BOSS_RED_CANDLE_COOLDOWN;
                    const isVertical = Math.random() < 0.5;
                    const position = isVertical ? player.x : player.y;

                    const warningId = `red_candle_warn_${Date.now()}`;
                    visualEffects.push({
                        id: warningId,
                        type: 'red_candle_warning',
                        x: isVertical ? position : 0,
                        y: isVertical ? 0 : position,
                        isVertical: isVertical,
                        radius: BOSS_RED_CANDLE_WIDTH,
                        life: BOSS_RED_CANDLE_WARNING_DURATION,
                        totalLife: BOSS_RED_CANDLE_WARNING_DURATION,
                        color: '#ef4444'
                    });
                    
                    upcomingRedCandleAttack = {
                        id: `red_candle_atk_${Date.now()}`,
                        isVertical: isVertical,
                        position: position,
                        triggerTime: gameTime + BOSS_RED_CANDLE_WARNING_DURATION
                    };
                }

                if (boss && bossState.shockwaveTimer <= 0) {
                    bossState.shockwaveTimer = 8;
                    visualEffects.push({
                        id: `vfx_shockwave_${Date.now()}`,
                        x: boss.x,
                        y: boss.y,
                        type: 'shockwave',
                        radius: 800, // Max radius
                        life: 3.0,
                        totalLife: 3.0,
                        color: '#ef4444'
                     });
                     if (settings.screenShake) camera.shake = { duration: 0.5, intensity: 15 };
                }
                if (boss && bossState.spawnTimer <= 0) {
                    bossState.spawnTimer = 5;
                    for (let i = 0; i < 2; i++) {
                         const enemyData = ENEMY_DATA[EnemyType.FUD];
                         const angle = Math.random() * 2 * Math.PI;
                         const spawnDist = 100;
                         const x = boss.x + Math.cos(angle) * spawnDist;
                         const y = boss.y + Math.sin(angle) * spawnDist;
                         enemies.push({ id: `enemy_${Date.now()}_${Math.random()}`, type: EnemyType.FUD, ...enemyData, x, y, lastHitBy: {} });
                    }
                }
            }
            
            // --- ENEMY SPAWNING (only in Playing status) ---
            if (currentStatus === GameStatus.Playing) {
                const spawnRate = Math.max(0.1, 1 - gameTime / 180);
                if (Math.random() < delta / spawnRate && enemies.length < 100) {
                    const spawnPool: EnemyType[] = [EnemyType.FUD];
                    const spawnWeights = [0.7];
        
                    if (gameTime > 30) { spawnPool.push(EnemyType.PaperHands); spawnWeights.push(0.25); }
                    if (gameTime > 60) { spawnPool.push(EnemyType.RivalWhale); spawnWeights.push(0.05); }
                    
                    const totalWeight = spawnWeights.reduce((a, b) => a + b, 0);
                    const random = Math.random() * totalWeight;
                    let weightSum = 0;
                    let enemyTypeToSpawn = spawnPool[0];

                    for (let i = 0; i < spawnPool.length; i++) {
                        weightSum += spawnWeights[i];
                        if (random <= weightSum) { enemyTypeToSpawn = spawnPool[i]; break; }
                    }

                    const side = Math.floor(Math.random() * 4);
                    let x, y;
                    const spawnOffset = 50;
                    const viewRect = { left: prev.camera.x, right: prev.camera.x + window.innerWidth, top: prev.camera.y, bottom: prev.camera.y + window.innerHeight };
                    
                    switch (side) {
                        case 0: x = viewRect.left + Math.random() * window.innerWidth; y = viewRect.top - spawnOffset; break;
                        case 1: x = viewRect.right + spawnOffset; y = viewRect.top + Math.random() * window.innerHeight; break;
                        case 2: x = viewRect.left + Math.random() * window.innerWidth; y = viewRect.bottom + spawnOffset; break;
                        default: x = viewRect.left - spawnOffset; y = viewRect.top + Math.random() * window.innerHeight; break;
                    }
                    
                    const enemyData = ENEMY_DATA[enemyTypeToSpawn];
                    let finalEnemyData = { ...enemyData };
                    let enemyLevel: number | undefined = undefined;
            
                    if (enemyTypeToSpawn === EnemyType.FUD && isHardMode) {
                        const level2Data = enemyData.levelData?.[2];
                        if (level2Data) {
                            finalEnemyData = { ...finalEnemyData, ...level2Data };
                            enemyLevel = 2;
                        }
                    }
                    
                    if (enemyTypeToSpawn === EnemyType.PaperHands && isPaperHandsUpgraded) {
                        const level2Data = enemyData.levelData?.[2];
                        if (level2Data) {
                            finalEnemyData = { ...finalEnemyData, ...level2Data };
                            enemyLevel = 2;
                        }
                    }

                    enemies.push({ 
                        id: `enemy_${Date.now()}_${Math.random()}`, 
                        type: enemyTypeToSpawn, 
                        ...finalEnemyData, 
                        x, y, 
                        lastHitBy: {},
                        level: enemyLevel
                    });
                }
            }

            // --- AIRDROP BONK EVENT ---
            if (airdropBonkEvent) {
                airdropBonkEvent.timer -= delta;
                airdropBonkEvent.dropCooldown -= delta;

                if (airdropBonkEvent.dropCooldown <= 0 && airdropBonkEvent.dropsLeft > 0) {
                    // Spawn a random airdrop around the player
                    const spawnRadius = (window.innerWidth / zoom) / 2;
                    const angle = Math.random() * 2 * Math.PI;
                    const dist = Math.random() * spawnRadius;
                    const x = player.x + Math.cos(angle) * dist;
                    const y = player.y + Math.sin(angle) * dist;

                    const weaponData = WEAPON_DATA[WeaponType.Airdrop];
                    const effectiveLevel = weaponData.maxLevel + 1; // Bonked level
                    const damage = weaponData.damage + (effectiveLevel - 1) * 10;
                    const radius = (weaponData.radius || 120) + (effectiveLevel - 1) * 5;
                    const airdropId = `airdrop_bonk_${Date.now()}_${Math.random()}`;
                    airdrops.push({ id: airdropId, x, y, startY: y - 500, fallTimer: 2.0, totalFallTime: 2.0, radius, damage });
                    visualEffects.push({ id: `vfx_target_${airdropId}`, x, y, type: 'airdrop_target', radius: radius, life: 2.0, totalLife: 2.0, color: '#FF8C00' });
                    
                    airdropBonkEvent.dropsLeft--;
                    airdropBonkEvent.dropCooldown = 0.5; // 10 drops in 5s
                }

                if (airdropBonkEvent.timer <= 0 || airdropBonkEvent.dropsLeft <= 0) {
                    airdropBonkEvent = null; // Event ends
                }
            }

            // --- RED CANDLE ATTACK ---
            if (upcomingRedCandleAttack && gameTime >= upcomingRedCandleAttack.triggerTime) {
                visualEffects.push({
                    id: upcomingRedCandleAttack.id,
                    type: 'red_candle_attack',
                    x: upcomingRedCandleAttack.isVertical ? upcomingRedCandleAttack.position : 0,
                    y: upcomingRedCandleAttack.isVertical ? 0 : upcomingRedCandleAttack.position,
                    isVertical: upcomingRedCandleAttack.isVertical,
                    radius: BOSS_RED_CANDLE_WIDTH,
                    life: BOSS_RED_CANDLE_ATTACK_DURATION,
                    totalLife: BOSS_RED_CANDLE_ATTACK_DURATION,
                    color: '#ff1111'
                });
                if (settings.screenShake) camera.shake = { duration: 0.5, intensity: 10 };
                upcomingRedCandleAttack = null;
            }


            // --- WEAPON FIRING ---
            activeLaser = null;
            player.weapons.forEach((weapon: Weapon) => {
                weapon.timer += delta;
                const weaponData = WEAPON_DATA[weapon.type];
                const isBonked = bonkMode !== null;
                let effectiveLevel = weapon.level;
                if (isBonked && weapon.type !== WeaponType.TradingBot) { // Trading bot has special bonk logic
                    effectiveLevel = weaponData.maxLevel + 1;
                }

                if (weapon.type === WeaponType.LaserEyes) {
                    if (!isBonked) { // Only apply cooldown logic if not in BONK mode
                        if (weapon.timer > weaponData.cooldown) weapon.timer = 0;
                    }

                    // Fire if BONK mode is active OR if within the normal duration
                    if ((isBonked || weapon.timer < (weaponData.duration || 2)) && enemies.length > 0) {
                        let nearestEnemy: Enemy | null = null;
                        let minDistance = Infinity;
                        enemies.forEach((enemy: Enemy) => {
                            const dx = enemy.x - player.x;
                            const dy = enemy.y - player.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < minDistance) { minDistance = dist; nearestEnemy = enemy; }
                        });

                        if (nearestEnemy) {
                            const laserWidth = weaponData.width + (effectiveLevel - 1) * 5;
                            const laserDamage = weaponData.damage + (effectiveLevel - 1) * 5;
                            activeLaser = { targetId: nearestEnemy.id, width: laserWidth, damage: laserDamage, level: effectiveLevel };
                        }
                    }
                } else if (weaponData.cooldown > 0 && weapon.timer >= weaponData.cooldown / (effectiveLevel * 0.75 + 0.25)) {
                     weapon.timer = 0;
                     if (weapon.type === WeaponType.ShillTweet && enemies.length > 0) {
                        const shillTweetData = WEAPON_DATA[WeaponType.ShillTweet];
                        const range = (shillTweetData.radius || 300) + (effectiveLevel - 1) * 25;
                        let nearestEnemy: Enemy | null = null;
                        let minDistance = Infinity;
                        enemies.forEach((enemy: Enemy) => {
                            const dx = enemy.x - player.x;
                            const dy = enemy.y - player.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < range && dist < minDistance) { minDistance = dist; nearestEnemy = enemy; }
                        });
                        if (nearestEnemy) {
                            projectiles.push({ id: `proj_${Date.now()}_${Math.random()}`, x: player.x, y: player.y, targetId: nearestEnemy.id, owner: 'player', ...WEAPON_DATA[WeaponType.ShillTweet] });
                        }
                    } else if (weapon.type === WeaponType.Airdrop && enemies.length > 0) {
                        if (isBonked) {
                            // Trigger the BONK mode special ability
                            if (!airdropBonkEvent) { // Only trigger if not already active
                                airdropBonkEvent = { timer: 5, dropsLeft: 10, dropCooldown: 0 };
                                addFloatingText('AIRDROP BARRAGE!', player.x, player.y - 40, '#FF8C00', 3.0);
                                if (settings.screenShake) camera.shake = { duration: 0.5, intensity: 10 };
                            }
                        } else {
                            // Normal airdrop logic
                            const targetEnemy = enemies[Math.floor(Math.random() * enemies.length)];
                            const damage = weaponData.damage + (effectiveLevel - 1) * 10;
                            const radius = (weaponData.radius || 120) + (effectiveLevel - 1) * 5;
                            const airdropId = `airdrop_${Date.now()}`;
                            airdrops.push({ id: airdropId, x: targetEnemy.x, y: targetEnemy.y, startY: targetEnemy.y - 500, fallTimer: 2.0, totalFallTime: 2.0, radius, damage });
                            visualEffects.push({ id: `vfx_target_${airdropId}`, x: targetEnemy.x, y: targetEnemy.y, type: 'airdrop_target', radius: radius, life: 2.0, totalLife: 2.0, color: '#FF8C00' });
                        }
                    }
                }
            });

            // --- UPDATE PROJECTILES & AIRDROPS & VFX ---
            projectiles.forEach((p: Projectile) => {
                if (p.targetId && p.owner === 'player') {
                    const target = enemies.find((e: Enemy) => e.id === p.targetId);
                    if (target) { const dx = target.x - p.x; const dy = target.y - p.y; const dist = Math.sqrt(dx * dx + dy * dy); if (dist > 1) { p.x += (dx / dist) * p.speed * delta; p.y += (dy / dist) * p.speed * delta; } } else { p.y -= p.speed * delta; }
                } else if (p.dx !== undefined && p.dy !== undefined) {
                    p.x += p.dx * p.speed * delta;
                    p.y += p.dy * p.speed * delta;
                }
            });
            airdrops = airdrops.filter(ad => {
                ad.fallTimer -= delta;
                if (ad.fallTimer <= 0) {
                    enemies.forEach(e => {
                        const dx = e.x - ad.x; const dy = e.y - ad.y; const dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist < ad.radius + e.width / 2) {
                            e.health -= ad.damage; addFloatingText(ad.damage.toString(), e.x, e.y, '#FF8C00');
                            if (dist > 1) { e.knockback = { dx: dx / dist, dy: dy / dist, duration: 0.25, speed: 700 }; }
                        }
                    });
                    visualEffects.push({ id: `vfx_${ad.id}`, x: ad.x, y: ad.y, type: 'explosion', radius: ad.radius, life: 0.5, totalLife: 0.5, color: '#FF8C00' });
                    
                    // All airdrops have a 10% chance to drop a candle
                    if (Math.random() < 0.1) {
                        itemDrops.push({
                            id: `item_airdrop_candle_${ad.id}`,
                            x: ad.x,
                            y: ad.y,
                            type: ItemType.Candle,
                        });
                    }

                    if (settings.screenShake) camera.shake = { duration: 0.4, intensity: 8 };
                    return false;
                }
                return true;
            });

            visualEffects.forEach(vfx => {
                if(vfx.type === 'shockwave') {
                    const currentRadius = vfx.radius * (1 - (vfx.life / vfx.totalLife));
                    const shockwaveThickness = 30; // how wide the damaging ring is
                    const distToPlayer = Math.sqrt(Math.pow(player.x - vfx.x, 2) + Math.pow(player.y - vfx.y, 2));
                    if(Math.abs(distToPlayer - currentRadius) < (player.width / 2 + shockwaveThickness / 2)) {
                        player.health -= 20; // Shockwave damage
                        addFloatingText('20', player.x, player.y, '#ef4444');
                        if (settings.screenShake) camera.shake = { duration: 0.3, intensity: 6 };
                    }
                }
                if (vfx.type === 'red_candle_attack') {
                    const candleWidth = vfx.radius;
                    let isHit = false;
                    if (vfx.isVertical) {
                        if (Math.abs(player.x - vfx.x) < (player.width / 2 + candleWidth / 2)) {
                            isHit = true;
                        }
                    } else { // Horizontal
                        if (Math.abs(player.y - vfx.y) < (player.height / 2 + candleWidth / 2)) {
                            isHit = true;
                        }
                    }
                    if (isHit) {
                        const damageThisTick = BOSS_RED_CANDLE_DAMAGE_PER_SEC * delta;
                        player.health -= damageThisTick;
                        if (Math.random() < 10 * delta) { // High chance of seeing damage numbers
                            addFloatingText(Math.ceil(damageThisTick * 5).toString(), player.x, player.y - 20, '#ef4444');
                        }
                    }
                }
            });
            visualEffects = visualEffects.map((vfx: VisualEffect) => ({ ...vfx, life: vfx.life - delta })).filter((vfx: VisualEffect) => vfx.life > 0);

            // --- ITEM COLLECTION & ACTIVATION ---
            itemDrops = itemDrops.filter(drop => {
                const dx = player.x - drop.x;
                const dy = player.y - drop.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < player.width / 2 + 15) {
                    if (drop.type === ItemType.BONKAura) {
                        const bonkData = ITEM_DATA[ItemType.BONKAura];
                        const duration = bonkData.duration || 5;
                        bonkMode = { timer: duration, duration: duration };
                        lastSkillUsed = { id: `${Date.now()}`, name: bonkData.name, life: 2.0 };
                        addFloatingText('BONK!!!', player.x, player.y - 30, '#ef4444', 2.0);
                        if (settings.screenShake) camera.shake = { duration: 0.5, intensity: 12 };
                    }
                    if (drop.type === ItemType.Candle) {
                        const chosenVariant: CandleVariant = drop.variant || (() => {
                            const random = Math.random();
                            return (random < 0.65) ? 'West' : (random < 0.90) ? '奶牛candle' : 'Gake';
                        })();
                        
                        const candleData = ITEM_DATA[ItemType.Candle].variants![chosenVariant];
                        
                        const rotations = candleData.rotations || 1;
                        
                        lastSkillUsed = { id: `${Date.now()}`, name: candleData.name, life: 2.0 };

                        activeItems.push({
                            id: `active_candle_${Date.now()}`,
                            type: ItemType.Candle,
                            variant: chosenVariant,
                            life: candleData.duration,
                            angle: 0,
                            length: candleData.length,
                            width: candleData.width,
                            hitEnemyIds: [],
                            rotationSpeed: (rotations * 2 * Math.PI) / candleData.duration,
                        } as ActiveCandle);
                        
                        let healAmount = 0;
                        let maxHealthChange = 0;
                        let healText = '';
                        switch (chosenVariant) {
                            case 'Gake':
                                maxHealthChange = player.maxHealth;
                                player.maxHealth *= 2;
                                healAmount = player.maxHealth - player.health;
                                player.health = player.maxHealth;
                                healText = 'BALANCE DOUBLED!';
                                break;
                            case 'West':
                                maxHealthChange = 20;
                                healAmount = 20;
                                player.maxHealth += maxHealthChange;
                                player.health = Math.min(player.maxHealth, player.health + healAmount);
                                healText = `+${healAmount} U`;
                                break;
                            case '奶牛candle':
                                enemies.forEach((e: Enemy) => {
                                    e.stun = { duration: 0.5 };
                                    addFloatingText('❓', e.x, e.y - e.height, '#FBBF24', 0.5);
                                });
                                break;
                        }
                        
                        if (healAmount > 0) addFloatingText(healText, player.x, player.y - 20, '#34D399');
                        if (maxHealthChange !== 0) {
                            const text = `Max U ${maxHealthChange > 0 ? '+' : ''}${maxHealthChange}`;
                            const color = maxHealthChange > 0 ? '#FBBF24' : '#EF4444';
                            addFloatingText(text, player.x, player.y, color);
                        }
                    }
                    return false; // remove drop
                }
                return true; // keep drop
            });

            // --- ACTIVE ITEM UPDATE ---
            activeItems.forEach((item: ActiveItem) => {
                item.life -= delta;
                if (item.type === ItemType.Candle) { const candleItem = item as ActiveCandle; candleItem.angle = (candleItem.angle + candleItem.rotationSpeed * delta) % (2 * Math.PI); }
            });

            const hodlerAreaWeapon = player.weapons.find(w => w.type === WeaponType.HODLerArea);

            // --- UPDATE ENEMIES ---
            enemies.forEach((e: Enemy) => {
                let currentSpeed = e.speed;
                e.isSlowed = false; // Reset slow status each frame

                // HODLer Area Slow Effect
                if (hodlerAreaWeapon) {
                    let effectiveLevel = hodlerAreaWeapon.level;
                    if (bonkMode) { effectiveLevel = WEAPON_DATA[hodlerAreaWeapon.type].maxLevel + 1; }
                    const auraData = WEAPON_DATA[WeaponType.HODLerArea];
                    const radius = (auraData.radius || 50) + (effectiveLevel - 1) * 15;
                    const distToPlayer = Math.sqrt(Math.pow(player.x - e.x, 2) + Math.pow(player.y - e.y, 2));

                    if (distToPlayer < radius) {
                        currentSpeed *= 0.90; // Apply 10% slow
                        e.isSlowed = true;
                    }
                }

                if (e.stun && e.stun.duration > 0) {
                    e.stun.duration -= delta;
                    if (e.stun.duration <= 0) e.stun = undefined;
                } else if (e.knockback && e.knockback.duration > 0) {
                     e.x += e.knockback.dx * e.knockback.speed * delta; e.y += e.knockback.dy * e.knockback.speed * delta; e.knockback.duration -= delta; 
                } else {
                    const dx = player.x - e.x; const dy = player.y - e.y; const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 1) { e.x += (dx / dist) * currentSpeed * delta; e.y += (dy / dist) * currentSpeed * delta; }
                }
            });

            // --- DAMAGE & COLLISIONS ---
            const newProjectiles: Projectile[] = [];
            const newEnemies: Enemy[] = [];
            const newGems: ExperienceGem[] = [...gems];
            const activeLaserTarget = activeLaser ? enemies.find(en => en.id === activeLaser.targetId) : null;

            projectiles.forEach(p => {
                let hit = false;
                if (p.owner === 'player') {
                    enemies.forEach(e => {
                        if (hit || e.health <= 0) return;
                        const dx = e.x - p.x; const dy = e.y - p.y; const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < e.width / 2 + p.width / 2) {
                            const shillTweetWeapon = player.weapons.find(w => w.type === WeaponType.ShillTweet);
                            let effectiveLevel = shillTweetWeapon?.level || 1;
                            if (bonkMode) { effectiveLevel = WEAPON_DATA[WeaponType.ShillTweet].maxLevel + 1; }
                            const damage = WEAPON_DATA[WeaponType.ShillTweet].damage + (effectiveLevel - 1) * 8;
                            e.health -= damage; addFloatingText(damage.toString(), e.x, e.y, '#38bdf8');
                            hit = true;
                        }
                    });
                } else if (p.owner === 'enemy') {
                    if (p.isBossProjectile) {
                        // Capsule collision for the boss's "candle" projectile
                        const len = p.width; // Length of the candle
                        const thick = p.height; // Thickness of the candle
                        const x1 = p.x - (p.dx || 0) * len / 2;
                        const y1 = p.y - (p.dy || 0) * len / 2;
                        const x2 = p.x + (p.dx || 0) * len / 2;
                        const y2 = p.y + (p.dy || 0) * len / 2;
                        const seg_dx = x2 - x1;
                        const seg_dy = y2 - y1;
                        const l2 = seg_dx * seg_dx + seg_dy * seg_dy;
                        let t = 0;
                        if (l2 > 0) {
                            t = Math.max(0, Math.min(1, ((player.x - x1) * seg_dx + (player.y - y1) * seg_dy) / l2));
                        }
                        const closestX = x1 + t * seg_dx;
                        const closestY = y1 + t * seg_dy;
                        const distToBeam = Math.sqrt(Math.pow(player.x - closestX, 2) + Math.pow(player.y - closestY, 2));

                        if (distToBeam < (player.width / 2) + (thick / 2)) {
                            player.health -= p.damage;
                            addFloatingText(p.damage.toString(), player.x, player.y - 20, '#ef4444');
                            if (settings.screenShake) camera.shake = { duration: 0.2, intensity: 4 };
                            hit = true;
                        }
                    } else {
                        // Standard circular collision for other enemy projectiles
                        const dx = player.x - p.x;
                        const dy = player.y - p.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < player.width / 2 + p.width / 2) {
                            player.health -= p.damage;
                            addFloatingText(p.damage.toString(), player.x, player.y - 20, '#ef4444');
                            if (settings.screenShake) camera.shake = { duration: 0.2, intensity: 4 };
                            hit = true;
                        }
                    }
                }
            
                if (!hit && p.x > -50 && p.x < GAME_AREA_WIDTH + 50 && p.y > -50 && p.y < GAME_AREA_HEIGHT + 50) {
                    newProjectiles.push(p);
                }
            });
            projectiles = newProjectiles;

            const tradingBotWeapon = player.weapons.find(w => w.type === WeaponType.TradingBot);
            
            // --- Update Orbit Angle for Trading Bots ---
            if (tradingBotWeapon) {
                const botData = WEAPON_DATA[WeaponType.TradingBot];
                const rotationSpeed = bonkMode ? botData.speed * 2 : botData.speed;
                orbitAngle = (orbitAngle + rotationSpeed * delta) % (2 * Math.PI);
            }
            
            enemies.forEach(e => {
                // HODLer Area Damage
                if (hodlerAreaWeapon) {
                    let effectiveLevel = hodlerAreaWeapon.level;
                    if (bonkMode) { effectiveLevel = WEAPON_DATA[hodlerAreaWeapon.type].maxLevel + 1; }
                    const auraData = WEAPON_DATA[WeaponType.HODLerArea]; const radius = (auraData.radius || 50) + (effectiveLevel - 1) * 15;
                    const dx = e.x - player.x; const dy = e.y - player.y; const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < radius) {
                        const damageThisTick = auraData.damage * effectiveLevel * delta; e.health -= damageThisTick;
                        if (Math.random() < 3 * delta) addFloatingText(Math.ceil((auraData.damage * effectiveLevel) / 3).toString(), e.x + (Math.random()-0.5)*10, e.y, '#FFD700');
                    }
                }
                
                // Trading Bot Damage
                if (tradingBotWeapon) {
                    const botData = WEAPON_DATA[WeaponType.TradingBot]; const lastHitTime = e.lastHitBy[WeaponType.TradingBot] || 0;
                    const isBonked = bonkMode !== null;
                    const numBots = isBonked ? 10 : tradingBotWeapon.level;

                    if (gameTime > lastHitTime + (botData.hitCooldown || 0.5)) {
                        for (let i = 0; i < numBots; i++) {
                            const angle = orbitAngle + (i * 2 * Math.PI / numBots);
                            const botX = player.x + (botData.radius || 80) * Math.cos(angle); const botY = player.y + (botData.radius || 80) * Math.sin(angle);
                            const dx = e.x - botX; const dy = e.y - botY; const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < e.width / 2 + botData.width / 2) {
                                e.health -= botData.damage; addFloatingText(botData.damage.toString(), e.x, e.y, '#6EF8F8'); e.lastHitBy[WeaponType.TradingBot] = gameTime; break;
                            }
                        }
                    }
                }

                // Laser Eyes Damage
                if (activeLaser && activeLaserTarget) {
                    const x1 = player.x, y1 = player.y; const x2 = activeLaserTarget.x, y2 = activeLaserTarget.y;
                    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
                    const t = Math.max(0, Math.min(1, ((e.x - x1) * (x2 - x1) + (e.y - y1) * (y2 - y1)) / l2));
                    const closestX = x1 + t * (x2 - x1); const closestY = y1 + t * (y2 - y1);
                    const distToBeam = Math.sqrt(Math.pow(e.x - closestX, 2) + Math.pow(e.y - closestY, 2));
                    if (distToBeam < (activeLaser.width / 2) + (e.width / 2)) {
                        const damageThisTick = activeLaser.damage * delta; e.health -= damageThisTick;
                        if(Math.random() < 5 * delta) addFloatingText(Math.ceil(activeLaser.damage/2).toString(), e.x, e.y, '#ff4747');
                    }
                }

                 // Active Item Damage (Candle)
                activeItems.forEach((item: ActiveItem) => {
                    if (e.health > 0 && item.type === ItemType.Candle && !item.hitEnemyIds.includes(e.id)) {
                        const candle = item as ActiveCandle; const x1 = player.x, y1 = player.y;
                        const x2 = x1 + Math.cos(candle.angle) * candle.length; const y2 = y1 + Math.sin(candle.angle) * candle.length; const l2 = candle.length * candle.length;
                        const t = Math.max(0, Math.min(1, ((e.x - x1) * (x2 - x1) + (e.y - y1) * (y2 - y1)) / l2));
                        const closestX = x1 + t * (x2 - x1); const closestY = y1 + t * (y2 - y1);
                        const distToBeam = Math.sqrt(Math.pow(e.x - closestX, 2) + Math.pow(e.y - closestY, 2));
                        if (distToBeam < (candle.width / 2) + (e.width / 2)) {
                            if (candle.variant === '奶牛candle') { 
                                e.health -= 5; 
                                addFloatingText('5', e.x, e.y, '#FF8C00'); 
                            } else { // Gake and West
                                const damage = 10000;
                                e.health -= damage; 
                                addFloatingText(damage.toString(), e.x, e.y, '#34D399'); 
                            }
                            candle.hitEnemyIds.push(e.id);
                        }
                    }
                });

                if (e.health <= 0) {
                    if (e.isBoss) { 
                        currentStatus = GameStatus.Playing;
                        bossState = null;
                        marketCap = 71000;
                        bossHasBeenDefeated = true;
                        addFloatingText('MARKET STABILIZED', player.x, player.y - 40, '#34D399');
                        addFloatingText('MC BREAKTHROUGH!', player.x, player.y, '#FBBF24');
                        specialEventMessage = { id: `migrated_${Date.now()}`, text: 'Migrated', life: 4.0 };
                        itemDrops.push({
                            id: `item_bonk_boss_drop_${e.id}`,
                            x: e.x,
                            y: e.y,
                            type: ItemType.BONKAura,
                        });
                    }
                    newGems.push({ id: `gem_${e.id}`, x: e.x, y: e.y, value: e.xpValue, isLarge: e.type === EnemyType.RivalWhale }); 
                    kills++;
                    if (Math.random() < ITEM_DROP_CHANCE) itemDrops.push({ id: `item_${e.id}`, x: e.x, y: e.y, type: ItemType.Candle });
                } else {
                    const dx = player.x - e.x; const dy = player.y - e.y; const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < player.width / 2 + e.width / 2) {
                        player.health -= e.damage;
                        if (settings.screenShake) camera.shake = { duration: 0.2, intensity: 4 };
                    }
                    newEnemies.push(e);
                }
            });
            enemies = newEnemies;

            activeItems = activeItems.filter(item => item.life > 0);

            const remainingGems: ExperienceGem[] = [];
            newGems.forEach(gem => { const dx = player.x - gem.x; const dy = player.y - gem.y; const dist = Math.sqrt(dx * dx + dy * dy); if (dist < player.width / 2 + 10) player.xp += gem.value; else remainingGems.push(gem); });
            gems = remainingGems;

            // --- GAME STATE CHECKS ---
            if (player.health <= 0 || (prev.status === GameStatus.BossFight && marketCap <= STARTING_MC)) {
                currentStatus = GameStatus.GameOver;
            }

            if (currentStatus !== GameStatus.GameOver) {
                let needsLevelUp = false;
                while (player.xp >= player.xpToNextLevel) {
                    player.level++; player.xp -= player.xpToNextLevel; player.xpToNextLevel = LEVEL_THRESHOLDS[player.level] || Infinity; player.maxHealth += 10; player.health = Math.min(player.maxHealth, player.health + 20); needsLevelUp = true;
                }
                if (needsLevelUp) handleLevelUp();
            }

            const newMaxBalanceAchieved = Math.max(prev.maxBalanceAchieved, player.health);

            return {
                ...prev, 
                status: currentStatus, 
                player, 
                enemies, 
                projectiles, 
                gems, 
                floatingTexts, 
                airdrops, 
                visualEffects, 
                itemDrops, 
                activeItems, 
                gameTime, 
                marketCap: Math.max(marketCap, STARTING_MC), // Clamp final market cap
                maxBalanceAchieved: newMaxBalanceAchieved,
                kills, 
                orbitAngle, 
                activeLaser, 
                bossState,
                bossHasBeenDefeated,
                camera,
                lastSkillUsed,
                specialEventMessage,
                isHardMode,
                bonkMode,
                airdropBonkEvent,
                isPaperHandsUpgraded,
                upcomingRedCandleAttack,
            };
        });
    }, [handleLevelUp, isTouch, settings]);

    useGameLoop(gameTick, gameState.status === GameStatus.Playing || gameState.status === GameStatus.BossFight);

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