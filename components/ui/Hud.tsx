
import React from 'react';
import { Player, ItemType, GameStatus } from '../../types';
import { ITEM_DATA } from '../../constants';

interface HudProps {
    player: Player;
    marketCap: number;
    kills: number;
    status: GameStatus;
    isTouch: boolean;
    onUseItem: () => void;
}

export const Hud: React.FC<HudProps> = ({ player, marketCap, kills, status, isTouch, onUseItem }) => {
    const { health, maxHealth, xp, xpToNextLevel, level, heldItem } = player;
    const healthPercentage = (health / maxHealth) * 100;
    const xpPercentage = (xp / xpToNextLevel) * 100;
    
    const formatMarketCap = (value: number) => {
        return `$${Math.floor(value).toLocaleString()}`;
    };

    return (
        <>
            <div className="absolute top-0 left-0 right-0 p-4 text-white z-10 pointer-events-none">
                <div className="flex justify-center items-center mb-2 flex-col">
                    <span className="text-sm font-bold text-yellow-300 tracking-widest">MARKET CAP</span>
                    <span className="text-4xl font-cinzel text-shadow">{formatMarketCap(marketCap)}</span>
                </div>
                <div className="max-w-4xl mx-auto">
                     {/* Top row stats */}
                    <div className="flex justify-between items-center text-lg mb-2 px-2 text-shadow">
                        <span>Hype Level: {level}</span>
                        <span>Flipped: {kills}</span>
                    </div>

                    {/* Health Bar (Balance) */}
                    <div className="w-full bg-gray-700 rounded-full h-4 border-2 border-gray-600 relative">
                        <div
                            className="bg-green-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${healthPercentage}%` }}
                        ></div>
                        <div className="absolute w-full text-center top-1/2 -translate-y-1/2 text-xs font-bold text-shadow">{Math.ceil(health)} / {maxHealth} Balance (U)</div>
                    </div>

                    {/* XP Bar (Hype) */}
                    <div className="w-full bg-gray-700 rounded-full h-3 mt-1 border border-gray-600 relative">
                        <div
                            className="bg-blue-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${xpPercentage}%` }}
                        ></div>
                         <div className="absolute w-full text-center top-1/2 -translate-y-1/2 text-xs font-bold text-shadow">{Math.floor(xp)} / {xpToNextLevel} Hype</div>
                    </div>
                </div>

                {status === GameStatus.BossFight && (
                     <div className="absolute top-32 left-1/2 -translate-x-1/2">
                        <p className="text-5xl font-cinzel text-red-500 animate-pulse text-shadow">WARNING: MIGRATING BOSS</p>
                     </div>
                )}
            </div>

            {/* Held Item Display */}
            {heldItem?.type === ItemType.Candle && heldItem.variant && !isTouch && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-10 text-shadow">
                    <div className="bg-black/70 px-4 py-1.5 rounded-full text-white font-bold border-2 border-gray-500">
                        {ITEM_DATA[ItemType.Candle].variants![heldItem.variant].name.toUpperCase()} - PRESS <span className="text-yellow-300 mx-1">SPACE</span> TO USE
                    </div>
                    <div className="w-14 h-20 bg-gray-800 border-4 border-yellow-300 rounded-lg shadow-lg flex flex-col items-center justify-center p-1 relative overflow-hidden">
                        <img
                            src={ITEM_DATA[ItemType.Candle].svg}
                            alt={ITEM_DATA[ItemType.Candle].variants![heldItem.variant].name}
                            className="h-16 w-auto"
                            style={{ filter: 'drop-shadow(0 0 5px #10B981)'}}
                        />
                    </div>
                </div>
            )}

            {/* Mobile Action Button */}
            {isTouch && heldItem?.type === ItemType.Candle && heldItem.variant && (
                 <div className="absolute bottom-[92px] right-12 z-50">
                    <button
                        onTouchStart={(e) => {
                            e.preventDefault();
                            onUseItem();
                        }}
                        className="w-24 h-24 bg-gray-800/80 border-4 border-yellow-300 rounded-full shadow-lg flex items-center justify-center active:bg-yellow-400/50"
                        aria-label="Use Item"
                    >
                        <img
                            src={ITEM_DATA[ItemType.Candle].svg}
                            alt={ITEM_DATA[ItemType.Candle].variants![heldItem.variant].name}
                            className="h-14 w-auto"
                            style={{ filter: 'drop-shadow(0 0 5px #10B981)'}}
                        />
                    </button>
                </div>
            )}
        </>
    );
};