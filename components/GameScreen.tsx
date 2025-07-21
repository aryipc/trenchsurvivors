
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


const AIRDROP_CRATE_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNNjAsODBIODVWMzBINjBWNDVINDVWODBIOSIgc3Ryb2tlPSIjODc2MjQxIiBmaWxsPSIjQjU4NDU5IiBzdHJva2Utd2lkdGg9IjYiLz48cGF0aCBkPSJNMjUsMzAgaDIwIHYtMjAgYTEwIDEwIDAgMSAxIDIwIDAgdjIwIGgyMCIgc3Ryb2tlPSIjRUZFRkZGIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==";
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
        left: effect.x,
        top: effect.y,
        pointerEvents: 'none',
        transformOrigin: 'center',
    };

    switch(effect.type) {
        case 'explosion': {
            const currentRadius = effect.radius * Math.sin(progress * Math.PI / 2); // Ease-out effect
            const opacity = 1 - progress;
            const style: React.CSSProperties = {
                ...baseStyle,
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
        default:
            return null;
    }
});

const LaserBeamComponent: React.FC<{player: Player, beam: LaserBeam, enemies: Enemy[]}> = React.memo(({ player, beam, enemies }) => {
    const target = enemies.find(e => e.id === beam.targetId);
    if (!target) return null;

    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const style: React.CSSProperties = {
        position: 'absolute',
        left: player.x,
        top: player.y,
        width: length,
        height: beam.width,
        backgroundColor: 'rgba(255, 20, 20, 0.6)',
        boxShadow: '0 0 15px 5px rgba(255, 50, 50, 0.4)',
        transformOrigin: '0% 50%',
        transform: `translateY(-${beam.width / 2}px) rotate(${angle}rad)`,
        borderRadius: '5px',
        pointerEvents: 'none',
    };
    return <div style={style} />;
});

const ItemDropComponent: React.FC<{ drop: ItemDrop }> = React.memo(({ drop }) => {
    if (drop.type !== ItemType.Candle) return null; // Good practice for future items
    const candleData = ITEM_DATA[ItemType.Candle];

    // Determine glow color based on the variant
    const isGakeCandle = drop.variant === 'Gake';
    const glowColor = isGakeCandle ? '#FBBF24' : '#10B981'; // Yellow for Gake, Green for others

    const style: React.CSSProperties = {
        left: drop.x - 12,
        top: drop.y - 20,
        width: 24,
        height: 40,
        filter: `drop-shadow(0 0 8px ${glowColor})`,
    };
    return (
        <div className="absolute animate-pulse" style={style}>
            <img src={candleData.svg} alt="Candle Item" className="w-full h-full" />
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
    const { player, enemies, projectiles, gems, floatingTexts, airdrops, visualEffects, itemDrops, activeItems, camera, orbitAngle, activeLaser } = gameState;

    const zoom = isTouch ? 0.75 : 1.0;

    const gameAreaStyle: React.CSSProperties = {
        width: `${GAME_AREA_WIDTH}px`,
        height: `${GAME_AREA_HEIGHT}px`,
        transform: `scale(${zoom}) translate(${-camera.x}px, ${-camera.y}px)`,
        transformOrigin: 'top left',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23374151\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    };

    const hodlerAreaWeapon = player.weapons.find(w => w.type === WeaponType.HODLerArea);
    const auraRadius = hodlerAreaWeapon ? (WEAPON_DATA[WeaponType.HODLerArea].radius || 50) + (hodlerAreaWeapon.level - 1) * 15 : 0;
    
    const tradingBotWeapon = player.weapons.find(w => w.type === WeaponType.TradingBot);

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute transition-transform duration-100 ease-linear" style={gameAreaStyle}>
                {activeLaser && <LaserBeamComponent player={player} beam={activeLaser} enemies={enemies} />}
                <PlayerComponent player={player} auraRadius={auraRadius} />
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
                 {tradingBotWeapon && Array.from({ length: tradingBotWeapon.level }).map((_, i) => {
                    const botData = WEAPON_DATA[WeaponType.TradingBot];
                    const angle = orbitAngle + (i * 2 * Math.PI / tradingBotWeapon.level);
                    const x = player.x + (botData.radius || 80) * Math.cos(angle);
                    const y = player.y + (botData.radius || 80) * Math.sin(angle);
                    const icon = TRADING_BOT_ICONS[i % TRADING_BOT_ICONS.length];
                    return <TradingBotComponent key={`bot_${i}`} x={x} y={y} size={botData.width} angle={0} icon={icon} />;
                })}
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
