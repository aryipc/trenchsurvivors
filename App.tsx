

import React, { useState, useEffect, useCallback } from 'react';
import GameScreen from './components/GameScreen';
import { Hud } from './components/ui/Hud';
import LevelUpModal from './components/ui/LevelUpModal';
import GameOverScreen from './components/ui/GameOverScreen';
import StartScreen from './components/ui/StartScreen';
import VirtualJoystick from './components/ui/VirtualJoystick';
import LeaderboardScreen from './components/ui/LeaderboardScreen';
import { useGameLoop } from './hooks/useGameLoop';
import { useTouchControls } from './hooks/useTouch';
import { GameState, Player, Enemy, Projectile, ExperienceGem, GameStatus, WeaponType, Weapon, UpgradeOption, FloatingText, EnemyType, Airdrop, VisualEffect, LaserBeam, ItemDrop, ActiveItem, ActiveCandle, CandleVariant, ItemType, ScoreEntry, CurrentUser } from './types';
import { WEAPON_DATA, ENEMY_DATA, LEVEL_THRESHOLDS, GAME_AREA_WIDTH, GAME_AREA_HEIGHT, ITEM_DROP_CHANCE, ITEM_DATA, BOSS_SPAWN_MC, MC_PER_SECOND, STARTING_MC, MC_VOLATILITY_INTERVAL, MC_VOLATILITY_AMOUNT, BOSS_RANGED_ATTACK_COOLDOWN, BOSS_RANGED_ATTACK_DAMAGE, BOSS_RANGED_ATTACK_SPEED, BOSS_PROJECTILE_WIDTH, BOSS_PROJECTILE_HEIGHT } from './constants';
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
            heldItem: { type: ItemType.Candle, variant: 'Gake' },
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
        };
    });

    const [upgradeOptions, setUpgradeOptions] = useState<UpgradeOption[]>([]);
    const [descriptions, setDescriptions] = useState<Record<string, string>>({});
    const [loadingDescriptions, setLoadingDescriptions] = useState(false);
    const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);
    const { isTouch, handleJoystickMove, handleUseItem } = useTouchControls();
    const [pausedFromStatus, setPausedFromStatus] = useState<GameStatus | null>(null);

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
            heldItem: { type: ItemType.Candle, variant: 'Gake' },
            avatarUrl: user?.avatarUrl,
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
            currentUser: user,
            isNewHighScore: false,
            lastSkillUsed: null,
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

            let { player, enemies, projectiles, gems, floatingTexts, airdrops, visualEffects, itemDrops, activeItems, gameTime, marketCap, kills, orbitAngle, activeLaser, bossState, bossHasBeenDefeated, camera, lastSkillUsed } = JSON.parse(JSON.stringify(prev));
            let currentStatus: GameStatus = prev.status;
            
            gameTime += delta;

            if (lastSkillUsed) {
                lastSkillUsed.life -= delta;
                if (lastSkillUsed.life <= 0) {
                    lastSkillUsed = null;
                }
            }
            
            const zoom = isTouch ? 0.75 : 1.0;

            const botData = WEAPON_DATA[WeaponType.TradingBot];
            orbitAngle = (orbitAngle + (botData.speed * delta)) % (2 * Math.PI);

            // --- FLOATING TEXT ---
            floatingTexts = floatingTexts
                .map((ft: FloatingText) => ({ ...ft, life: ft.life - delta }))
                .filter((ft: FloatingText) => ft.life > 0);

            const addFloatingText = (text: string, x: number, y: number, color: string = 'white') => {
                floatingTexts.push({
                    id: `ft_${Date.now()}_${Math.random()}`,
                    text,
                    x,
                    y,
                    color,
                    life: 1.0,
                });
            };
            
            const touchState = (window as any).touchState || { joystick: { x: 0, y: 0 }, useItem: false };
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

            // --- ITEM ACTIVATION ---
            if ((keys[' '] || touchState.useItem) && player.heldItem) {
                if (touchState.useItem) {
                    (window as any).touchState.useItem = false; // Reset trigger
                }
                if (player.heldItem.type === ItemType.Candle && player.heldItem.variant) {
                    const variant = player.heldItem.variant;
                    const candleData = ITEM_DATA[ItemType.Candle].variants![variant];
                    const rotations = candleData.rotations || 1;
                    
                    lastSkillUsed = { id: `${Date.now()}`, name: candleData.name, life: 2.0 };

                    activeItems.push({
                        id: `active_candle_${Date.now()}`,
                        type: ItemType.Candle,
                        variant: variant,
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
                    switch (variant) {
                        case 'Gake': maxHealthChange = player.maxHealth; player.maxHealth *= 2; healAmount = player.maxHealth - player.health; player.health = player.maxHealth; healText = 'BALANCE DOUBLED!'; break;
                        case 'West': maxHealthChange = 20; healAmount = 20; player.maxHealth += maxHealthChange; player.health = Math.min(player.maxHealth, player.health + healAmount); healText = `+${healAmount} U`; break;
                        case '奶牛candle': break;
                    }
                    if (healAmount > 0) addFloatingText(healText, player.x, player.y - 20, '#34D399');
                    if (maxHealthChange !== 0) {
                        const text = `Max U ${maxHealthChange > 0 ? '+' : ''}${maxHealthChange}`;
                        const color = maxHealthChange > 0 ? '#FBBF24' : '#EF4444';
                        addFloatingText(text, player.x, player.y, color);
                    }
                    player.heldItem = null;
                }
                (window as any).pressedKeys[' '] = false;
            }
            
            // --- MC & BOSS LOGIC ---
            if (currentStatus === GameStatus.Playing) {
                 marketCap += MC_PER_SECOND * delta;
            }

            if (marketCap >= BOSS_SPAWN_MC && prev.status === GameStatus.Playing && !prev.bossHasBeenDefeated) {
                currentStatus = GameStatus.BossFight;
                enemies = []; // Clear existing enemies
                const bossData = ENEMY_DATA[EnemyType.MigratingBoss];
                enemies.push({ id: 'boss_cex', type: EnemyType.MigratingBoss, ...bossData, x: player.x, y: player.y - 800, lastHitBy: {} });
                bossState = { shockwaveTimer: 8, spawnTimer: 5, marketCapVolatilityTimer: MC_VOLATILITY_INTERVAL, rangedAttackTimer: BOSS_RANGED_ATTACK_COOLDOWN };
                addFloatingText('WARNING: MIGRATING BOSS INBOUND', player.x, player.y - 100, '#ef4444');
            }

            if(currentStatus === GameStatus.BossFight && bossState) {
                bossState.shockwaveTimer -= delta;
                bossState.spawnTimer -= delta;
                bossState.marketCapVolatilityTimer -= delta;
                bossState.rangedAttackTimer -= delta;
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
                    enemies.push({ id: `enemy_${Date.now()}_${Math.random()}`, type: enemyTypeToSpawn, ...enemyData, x, y, lastHitBy: {} });
                }
            }


            // --- WEAPON FIRING ---
            activeLaser = null;
            player.weapons.forEach((weapon: Weapon) => {
                weapon.timer += delta;
                const weaponData = WEAPON_DATA[weapon.type];

                if(weapon.type === WeaponType.LaserEyes) {
                    if (weapon.timer > weaponData.cooldown) weapon.timer = 0;
                    if (weapon.timer < (weaponData.duration || 2) && enemies.length > 0) {
                        let nearestEnemy: Enemy | null = null;
                        let minDistance = Infinity;
                        enemies.forEach((enemy: Enemy) => {
                            const dx = enemy.x - player.x;
                            const dy = enemy.y - player.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < minDistance) { minDistance = dist; nearestEnemy = enemy; }
                        });

                        if (nearestEnemy) {
                            activeLaser = { targetId: nearestEnemy.id, width: weaponData.width + (weapon.level - 1) * 5, damage: weaponData.damage + (weapon.level - 1) * 5, level: weapon.level };
                        }
                    }
                } else if (weaponData.cooldown > 0 && weapon.timer >= weaponData.cooldown / (weapon.level * 0.75 + 0.25)) {
                     weapon.timer = 0;
                     if (weapon.type === WeaponType.ShillTweet && enemies.length > 0) {
                        const shillTweetData = WEAPON_DATA[WeaponType.ShillTweet];
                        const range = (shillTweetData.radius || 300) + (weapon.level - 1) * 25;
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
                         const targetEnemy = enemies[Math.floor(Math.random() * enemies.length)];
                         const level = weapon.level;
                         const damage = weaponData.damage + (level - 1) * 10;
                         const radius = (weaponData.radius || 120) + (level - 1) * 5;
                         const airdropId = `airdrop_${Date.now()}`;
                         airdrops.push({ id: airdropId, x: targetEnemy.x, y: targetEnemy.y, startY: targetEnemy.y - 500, fallTimer: 2.0, totalFallTime: 2.0, radius, damage });
                         visualEffects.push({ id: `vfx_target_${airdropId}`, x: targetEnemy.x, y: targetEnemy.y, type: 'airdrop_target', radius: radius, life: 2.0, totalLife: 2.0, color: '#FF8C00' });
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
                    return false;
                }
                return true;
            });
            visualEffects = visualEffects.map((vfx: VisualEffect) => ({ ...vfx, life: vfx.life - delta })).filter((vfx: VisualEffect) => vfx.life > 0);

            // --- ITEM COLLECTION ---
            itemDrops = itemDrops.filter(drop => {
                const dx = player.x - drop.x; const dy = player.y - drop.y; const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < player.width / 2 + 15) {
                    if (player.heldItem === null) {
                        if (drop.type === ItemType.Candle) {
                            const random = Math.random();
                            let chosenVariant: CandleVariant = (random < 0.80) ? 'West' : (random < 0.90) ? '奶牛candle' : 'Gake';
                            player.heldItem = { type: ItemType.Candle, variant: chosenVariant };
                            const variantData = ITEM_DATA[ItemType.Candle].variants![chosenVariant];
                            addFloatingText(`${variantData.name}!`, player.x, player.y, '#34D399');
                        }
                        return false; // remove drop
                    }
                }
                return true; // keep drop
            });

            // --- ACTIVE ITEM UPDATE ---
            activeItems.forEach((item: ActiveItem) => {
                item.life -= delta;
                if (item.type === ItemType.Candle) { const candleItem = item as ActiveCandle; candleItem.angle = (candleItem.angle + candleItem.rotationSpeed * delta) % (2 * Math.PI); }
            });

            // --- UPDATE ENEMIES ---
            enemies.forEach((e: Enemy) => {
                if (e.knockback && e.knockback.duration > 0) { e.x += e.knockback.dx * e.knockback.speed * delta; e.y += e.knockback.dy * e.knockback.speed * delta; e.knockback.duration -= delta; } else {
                    const dx = player.x - e.x; const dy = player.y - e.y; const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 1) { e.x += (dx / dist) * e.speed * delta; e.y += (dy / dist) * e.speed * delta; }
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
                            const damage = WEAPON_DATA[WeaponType.ShillTweet].damage + ((shillTweetWeapon?.level || 1) - 1) * 8;
                            e.health -= damage; addFloatingText(damage.toString(), e.x, e.y, '#38bdf8');
                            hit = true;
                        }
                    });
                } else if (p.owner === 'enemy') {
                    const dx = player.x - p.x; const dy = player.y - p.y; const dist = Math.sqrt(player.width / 2 + p.width / 2);
                    if (dist < player.width / 2 + p.width / 2) {
                        player.health -= p.damage;
                        addFloatingText(p.damage.toString(), player.x, player.y - 20, '#ef4444');
                        hit = true;
                    }
                }
            
                if (!hit && p.x > -50 && p.x < GAME_AREA_WIDTH + 50 && p.y > -50 && p.y < GAME_AREA_HEIGHT + 50) {
                    newProjectiles.push(p);
                }
            });
            projectiles = newProjectiles;

            const hodlerAreaWeapon = player.weapons.find(w => w.type === WeaponType.HODLerArea);
            const tradingBotWeapon = player.weapons.find(w => w.type === WeaponType.TradingBot);
            
            visualEffects.forEach(vfx => {
                if(vfx.type === 'shockwave') {
                    const currentRadius = vfx.radius * (1 - (vfx.life / vfx.totalLife));
                    const shockwaveThickness = 30; // how wide the damaging ring is
                    const distToPlayer = Math.sqrt(Math.pow(player.x - vfx.x, 2) + Math.pow(player.y - vfx.y, 2));
                    if(Math.abs(distToPlayer - currentRadius) < (player.width / 2 + shockwaveThickness / 2)) {
                        player.health -= 20; // Shockwave damage
                    }
                }
            });

            enemies.forEach(e => {
                // HODLer Area Damage
                if (hodlerAreaWeapon) {
                    const auraData = WEAPON_DATA[WeaponType.HODLerArea]; const radius = (auraData.radius || 50) + (hodlerAreaWeapon.level - 1) * 15;
                    const dx = e.x - player.x; const dy = e.y - player.y; const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < radius) {
                        const damageThisTick = auraData.damage * hodlerAreaWeapon.level * delta; e.health -= damageThisTick;
                        if (Math.random() < 3 * delta) addFloatingText(Math.ceil((auraData.damage * hodlerAreaWeapon.level) / 3).toString(), e.x + (Math.random()-0.5)*10, e.y, '#FFD700');
                    }
                }
                
                // Trading Bot Damage
                if (tradingBotWeapon) {
                    const botData = WEAPON_DATA[WeaponType.TradingBot]; const lastHitTime = e.lastHitBy[WeaponType.TradingBot] || 0;
                    if (gameTime > lastHitTime + (botData.hitCooldown || 0.5)) {
                        for (let i = 0; i < tradingBotWeapon.level; i++) {
                            const angle = orbitAngle + (i * 2 * Math.PI / tradingBotWeapon.level);
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
                    }
                    newGems.push({ id: `gem_${e.id}`, x: e.x, y: e.y, value: e.xpValue }); kills++;
                    if (Math.random() < ITEM_DROP_CHANCE) itemDrops.push({ id: `item_${e.id}`, x: e.x, y: e.y, type: ItemType.Candle });
                } else {
                    const dx = player.x - e.x; const dy = player.y - e.y; const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < player.width / 2 + e.width / 2) player.health -= e.damage;
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
            };
        });
    }, [handleLevelUp, isTouch]);

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
                return <StartScreen onStart={handleStartGame} onShowLeaderboard={handleShowLeaderboard} />;
            case GameStatus.Leaderboard:
                return <LeaderboardScreen scores={leaderboard} onBack={handleBackToMenu} loading={leaderboardLoading} />;
            case GameStatus.GameOver:
                return <GameOverScreen 
                            score={gameState.kills} 
                            marketCap={gameState.marketCap} 
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
                            onUseItem={handleUseItem}
                            lastSkillUsed={gameState.lastSkillUsed}
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
            {isTouch && (gameState.status === GameStatus.Playing || gameState.status === GameStatus.BossFight) && (
                <VirtualJoystick onMove={handleJoystickMove} />
            )}
        </div>
    );
};

export default App;