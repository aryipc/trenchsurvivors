
import React from 'react';
import { GameState, Enemy, Projectile, ExperienceGem, WeaponType, FloatingText, Airdrop, VisualEffect, Player, LaserBeam, ItemDrop, ItemType, ActiveCandle, ActiveItem } from '../types';
import PlayerComponent from './Player';
import EnemyComponent from './Enemy';
import ProjectileComponent from './Projectile';
import ExperienceGemComponent from './ExperienceGem';
import { GAME_AREA_WIDTH, GAME_AREA_HEIGHT, WEAPON_DATA, ITEM_DATA, CROCODILE_ICON } from '../constants';

interface GameScreenProps {
    gameState: GameState;
    isTouch: boolean;
}

const FloatingTextComponent: React.FC<{text: FloatingText}> = ({ text }) => {
    const style: React.CSSProperties = {
        left: text.x,
        top: text.y,
        color: text.color,
        textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
    };
    return <div className="absolute font-bold text-lg pointer-events-none animate-float-up" style={style}>{text.text}</div>;
};

const TRADING_BOT_ICONS = [
    { svg: CROCODILE_ICON, shadow: '#60a5fa' }, // blue-400
    { svg: CROCODILE_ICON, shadow: '#93c5fd' }, // blue-300
    { svg: CROCODILE_ICON, shadow: '#bfdbfe' }, // blue-200
];

interface TradingBotProps {
    x: number;
    y: number;
    size: number;
    angle: number;
    icon: {
        svg: string;
        shadow: string;
    };
}

const TradingBotComponent: React.FC<TradingBotProps> = React.memo(({ x, y, size, angle, icon }) => {
    const style: React.CSSProperties = {
        left: x - size / 2, top: y - size / 2, width: size, height: size,
        imageRendering: 'pixelated', // Keep the pixel art crisp
        filter: `drop-shadow(0 0 8px ${icon.shadow})`
    };
    return <div className="absolute" style={style}><img src={icon.svg} alt="Trading Bot" className="w-full h-full" /></div>;
});


const AIRDROP_CRATE_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjQTlCOEM1Ij48cGF0aCBkPSJNMTUsNTAgQzE1LDI3LjkgMzAuNywxMCA1MCwxMCBDNjkuMywxMCA4NSwyNy45IDg1LDUwWiIvPjxyZWN0IHg9IjQ1IiB5PSI1MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjI1IiAvPjwvc3ZnPg==";
const AirdropComponent: React.FC<{airdrop: Airdrop}> = React.memo(({ airdrop }) => {
    const fallProgress = 1 - (airdrop.fallTimer / airdrop.totalFallTime);
    const currentY = airdrop.startY + (airdrop.y - airdrop.startY) * fallProgress;
    const airdropData = WEAPON_DATA[WeaponType.Airdrop];
    const style: React.CSSProperties = {
        left: airdrop.x - airdropData.width / 2,
        top: currentY - airdropData.height / 2,
        width: airdropData.width,
        height: airdropData.height
    };
     const shadowStyle: React.CSSProperties = {
        left: airdrop.x - 15,
        top: airdrop.y - 7,
        width: 30,
        height: 15,
        transform: `scale(${fallProgress * 1.2})`,
        opacity: fallProgress * 0.7
    };

    return (
        <>
           <div className="absolute bg-black rounded-full" style={shadowStyle}></div>
           <div className="absolute" style={style}>
              <img src={AIRDROP_CRATE_SVG} alt="Airdrop" className="w-full h-full"/>
           </div>
        </>
    );
});


const VisualEffectComponent: React.FC<{effect: VisualEffect}> = React.memo(({ effect }) => {
    const progress = 1 - (effect.life / effect.totalLife);
    
    const baseStyle: React.CSSProperties = {
        position: 'absolute',
        pointerEvents: 'none',
        transformOrigin: 'center',
    };

    switch(effect.type) {
        case 'explosion': {
            const currentRadius = effect.radius * Math.sin(progress * Math.PI / 2); // Ease-out effect
            const opacity = 1 - progress;
            const style: React.CSSProperties = {
                ...baseStyle,
                left: effect.x,
                top: effect.y,
                width: currentRadius * 2,
                height: currentRadius * 2,
                marginLeft: -currentRadius,
                marginTop: -currentRadius,
                backgroundColor: effect.color,
                borderRadius: '50%',
                opacity: opacity * 0.8,
            };
            return <div style={style} />;
        }
        case 'airdrop_target': {
            const timeElapsed = effect.totalLife - effect.life;
            const opacity = 0.6 + Math.sin(timeElapsed * 15) * 0.3; // Flashing effect
            const style: React.CSSProperties = {
                ...baseStyle,
                left: effect.x,
                top: effect.y,
                width: effect.radius * 2,
                height: effect.radius * 2,
                marginLeft: -effect.radius,
                marginTop: -effect.radius,
                border: `5px dashed ${effect.color}`,
                borderRadius: '50%',
                opacity: opacity,
            };
            return <div style={style} />;
        }
        case 'shockwave': {
            const currentRadius = effect.radius * progress; // Linear expansion
            const opacity = 1 - progress;
             const style: React.CSSProperties = {
                ...baseStyle,
                left: effect.x,
                top: effect.y,
                width: currentRadius * 2,
                height: currentRadius * 2,
                marginLeft: -currentRadius,
                marginTop: -currentRadius,
                border: `10px solid ${effect.color}`,
                borderRadius: '50%',
                opacity: opacity,
                boxShadow: `0 0 30px 10px ${effect.color}44`
            };
            return <div style={style} />;
        }
        case 'red_candle_warning': {
            const width = effect.isVertical ? effect.radius : GAME_AREA_WIDTH;
            const height = effect.isVertical ? GAME_AREA_HEIGHT : effect.radius;
            const x = effect.isVertical ? effect.x - effect.radius / 2 : 0;
            const y = effect.isVertical ? 0 : effect.y - effect.radius / 2;
            const opacity = 0.5 + Math.sin((effect.totalLife - effect.life) * 10) * 0.2; // pulse
            
            const style: React.CSSProperties = {
                ...baseStyle,
                left: x,
                top: y,
                width: width,
                height: height,
                backgroundColor: 'rgba(239, 68, 68, 0.2)', // red-500 with alpha
                border: `3px dashed ${effect.color}`,
                opacity: opacity,
            };
            return <div style={style} />;
        }
        case 'red_candle_attack': {
            const width = effect.isVertical ? effect.radius : GAME_AREA_WIDTH;
            const height = effect.isVertical ? GAME_AREA_HEIGHT : effect.radius;
            const x = effect.isVertical ? effect.x - effect.radius / 2 : 0;
            const y = effect.isVertical ? 0 : effect.y - effect.radius / 2;
            const intensity = Math.sin(progress * Math.PI); // Fades in and out

            const style: React.CSSProperties = {
                ...baseStyle,
                left: x,
                top: y,
                width: width,
                height: height,
                backgroundColor: `rgba(239, 68, 68, ${intensity * 0.6})`, // red-500
                boxShadow: `inset 0 0 40px rgba(255, 100, 100, ${intensity * 0.8})`,
            };
            return <div style={style} />;
        }
        default:
            return null;
    }
});

interface LaserBeamProps {
    player: Player;
    beam: LaserBeam;
    enemies: Enemy[];
    isBonked: boolean;
}

const LaserBeamComponent: React.FC<LaserBeamProps> = React.memo(({ player, beam, enemies, isBonked }) => {
    const target = enemies.find(e => e.id === beam.targetId);
    if (!target) return null;

    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const baseStyle: React.CSSProperties = {
        position: 'absolute',
        left: player.x,
        top: player.y,
        width: length,
        height: beam.width,
        transformOrigin: '0% 50%',
        transform: `translateY(-${beam.width / 2}px) rotate(${angle}rad)`,
        borderRadius: '5px',
        pointerEvents: 'none',
    };

    if (isBonked) {
        const bonkStyle: React.CSSProperties = {
            ...baseStyle,
            backgroundImage: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)',
            boxShadow: '0 0 15px 5px rgba(255, 255, 255, 0.6)',
        };
        return <div style={bonkStyle} className="animate-rainbow-laser" />;
    }

    const regularStyle: React.CSSProperties = {
        ...baseStyle,
        backgroundColor: 'rgba(255, 20, 20, 0.6)',
        boxShadow: '0 0 15px 5px rgba(255, 50, 50, 0.4)',
    };
    
    return <div style={regularStyle} />;
});


const ItemDropComponent: React.FC<{ drop: ItemDrop }> = React.memo(({ drop }) => {
    const itemData = ITEM_DATA[drop.type];
    if (!itemData) return null;

    let glowColor = '#FFFFFF'; // Default white glow
    let width = 32;
    let height = 32;

    switch (drop.type) {
        case ItemType.Candle:
            width = 24;
            height = 40;
            const isGakeCandle = drop.variant === 'Gake';
            glowColor = isGakeCandle ? '#FBBF24' : '#10B981'; // Yellow for Gake, Green for others
            break;
        case ItemType.BONKAura:
            width = 40;
            height = 40;
            glowColor = '#EF4444'; // Red glow
            break;
        case ItemType.DevLock:
            width = 35;
            height = 35;
            glowColor = '#facc15'; // yellow-400
            break;
    }

    const style: React.CSSProperties = {
        left: drop.x - width / 2,
        top: drop.y - height / 2,
        width: width,
        height: height,
        filter: `drop-shadow(0 0 10px ${glowColor})`,
    };

    return (
        <div className="absolute animate-pulse" style={style}>
            <img src={itemData.svg} alt={itemData.name} className="w-full h-full" />
        </div>
    );
});


const ActiveCandleComponent: React.FC<{ item: ActiveCandle, player: Player }> = React.memo(({ item, player }) => {
    const style: React.CSSProperties = {
        position: 'absolute',
        left: player.x,
        top: player.y,
        width: item.length,
        height: item.width,
        backgroundColor: 'rgba(16, 185, 129, 0.7)', // green-500 with alpha
        boxShadow: '0 0 15px 5px rgba(16, 185, 129, 0.5)',
        transformOrigin: '0% 50%',
        transform: `translateY(-${item.width / 2}px) rotate(${item.angle}rad)`,
        borderRadius: '5px',
        pointerEvents: 'none',
    };
    return <div style={style} />;
});

const GameScreen: React.FC<GameScreenProps> = ({ gameState, isTouch }) => {
    const { player, enemies, projectiles, gems, floatingTexts, airdrops, visualEffects, itemDrops, activeItems, camera, orbitAngle, activeLaser, bonkMode } = gameState;

    const zoom = isTouch ? 0.75 : 1.0;

    const gameAreaStyle: React.CSSProperties = {
        width: `${GAME_AREA_WIDTH}px`,
        height: `${GAME_AREA_HEIGHT}px`,
        transform: `scale(${zoom}) translate(${-camera.x}px, ${-camera.y}px)`,
        transformOrigin: 'top left',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23374151\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    };
    
    const isBonked = bonkMode !== null;

    const hodlerAreaWeapon = player.weapons.find(w => w.type === WeaponType.HODLerArea);
    const auraRadius = hodlerAreaWeapon ? (WEAPON_DATA[WeaponType.HODLerArea].radius || 50) + (hodlerAreaWeapon.level - 1) * 15 : 0;
    
    const tradingBotWeapon = player.weapons.find(w => w.type === WeaponType.TradingBot);

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute transition-transform duration-100 ease-linear" style={gameAreaStyle}>
                {activeLaser && <LaserBeamComponent player={player} beam={activeLaser} enemies={enemies} isBonked={isBonked} />}
                <PlayerComponent player={player} auraRadius={auraRadius} isBonked={isBonked} />
                {enemies.map((enemy: Enemy) => (
                    <EnemyComponent key={enemy.id} enemy={enemy} />
                ))}
                {projectiles.map((p: Projectile) => (
                    <ProjectileComponent key={p.id} projectile={p} />
                ))}
                {gems.map((gem: ExperienceGem) => (
                    <ExperienceGemComponent key={gem.id} gem={gem} />
                ))}
                {itemDrops.map((drop: ItemDrop) => (
                    <ItemDropComponent key={drop.id} drop={drop} />
                ))}
                {activeItems.map((item: ActiveItem) => {
                    if (item.type === ItemType.Candle) {
                        return <ActiveCandleComponent key={item.id} item={item} player={player} />;
                    }
                    return null;
                })}
                 {tradingBotWeapon && (() => {
                    const numBots = isBonked ? 10 : tradingBotWeapon.level;
                    return Array.from({ length: numBots }).map((_, i) => {
                        const botData = WEAPON_DATA[WeaponType.TradingBot];
                        const angle = orbitAngle + (i * 2 * Math.PI / numBots);
                        const x = player.x + (botData.radius || 80) * Math.cos(angle);
                        const y = player.y + (botData.radius || 80) * Math.sin(angle);
                        const icon = TRADING_BOT_ICONS[i % TRADING_BOT_ICONS.length];
                        return <TradingBotComponent key={`bot_${i}`} x={x} y={y} size={botData.width} angle={0} icon={icon} />;
                    });
                })()}
                {airdrops.map((ad: Airdrop) => (
                    <AirdropComponent key={ad.id} airdrop={ad} />
                ))}
                {visualEffects.map((vfx: VisualEffect) => (
                    <VisualEffectComponent key={vfx.id} effect={vfx} />
                ))}
                {floatingTexts.map((ft: FloatingText) => (
                    <FloatingTextComponent key={ft.id} text={ft} />
                ))}
            </div>
        </div>
    );
};

export default GameScreen;
