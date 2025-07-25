import { GameState, GameStatus, Player, Enemy, Projectile, ExperienceGem, FloatingText, Airdrop, VisualEffect, ItemDrop, ActiveItem, LaserBeam, Weapon, WeaponType, EnemyType, ItemType, ActiveCandle, CandleVariant, Settings } from '../types';
import { WEAPON_DATA, ENEMY_DATA, GAME_AREA_WIDTH, GAME_AREA_HEIGHT, MC_PER_SECOND, BOSS_SPAWN_MC, STARTING_MC, MC_VOLATILITY_INTERVAL, MC_VOLATILITY_AMOUNT, BOSS_RANGED_ATTACK_COOLDOWN, BOSS_RANGED_ATTACK_DAMAGE, BOSS_RANGED_ATTACK_SPEED, BOSS_PROJECTILE_WIDTH, BOSS_PROJECTILE_HEIGHT, BOSS_RED_CANDLE_COOLDOWN, BOSS_RED_CANDLE_WARNING_DURATION, BOSS_RED_CANDLE_WIDTH, BOSS_RED_CANDLE_ATTACK_DURATION, BOSS_RED_CANDLE_DAMAGE_PER_SEC, ITEM_DROP_CHANCE, ITEM_DATA, LEVEL_THRESHOLDS, DEV_LOCK_MESSAGES } from '../constants';

// Helper to add floating text, respecting settings. Returns a new array.
const addFloatingText = (texts: FloatingText[], text: string, x: number, y: number, settings: Settings, color: string = 'white', life: number = 1.0): FloatingText[] => {
    if (!settings.floatingText) return texts;
    return [
        ...texts,
        {
            id: `ft_${Date.now()}_${Math.random()}`,
            text,
            x,
            y,
            color,
            life,
        },
    ];
};

export const runGameTick = (prevState: GameState, delta: number, isTouch: boolean, settings: Settings): GameState => {
    // --- Start with a shallow copy. We will replace arrays and objects that change. ---
    let state = { ...prevState };

    state.gameTime += delta;

    if (state.lastSkillUsed) {
        const newLife = state.lastSkillUsed.life - delta;
        state.lastSkillUsed = newLife > 0 ? { ...state.lastSkillUsed, life: newLife } : null;
    }
    if (state.specialEventMessage) {
        const newLife = state.specialEventMessage.life - delta;
        state.specialEventMessage = newLife > 0 ? { ...state.specialEventMessage, life: newLife } : null;
    }
    if (state.bonkMode) {
        const newTimer = state.bonkMode.timer - delta;
        state.bonkMode = newTimer > 0 ? { ...state.bonkMode, timer: newTimer } : null;
    }
    if (state.devLockMode) {
        const newTimer = state.devLockMode.timer - delta;
        state.devLockMode = newTimer > 0 ? { ...state.devLockMode, timer: newTimer } : null;
    }
    
    // --- Camera ---
    let newCamera = { ...state.camera };
    if (newCamera.shake && newCamera.shake.duration > 0) {
        newCamera.shake = { ...newCamera.shake, duration: newCamera.shake.duration - delta };
    } else if (newCamera.shake) {
        newCamera.shake = undefined;
    }

    // --- Floating Text ---
    state.floatingTexts = state.floatingTexts
        .map((ft) => ({ ...ft, life: ft.life - delta }))
        .filter((ft) => ft.life > 0);

    // --- Player Movement ---
    const touchState = (window as any).touchState || { joystick: { x: 0, y: 0 } };
    const keys: Record<string, boolean> = (window as any).pressedKeys || {};
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
    
    let newPlayer = { ...state.player };

    if (moveX !== 0 || moveY !== 0) {
        const magnitude = Math.sqrt(moveX * moveX + moveY * moveY);
        const moveDx = moveX / magnitude;
        const moveDy = moveY / magnitude;
        newPlayer.x += moveDx * speed;
        newPlayer.y += moveDy * speed;
        newPlayer.lastMoveDx = moveDx;
        newPlayer.lastMoveDy = moveDy;
    }
    
    newPlayer.x = Math.max(newPlayer.width / 2, Math.min(GAME_AREA_WIDTH - newPlayer.width / 2, newPlayer.x));
    newPlayer.y = Math.max(newPlayer.height / 2, Math.min(GAME_AREA_HEIGHT - newPlayer.height / 2, newPlayer.y));
    
    // --- Camera Smoothing ---
    const zoom = isTouch ? 0.75 : 1.0;
    const cameraTargetX = newPlayer.x - (window.innerWidth / zoom) / 2;
    const cameraTargetY = newPlayer.y - (window.innerHeight / zoom) / 2;
    const smoothFactor = 5;
    const cameraLerpFactor = 1 - Math.exp(-smoothFactor * delta);
    newCamera.x = newCamera.x * (1 - cameraLerpFactor) + cameraTargetX * cameraLerpFactor;
    newCamera.y = newCamera.y * (1 - cameraLerpFactor) + cameraTargetY * cameraLerpFactor;
    state.camera = newCamera;
    
    // --- MC & Boss Logic ---
    if (state.status === GameStatus.Playing) {
         state.marketCap += MC_PER_SECOND * delta;
    }

    // --- Hard Mode & Enemy Upgrade Triggers ---
    if (!state.isHardMode && state.marketCap >= 100000) {
        state.isHardMode = true;
        state.specialEventMessage = { id: `hardmode_${Date.now()}`, text: 'MARKET PANIC!', life: 4.0 };
        state.floatingTexts = addFloatingText(state.floatingTexts, 'FUD has mutated!', newPlayer.x, newPlayer.y - 40, settings, '#ef4444', 3.0);
    }

    if (!state.isPaperHandsUpgraded && state.marketCap >= 120000) {
        state.isPaperHandsUpgraded = true;
        state.floatingTexts = addFloatingText(state.floatingTexts, 'Paper Hands are getting stronger!', newPlayer.x, newPlayer.y - 60, settings, '#f87171', 3.0);
    }

    if (state.marketCap >= BOSS_SPAWN_MC && state.status === GameStatus.Playing && !state.bossHasBeenDefeated) {
        state.status = GameStatus.BossFight;
        const bossData = ENEMY_DATA[EnemyType.MigratingBoss];
        const newBoss = { id: 'boss_cex', type: EnemyType.MigratingBoss, ...bossData, x: newPlayer.x, y: newPlayer.y - 800, lastHitBy: {} };
        state.enemies = [newBoss];
        state.bossState = { shockwaveTimer: 8, spawnTimer: 5, marketCapVolatilityTimer: MC_VOLATILITY_INTERVAL, rangedAttackTimer: BOSS_RANGED_ATTACK_COOLDOWN, redCandleAttackTimer: BOSS_RED_CANDLE_COOLDOWN / 2 };
        state.floatingTexts = addFloatingText(state.floatingTexts, 'WARNING: MIGRATING BOSS INBOUND', newPlayer.x, newPlayer.y - 100, settings, '#ef4444');
         if (settings.screenShake) state.camera = { ...state.camera, shake: { duration: 2.0, intensity: 10 }};
    }

    if(state.status === GameStatus.BossFight && state.bossState) {
        let newBossState = { ...state.bossState };
        newBossState.shockwaveTimer -= delta;
        newBossState.spawnTimer -= delta;
        newBossState.marketCapVolatilityTimer -= delta;
        newBossState.rangedAttackTimer -= delta;
        newBossState.redCandleAttackTimer -= delta;
        
        const boss = state.enemies.find(e => e.isBoss);

        if (newBossState.marketCapVolatilityTimer <= 0) {
            newBossState.marketCapVolatilityTimer = MC_VOLATILITY_INTERVAL;
            const dropAmount = Math.random() * MC_VOLATILITY_AMOUNT;
            state.marketCap -= dropAmount;
            state.floatingTexts = addFloatingText(state.floatingTexts, `-$${Math.floor(dropAmount)}`, newPlayer.x, newPlayer.y - 60, settings, '#ef4444');
        }
         
        if (boss && newBossState.rangedAttackTimer <= 0) {
            newBossState.rangedAttackTimer = BOSS_RANGED_ATTACK_COOLDOWN;
            const dx = newPlayer.x - boss.x;
            const dy = newPlayer.y - boss.y;
            const dist = Math.sqrt(dx*dx + dy*dy) || 1;
            state.projectiles = [...state.projectiles, {
                id: `b_proj_${Date.now()}`, x: boss.x, y: boss.y, width: BOSS_PROJECTILE_WIDTH, height: BOSS_PROJECTILE_HEIGHT,
                damage: BOSS_RANGED_ATTACK_DAMAGE, speed: BOSS_RANGED_ATTACK_SPEED, owner: 'enemy', isBossProjectile: true,
                dx: dx / dist, dy: dy / dist,
            }];
        }

        if (boss && newBossState.redCandleAttackTimer <= 0) {
            newBossState.redCandleAttackTimer = BOSS_RED_CANDLE_COOLDOWN;
            const isVertical = Math.random() < 0.5;
            const position = isVertical ? newPlayer.x : newPlayer.y;

            state.visualEffects = [...state.visualEffects, {
                id: `red_candle_warn_${Date.now()}`, type: 'red_candle_warning', x: isVertical ? position : 0, y: isVertical ? 0 : position,
                isVertical: isVertical, radius: BOSS_RED_CANDLE_WIDTH, life: BOSS_RED_CANDLE_WARNING_DURATION, totalLife: BOSS_RED_CANDLE_WARNING_DURATION, color: '#ef4444'
            }];
            
            state.upcomingRedCandleAttack = {
                id: `red_candle_atk_${Date.now()}`, isVertical: isVertical, position: position, triggerTime: state.gameTime + BOSS_RED_CANDLE_WARNING_DURATION
            };
        }

        if (boss && newBossState.shockwaveTimer <= 0) {
            newBossState.shockwaveTimer = 8;
            state.visualEffects = [...state.visualEffects, {
                id: `vfx_shockwave_${Date.now()}`, x: boss.x, y: boss.y, type: 'shockwave', radius: 800, life: 3.0, totalLife: 3.0, color: '#ef4444'
             }];
             if (settings.screenShake) state.camera = { ...state.camera, shake: { duration: 0.5, intensity: 15 } };
        }
        if (boss && newBossState.spawnTimer <= 0) {
            newBossState.spawnTimer = 5;
            let enemiesToAdd: Enemy[] = [];
            for (let i = 0; i < 2; i++) {
                 const enemyData = ENEMY_DATA[EnemyType.FUD];
                 const angle = Math.random() * 2 * Math.PI;
                 const spawnDist = 100;
                 const x = boss.x + Math.cos(angle) * spawnDist;
                 const y = boss.y + Math.sin(angle) * spawnDist;
                 enemiesToAdd.push({ id: `enemy_${Date.now()}_${Math.random()}`, type: EnemyType.FUD, ...enemyData, x, y, lastHitBy: {} });
            }
            state.enemies = [...state.enemies, ...enemiesToAdd];
        }
        state.bossState = newBossState;
    }
    
    // --- ENEMY SPAWNING ---
    if (state.status === GameStatus.Playing) {
        const spawnRate = Math.max(0.1, 1 - state.gameTime / 180);
        if (Math.random() < delta / spawnRate && state.enemies.length < 100) {
            const spawnPool: EnemyType[] = [EnemyType.FUD];
            const spawnWeights = [0.7];

            if (state.gameTime > 30) { spawnPool.push(EnemyType.PaperHands); spawnWeights.push(0.25); }
            if (state.gameTime > 60) { spawnPool.push(EnemyType.RivalWhale); spawnWeights.push(0.05); }
            
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
            // Adjust viewport for zoom on mobile to ensure enemies spawn off-screen correctly
            const viewZoom = isTouch ? 0.75 : 1.0;
            const viewWidth = window.innerWidth / viewZoom;
            const viewHeight = window.innerHeight / viewZoom;
            const viewRect = {
                left: state.camera.x,
                right: state.camera.x + viewWidth,
                top: state.camera.y,
                bottom: state.camera.y + viewHeight,
            };
            
            switch (side) {
                case 0: x = viewRect.left + Math.random() * viewWidth; y = viewRect.top - spawnOffset; break;
                case 1: x = viewRect.right + spawnOffset; y = viewRect.top + Math.random() * viewHeight; break;
                case 2: x = viewRect.left + Math.random() * viewWidth; y = viewRect.bottom + spawnOffset; break;
                default: x = viewRect.left - spawnOffset; y = viewRect.top + Math.random() * viewHeight; break;
            }
            
            const enemyData = ENEMY_DATA[enemyTypeToSpawn];
            let finalEnemyData = { ...enemyData };
            let enemyLevel = 1;
    
            if (enemyTypeToSpawn === EnemyType.FUD && state.isHardMode) {
                const level2Data = enemyData.levelData?.[2];
                if (level2Data) {
                    finalEnemyData = { ...finalEnemyData, ...level2Data };
                    enemyLevel = 2;
                }
            }
            
            if (enemyTypeToSpawn === EnemyType.PaperHands && state.isPaperHandsUpgraded) {
                const level2Data = enemyData.levelData?.[2];
                if (level2Data) {
                    finalEnemyData = { ...finalEnemyData, ...level2Data };
                    enemyLevel = 2;
                }
            }
            const newEnemy: Enemy = { 
                id: `enemy_${Date.now()}_${Math.random()}`, 
                type: enemyTypeToSpawn, 
                ...finalEnemyData, 
                x, y, 
                lastHitBy: {},
                level: enemyLevel
            };
            state.enemies = [...state.enemies, newEnemy];
        }
    }

    // --- AIRDROP BONK EVENT ---
    if (state.airdropBonkEvent) {
        let newAirdropBonkEvent = { ...state.airdropBonkEvent };
        newAirdropBonkEvent.timer -= delta;
        newAirdropBonkEvent.dropCooldown -= delta;

        if (newAirdropBonkEvent.dropCooldown <= 0 && newAirdropBonkEvent.dropsLeft > 0) {
            const spawnRadius = (window.innerWidth / zoom) / 2;
            const angle = Math.random() * 2 * Math.PI;
            const dist = Math.random() * spawnRadius;
            const x = newPlayer.x + Math.cos(angle) * dist;
            const y = newPlayer.y + Math.sin(angle) * dist;

            const weaponData = WEAPON_DATA[WeaponType.Airdrop];
            const effectiveLevel = weaponData.maxLevel + 1;
            const damage = weaponData.damage + (effectiveLevel - 1) * 10;
            const radius = (weaponData.radius || 120) + (effectiveLevel - 1) * 5;
            const airdropId = `airdrop_bonk_${Date.now()}_${Math.random()}`;
            state.airdrops = [...state.airdrops, { id: airdropId, x, y, startY: y - 500, fallTimer: 2.0, totalFallTime: 2.0, radius, damage }];
            state.visualEffects = [...state.visualEffects, { id: `vfx_target_${airdropId}`, x, y, type: 'airdrop_target', radius, life: 2.0, totalLife: 2.0, color: '#FF8C00' }];
            
            newAirdropBonkEvent.dropsLeft--;
            newAirdropBonkEvent.dropCooldown = 0.5;
        }

        state.airdropBonkEvent = (newAirdropBonkEvent.timer <= 0 || newAirdropBonkEvent.dropsLeft <= 0) ? null : newAirdropBonkEvent;
    }

    // --- RED CANDLE ATTACK ---
    if (state.upcomingRedCandleAttack && state.gameTime >= state.upcomingRedCandleAttack.triggerTime) {
        const attack = state.upcomingRedCandleAttack;
        state.visualEffects = [...state.visualEffects, {
            id: attack.id, type: 'red_candle_attack', x: attack.isVertical ? attack.position : 0, y: attack.isVertical ? 0 : attack.position,
            isVertical: attack.isVertical, radius: BOSS_RED_CANDLE_WIDTH, life: BOSS_RED_CANDLE_ATTACK_DURATION,
            totalLife: BOSS_RED_CANDLE_ATTACK_DURATION, color: '#ff1111'
        }];
        if (settings.screenShake) state.camera = { ...state.camera, shake: { duration: 0.5, intensity: 10 } };
        state.upcomingRedCandleAttack = null;
    }

    // --- WEAPON FIRING & UPDATES ---
    state.activeLaser = null;
    const isBonked = state.bonkMode !== null;
    let projectilesToAdd: Projectile[] = [];
    let airdropsToAdd: Airdrop[] = [];
    let vfxToAdd: VisualEffect[] = [];

    state.player = {
        ...newPlayer,
        weapons: newPlayer.weapons.map(weapon => {
            let newWeapon = { ...weapon, timer: weapon.timer + delta };
            const weaponData = WEAPON_DATA[weapon.type];
            let effectiveLevel = isBonked && weapon.type !== WeaponType.TradingBot ? weaponData.maxLevel + 1 : weapon.level;

            if (weapon.type === WeaponType.LaserEyes) {
                if (!isBonked && newWeapon.timer > weaponData.cooldown) newWeapon.timer = 0;
                if ((isBonked || newWeapon.timer < (weaponData.duration || 2)) && state.enemies.length > 0) {
                    const nearestEnemy = state.enemies.reduce((closest, enemy) => {
                        const dist = Math.hypot(enemy.x - newPlayer.x, enemy.y - newPlayer.y);
                        return dist < closest.dist ? { enemy, dist } : closest;
                    }, { enemy: null as Enemy | null, dist: Infinity }).enemy;
                    
                    if (nearestEnemy) {
                        const laserWidth = weaponData.width + (effectiveLevel - 1) * 5;
                        let laserDamage = weaponData.damage + (effectiveLevel - 1) * 5;
                        
                        const rainbowChance = 0.01 + (effectiveLevel - 1) * 0.005;
                        const isRainbow = Math.random() < rainbowChance;
                        
                        if (isRainbow) {
                            laserDamage *= 2;
                        }

                        state.activeLaser = { 
                            targetId: nearestEnemy.id, 
                            width: laserWidth, 
                            damage: laserDamage, 
                            level: effectiveLevel,
                            isRainbow: isRainbow,
                        };
                    }
                }
            } else if (weaponData.cooldown > 0 && newWeapon.timer >= weaponData.cooldown / (effectiveLevel * 0.75 + 0.25)) {
                newWeapon.timer = 0;
                if (weapon.type === WeaponType.ShillTweet && state.enemies.length > 0) {
                    const shillTweetData = WEAPON_DATA[WeaponType.ShillTweet];
                    const range = (shillTweetData.radius || 300) + (effectiveLevel - 1) * 25;
                    const nearestEnemy = state.enemies.reduce((closest, enemy) => {
                         const dist = Math.hypot(enemy.x - newPlayer.x, enemy.y - newPlayer.y);
                        if (dist < range && dist < closest.dist) return { enemy, dist };
                        return closest;
                    }, { enemy: null as Enemy | null, dist: Infinity }).enemy;
                    if (nearestEnemy) {
                        projectilesToAdd.push({ id: `proj_${Date.now()}_${Math.random()}`, x: newPlayer.x, y: newPlayer.y, targetId: nearestEnemy.id, owner: 'player', ...WEAPON_DATA[WeaponType.ShillTweet] });
                    }
                } else if (weapon.type === WeaponType.Airdrop && state.enemies.length > 0) {
                    if (isBonked) {
                        if (!state.airdropBonkEvent) {
                            state.airdropBonkEvent = { timer: 5, dropsLeft: 10, dropCooldown: 0 };
                            state.floatingTexts = addFloatingText(state.floatingTexts, 'AIRDROP BARRAGE!', newPlayer.x, newPlayer.y - 40, settings, '#FF8C00', 3.0);
                            if (settings.screenShake) state.camera = { ...state.camera, shake: { duration: 0.5, intensity: 10 } };
                        }
                    } else {
                        const targetEnemy = state.enemies[Math.floor(Math.random() * state.enemies.length)];
                        const damage = weaponData.damage + (effectiveLevel - 1) * 10;
                        const radius = (weaponData.radius || 120) + (effectiveLevel - 1) * 5;
                        const airdropId = `airdrop_${Date.now()}`;
                        airdropsToAdd.push({ id: airdropId, x: targetEnemy.x, y: targetEnemy.y, startY: targetEnemy.y - 500, fallTimer: 2.0, totalFallTime: 2.0, radius, damage });
                        vfxToAdd.push({ id: `vfx_target_${airdropId}`, x: targetEnemy.x, y: targetEnemy.y, type: 'airdrop_target', radius, life: 2.0, totalLife: 2.0, color: '#FF8C00' });
                    }
                }
            }
            return newWeapon;
        }),
    };
    newPlayer = state.player;
    state.projectiles = [...state.projectiles, ...projectilesToAdd];
    state.airdrops = [...state.airdrops, ...airdropsToAdd];
    state.visualEffects = [...state.visualEffects, ...vfxToAdd];

    // --- Update Projectiles ---
    state.projectiles = state.projectiles.map(p => {
        let newP = { ...p };
        if (p.targetId && p.owner === 'player') {
            const target = state.enemies.find((e) => e.id === p.targetId);
            if (target) {
                const dx = target.x - p.x; const dy = target.y - p.y; const dist = Math.hypot(dx, dy);
                if (dist > 1) { newP.x += (dx / dist) * p.speed * delta; newP.y += (dy / dist) * p.speed * delta; }
            } else { newP.y -= p.speed * delta; }
        } else if (p.dx !== undefined && p.dy !== undefined) {
            newP.x += p.dx * p.speed * delta; newP.y += p.dy * p.speed * delta;
        }
        return newP;
    });

    // --- Update Airdrops & Item Drops ---
    let newItemsFromAirdrops: ItemDrop[] = [];
    let candleOnFieldCount = state.itemDrops.filter(drop => drop.type === ItemType.Candle).length;

    state.airdrops = state.airdrops.filter(ad => {
        ad.fallTimer -= delta;
        if (ad.fallTimer <= 0) {
            state.enemies.forEach(e => {
                const dist = Math.hypot(e.x - ad.x, e.y - ad.y);
                if (dist < ad.radius + e.width / 2) {
                    e.health -= ad.damage;
                    state.floatingTexts = addFloatingText(state.floatingTexts, ad.damage.toString(), e.x, e.y, settings, '#FF8C00');
                    if (dist > 1) { e.knockback = { dx: (e.x - ad.x) / dist, dy: (e.y - ad.y) / dist, duration: 0.25, speed: 700 }; }
                }
            });
            state.visualEffects = [...state.visualEffects, { id: `vfx_${ad.id}`, x: ad.x, y: ad.y, type: 'explosion', radius: ad.radius, life: 0.5, totalLife: 0.5, color: '#FF8C00' }];
            if (Math.random() < 0.1) {
                if (candleOnFieldCount < 6) {
                    newItemsFromAirdrops.push({ id: `item_airdrop_candle_${ad.id}`, x: ad.x, y: ad.y, type: ItemType.Candle });
                    candleOnFieldCount++;
                }
            }
            if (settings.screenShake) state.camera = { ...state.camera, shake: { duration: 0.4, intensity: 8 } };
            return false;
        }
        return true;
    });
    state.itemDrops = [...state.itemDrops, ...newItemsFromAirdrops];

    // --- Update Visual Effects ---
    state.visualEffects.forEach(vfx => {
        if (vfx.type === 'shockwave') {
            const currentRadius = vfx.radius * (1 - (vfx.life / vfx.totalLife));
            const shockwaveThickness = 30;
            const distToPlayer = Math.hypot(newPlayer.x - vfx.x, newPlayer.y - vfx.y);
            if (Math.abs(distToPlayer - currentRadius) < (newPlayer.width / 2 + shockwaveThickness / 2)) {
                newPlayer.health -= 20;
                state.floatingTexts = addFloatingText(state.floatingTexts, '20', newPlayer.x, newPlayer.y, settings, '#ef4444');
                if (settings.screenShake) state.camera = { ...state.camera, shake: { duration: 0.3, intensity: 6 } };
            }
        }
        if (vfx.type === 'red_candle_attack') {
            const candleWidth = vfx.radius;
            let isHit = false;
            if (vfx.isVertical) {
                if (Math.abs(newPlayer.x - vfx.x) < (newPlayer.width / 2 + candleWidth / 2)) isHit = true;
            } else {
                if (Math.abs(newPlayer.y - vfx.y) < (newPlayer.height / 2 + candleWidth / 2)) isHit = true;
            }
            if (isHit) {
                const damageThisTick = BOSS_RED_CANDLE_DAMAGE_PER_SEC * delta;
                newPlayer.health -= damageThisTick;
                if (Math.random() < 10 * delta) {
                    state.floatingTexts = addFloatingText(state.floatingTexts, Math.ceil(damageThisTick * 5).toString(), newPlayer.x, newPlayer.y - 20, settings, '#ef4444');
                }
            }
        }
    });
    state.visualEffects = state.visualEffects.map((vfx) => ({ ...vfx, life: vfx.life - delta })).filter((vfx) => vfx.life > 0);

    // --- Item Collection & Activation ---
    state.itemDrops = state.itemDrops.filter(drop => {
        const dist = Math.hypot(newPlayer.x - drop.x, newPlayer.y - drop.y);
        if (dist >= newPlayer.width / 2 + 15) return true;

        if (drop.type === ItemType.DevLock) {
            const lockData = ITEM_DATA[ItemType.DevLock];
            const duration = lockData.duration || 5;
            state.lastSkillUsed = { id: `${Date.now()}`, name: lockData.name, life: 2.0 };
            if (settings.screenShake) state.camera = { ...state.camera, shake: { duration: 0.3, intensity: 8 } };

            state.devLockMode = { timer: duration, duration: duration };

            state.enemies = state.enemies.map(e => {
                const randomMessage = DEV_LOCK_MESSAGES[Math.floor(Math.random() * DEV_LOCK_MESSAGES.length)];
                return {
                    ...e,
                    stun: { duration },
                    chatBubble: { text: randomMessage, duration }
                };
            });
        }
        if (drop.type === ItemType.BONKAura) {
            const bonkData = ITEM_DATA[ItemType.BONKAura];
            const duration = bonkData.duration || 5;
            state.bonkMode = { timer: duration, duration: duration };
            state.lastSkillUsed = { id: `${Date.now()}`, name: bonkData.name, life: 2.0 };
            state.floatingTexts = addFloatingText(state.floatingTexts, 'BONK!!!', newPlayer.x, newPlayer.y - 30, settings, '#ef4444', 2.0);
            if (settings.screenShake) state.camera = { ...state.camera, shake: { duration: 0.5, intensity: 12 } };
        }
        if (drop.type === ItemType.Candle) {
            const chosenVariant: CandleVariant = drop.variant || (() => (Math.random() < 0.65) ? 'West' : (Math.random() < 0.90) ? '奶牛candle' : 'Gake')();
            const candleData = ITEM_DATA[ItemType.Candle].variants![chosenVariant];
            state.lastSkillUsed = { id: `${Date.now()}`, name: candleData.name, life: 2.0 };
            state.activeItems = [...state.activeItems, {
                id: `active_candle_${Date.now()}`, type: ItemType.Candle, variant: chosenVariant, life: candleData.duration, angle: 0,
                length: candleData.length, width: candleData.width, hitEnemyIds: [], rotationSpeed: ((candleData.rotations || 1) * 2 * Math.PI) / candleData.duration,
            } as ActiveCandle];

            switch (chosenVariant) {
                case 'Gake':
                    newPlayer.maxHealth *= 2;
                    newPlayer.health = newPlayer.maxHealth;
                    state.floatingTexts = addFloatingText(state.floatingTexts, 'BALANCE DOUBLED!', newPlayer.x, newPlayer.y - 20, settings, '#34D399');
                    break;
                case 'West':
                    newPlayer.maxHealth += 20;
                    newPlayer.health = Math.min(newPlayer.maxHealth, newPlayer.health + 20);
                    state.floatingTexts = addFloatingText(state.floatingTexts, `+20 U`, newPlayer.x, newPlayer.y - 20, settings, '#34D399');
                    state.floatingTexts = addFloatingText(state.floatingTexts, `Max U +20`, newPlayer.x, newPlayer.y, settings, '#FBBF24');
                    break;
                case '奶牛candle':
                    state.enemies = state.enemies.map(e => ({ ...e, stun: { duration: 0.5 } }));
                    state.enemies.forEach(e => {
                        state.floatingTexts = addFloatingText(state.floatingTexts, '❓', e.x, e.y - e.height, settings, '#FBBF24', 0.5);
                    });
                    break;
            }
        }
        return false;
    });

    // --- Active Item Update ---
    state.activeItems = state.activeItems.map((item: ActiveItem) => {
        let newItem = { ...item, life: item.life - delta };
        if (newItem.type === ItemType.Candle) {
            const candleItem = newItem as ActiveCandle;
            candleItem.angle = (candleItem.angle + candleItem.rotationSpeed * delta) % (2 * Math.PI);
        }
        return newItem;
    }).filter(item => item.life > 0);

    // --- Update Enemies ---
    const hodlerAreaWeapon = newPlayer.weapons.find(w => w.type === WeaponType.HODLerArea);
    state.enemies = state.enemies.map(e => {
        let newE = { ...e, isSlowed: false };
        let currentSpeed = newE.speed;

        if (newE.chatBubble && newE.chatBubble.duration > 0) {
            newE.chatBubble = { ...newE.chatBubble, duration: newE.chatBubble.duration - delta };
        } else if (newE.chatBubble) {
            newE.chatBubble = undefined;
        }

        if (hodlerAreaWeapon) {
            let effectiveLevel = isBonked ? WEAPON_DATA[hodlerAreaWeapon.type].maxLevel + 1 : hodlerAreaWeapon.level;
            const auraData = WEAPON_DATA[WeaponType.HODLerArea];
            const radius = (auraData.radius || 50) + (effectiveLevel - 1) * 15;
            if (Math.hypot(newPlayer.x - newE.x, newPlayer.y - newE.y) < radius) {
                currentSpeed *= 0.90;
                newE.isSlowed = true;
            }
        }
        if (newE.stun && newE.stun.duration > 0) {
            newE.stun = { duration: newE.stun.duration - delta };
        } else {
            newE.stun = undefined;
            if (newE.knockback && newE.knockback.duration > 0) {
                newE.x += newE.knockback.dx * newE.knockback.speed * delta;
                newE.y += newE.knockback.dy * newE.knockback.speed * delta;
                newE.knockback = { ...newE.knockback, duration: newE.knockback.duration - delta };
            } else {
                const dx = newPlayer.x - newE.x; const dy = newPlayer.y - newE.y; const dist = Math.hypot(dx, dy);
                if (dist > 1) { newE.x += (dx / dist) * currentSpeed * delta; newE.y += (dy / dist) * currentSpeed * delta; }
            }
        }
        return newE;
    });

    // --- Damage & Collisions ---
    const activeLaserTarget = state.activeLaser ? state.enemies.find(en => en.id === state.activeLaser!.targetId) : null;
    let newProjectiles: Projectile[] = [];

    state.projectiles.forEach(p => {
        let hit = false;
        if (p.owner === 'player') {
            state.enemies.forEach(e => {
                if (hit || e.health <= 0) return;
                if (Math.hypot(e.x - p.x, e.y - p.y) < e.width / 2 + p.width / 2) {
                    const shillTweetWeapon = newPlayer.weapons.find(w => w.type === WeaponType.ShillTweet);
                    let effectiveLevel = shillTweetWeapon?.level || 1;
                    if (isBonked) effectiveLevel = WEAPON_DATA[WeaponType.ShillTweet].maxLevel + 1;
                    const damage = WEAPON_DATA[WeaponType.ShillTweet].damage + (effectiveLevel - 1) * 8;
                    e.health -= damage;
                    state.floatingTexts = addFloatingText(state.floatingTexts, damage.toString(), e.x, e.y, settings, '#38bdf8');
                    hit = true;
                }
            });
        } else if (p.owner === 'enemy') {
            let distToPlayer = Infinity;
            if (p.isBossProjectile) {
                const x1 = p.x - (p.dx || 0) * p.width / 2, y1 = p.y - (p.dy || 0) * p.width / 2;
                const x2 = p.x + (p.dx || 0) * p.width / 2, y2 = p.y + (p.dy || 0) * p.width / 2;
                const l2 = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
                let t = l2 > 0 ? Math.max(0, Math.min(1, ((newPlayer.x - x1) * (x2 - x1) + (newPlayer.y - y1) * (y2 - y1)) / l2)) : 0;
                distToPlayer = Math.hypot(newPlayer.x - (x1 + t * (x2 - x1)), newPlayer.y - (y1 + t * (y2 - y1)));
            } else {
                distToPlayer = Math.hypot(newPlayer.x - p.x, newPlayer.y - p.y);
            }
            if (distToPlayer < newPlayer.width / 2 + p.height / 2) {
                newPlayer.health -= p.damage;
                state.floatingTexts = addFloatingText(state.floatingTexts, p.damage.toString(), newPlayer.x, newPlayer.y - 20, settings, '#ef4444');
                if (settings.screenShake) state.camera = { ...state.camera, shake: { duration: 0.2, intensity: 4 } };
                hit = true;
            }
        }
        if (!hit && p.x > -50 && p.x < GAME_AREA_WIDTH + 50 && p.y > -50 && p.y < GAME_AREA_HEIGHT + 50) {
            newProjectiles.push(p);
        }
    });
    state.projectiles = newProjectiles;

    const tradingBotWeapon = newPlayer.weapons.find(w => w.type === WeaponType.TradingBot);
    if (tradingBotWeapon) {
        const botData = WEAPON_DATA[WeaponType.TradingBot];
        state.orbitAngle = (state.orbitAngle + (isBonked ? botData.speed * 2 : botData.speed) * delta) % (2 * Math.PI);
    }
    
    let gemsToAdd: ExperienceGem[] = [];
    let itemsToAdd: ItemDrop[] = [];

    state.enemies = state.enemies.filter(e => {
        // HODLer Area Damage
        if (hodlerAreaWeapon) {
            let effectiveLevel = isBonked ? WEAPON_DATA[hodlerAreaWeapon.type].maxLevel + 1 : hodlerAreaWeapon.level;
            const auraData = WEAPON_DATA[WeaponType.HODLerArea];
            const radius = (auraData.radius || 50) + (effectiveLevel - 1) * 15;
            if (Math.hypot(newPlayer.x - e.x, newPlayer.y - e.y) < radius) {
                const damageThisTick = auraData.damage * effectiveLevel * delta;
                e.health -= damageThisTick;
                if (Math.random() < 3 * delta) state.floatingTexts = addFloatingText(state.floatingTexts, Math.ceil((auraData.damage * effectiveLevel) / 3).toString(), e.x + (Math.random() - 0.5) * 10, e.y, settings, '#FFD700');
            }
        }
        
        // Trading Bot Damage
        if (tradingBotWeapon) {
            const botData = WEAPON_DATA[WeaponType.TradingBot];
            if (state.gameTime > (e.lastHitBy[WeaponType.TradingBot] || 0) + (botData.hitCooldown || 0.5)) {
                const numBots = isBonked ? 10 : tradingBotWeapon.level;
                for (let i = 0; i < numBots; i++) {
                    const angle = state.orbitAngle + (i * 2 * Math.PI / numBots);
                    const botX = newPlayer.x + (botData.radius || 80) * Math.cos(angle);
                    const botY = newPlayer.y + (botData.radius || 80) * Math.sin(angle);
                    if (Math.hypot(e.x - botX, e.y - botY) < e.width / 2 + botData.width / 2) {
                        e.health -= botData.damage;
                        state.floatingTexts = addFloatingText(state.floatingTexts, botData.damage.toString(), e.x, e.y, settings, '#6EF8F8');
                        e.lastHitBy[WeaponType.TradingBot] = state.gameTime;
                        break;
                    }
                }
            }
        }

        // Laser Eyes Damage
        if (state.activeLaser && activeLaserTarget) {
            const x1 = newPlayer.x, y1 = newPlayer.y; const x2 = activeLaserTarget.x, y2 = activeLaserTarget.y;
            const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
            const t = Math.max(0, Math.min(1, ((e.x - x1) * (x2 - x1) + (e.y - y1) * (y2 - y1)) / l2));
            const closestX = x1 + t * (x2 - x1); const closestY = y1 + t * (y2 - y1);
            if (Math.hypot(e.x - closestX, e.y - closestY) < (state.activeLaser.width / 2) + (e.width / 2)) {
                const damageThisTick = state.activeLaser.damage * delta;
                e.health -= damageThisTick;
                if (Math.random() < 5 * delta) state.floatingTexts = addFloatingText(state.floatingTexts, Math.ceil(state.activeLaser.damage / 2).toString(), e.x, e.y, settings, '#ff4747');
            }
        }

        // Active Item Damage (Candle)
        state.activeItems.forEach(item => {
            if (e.health > 0 && item.type === ItemType.Candle && !item.hitEnemyIds.includes(e.id)) {
                const candle = item as ActiveCandle;
                const x1 = newPlayer.x, y1 = newPlayer.y;
                const x2 = x1 + Math.cos(candle.angle) * candle.length; const y2 = y1 + Math.sin(candle.angle) * candle.length;
                const l2 = candle.length ** 2;
                const t = Math.max(0, Math.min(1, ((e.x - x1) * (x2 - x1) + (e.y - y1) * (y2 - y1)) / l2));
                const closestX = x1 + t * (x2 - x1); const closestY = y1 + t * (y2 - y1);
                if (Math.hypot(e.x - closestX, e.y - closestY) < (candle.width / 2) + (e.width / 2)) {
                    const damage = candle.variant === '奶牛candle' ? 5 : 10000;
                    const color = candle.variant === '奶牛candle' ? '#FF8C00' : '#34D399';
                    e.health -= damage;
                    state.floatingTexts = addFloatingText(state.floatingTexts, damage.toString(), e.x, e.y, settings, color);
                    item.hitEnemyIds.push(e.id);
                }
            }
        });

        // Player collision
        if (Math.hypot(newPlayer.x - e.x, newPlayer.y - e.y) < newPlayer.width / 2 + e.width / 2) {
            newPlayer.health -= e.damage;
            if (settings.screenShake) state.camera = { ...state.camera, shake: { duration: 0.2, intensity: 4 } };
        }

        if (e.health <= 0) {
            if (e.isBoss) { 
                state.status = GameStatus.Playing;
                state.bossState = null;
                state.marketCap = 71000;
                state.bossHasBeenDefeated = true;
                state.floatingTexts = addFloatingText(state.floatingTexts, 'MARKET STABILIZED', newPlayer.x, newPlayer.y - 40, settings, '#34D399');
                state.floatingTexts = addFloatingText(state.floatingTexts, 'MC BREAKTHROUGH!', newPlayer.x, newPlayer.y, settings, '#FBBF24');
                state.specialEventMessage = { id: `migrated_${Date.now()}`, text: 'Migrated', life: 4.0 };
                itemsToAdd.push({ id: `item_bonk_boss_drop_${e.id}`, x: e.x, y: e.y, type: ItemType.BONKAura });
            }
            gemsToAdd.push({ id: `gem_${e.id}`, x: e.x, y: e.y, value: e.xpValue, isLarge: e.type === EnemyType.RivalWhale }); 
            state.kills++;

            // --- ITEM DROP LOGIC ---
            let itemDropped = false;
            // 1. Check for Dev Lock drop (3% chance)
            if (!state.devLockHasDropped && state.marketCap >= 30000 && Math.random() < 0.03) {
                itemsToAdd.push({ id: `item_devlock_${e.id}`, x: e.x, y: e.y, type: ItemType.DevLock });
                state.devLockHasDropped = true;
                itemDropped = true;
            }

            // 2. If no Dev Lock, check for Candle drop (5% chance)
            if (!itemDropped && Math.random() < ITEM_DROP_CHANCE) {
                if (candleOnFieldCount < 6) {
                    itemsToAdd.push({ id: `item_candle_${e.id}`, x: e.x, y: e.y, type: ItemType.Candle });
                    candleOnFieldCount++;
                }
            }
            return false;
        }
        return true;
    });

    state.gems = [...state.gems, ...gemsToAdd];
    state.itemDrops = [...state.itemDrops, ...itemsToAdd];

    // --- Gem Collection ---
    state.gems = state.gems.filter(gem => {
        if (Math.hypot(newPlayer.x - gem.x, newPlayer.y - gem.y) < newPlayer.width / 2 + 10) {
            newPlayer.xp += gem.value;
            return false;
        }
        return true;
    });

    // --- GAME STATE CHECKS ---
    if (newPlayer.health <= 0 || (state.status === GameStatus.BossFight && state.marketCap <= STARTING_MC)) {
        state.status = GameStatus.GameOver;
    }

    if (state.status !== GameStatus.GameOver) {
        while (newPlayer.xp >= newPlayer.xpToNextLevel) {
            newPlayer.level++;
            newPlayer.xp -= newPlayer.xpToNextLevel;
            newPlayer.xpToNextLevel = LEVEL_THRESHOLDS[newPlayer.level] || Infinity;
            newPlayer.maxHealth += 10;
            newPlayer.health = Math.min(newPlayer.maxHealth, newPlayer.health + 20);
        }
    }

    state.player = newPlayer;
    state.maxBalanceAchieved = Math.max(state.maxBalanceAchieved, newPlayer.health);
    state.marketCap = Math.max(state.marketCap, STARTING_MC); // Clamp final market cap

    // Return the final, updated state
    return state;
};