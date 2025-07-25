import React from 'react';
import { Player, ItemType, GameStatus, WeaponType } from '../../types';
import { ITEM_DATA, CROCODILE_ICON } from '../../constants';

interface HudProps {
    player: Player;
    marketCap: number;
    kills: number;
    status: GameStatus;
    isTouch: boolean;
    lastSkillUsed: { id: string, name: string; life: number } | null;
    specialEventMessage: { id: string, text: string; life: number } | null;
    isBonked: boolean;
    bonkMode: { timer: number; duration: number; } | null;
    devLockMode: { timer: number; duration: number; } | null;
}

const WEAPON_ICONS: Record<WeaponType, string> = {
    [WeaponType.ShillTweet]: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cG9seWdvbiBwb2ludHM9IjEwLDEwIDkwLDUwIDEwLDkwIDI1LDUwIiBmaWxsPSIjMzhiZGY4Ii8+PC9zdmc+",
    [WeaponType.HODLerArea]: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utb3BhY2l0eT0iMC42IiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utb3BhY2l0eT0iMC4zIiBzdHJva2Utd2lkdGg9IjQiLz48L3N2Zz4=",
    [WeaponType.TradingBot]: CROCODILE_ICON,
    [WeaponType.LaserEyes]: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNIDEwIDUwIEMgMTAgMjAsIDkwIDIwLCA5MCA1MCBDIDkwIDgwLCAxMCA4MCwgMTAgNTBaIiBmaWxsPSIjZmZmIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMyIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjI1IiBmaWxsPSIjZjAwIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMTAiIGZpbGw9IiMwMDAiLz48Y2lyY2xlIGN4PSI0NSIgY3k9IjQwIiByPSI4IiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjciLz48L3N2Zz4=",
    [WeaponType.Airdrop]: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNNjAsODBIODVWMzBINjBWNDVINDVWODBIOSIgc3Ryb2tlPSIjODc2MjQxIiBmaWxsPSIjQjU4NDU5IiBzdHJva2Utd2lkdGg9IjYiLz48cGF0aCBkPSJNMjUsMzAgaDIwIHYtMjAgYTEwIDEwIDAgMSAxIDIwIDAgdjIwIGgyMCIgc3Ryb2tlPSIjRUZFRkZGIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==",
};

export const Hud: React.FC<HudProps> = ({ player, marketCap, kills, status, isTouch, lastSkillUsed, specialEventMessage, isBonked, bonkMode, devLockMode }) => {
    const { health, maxHealth, xp, xpToNextLevel, level, weapons } = player;
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

                    {/* Acquired Weapons Display */}
                    <div className="mt-2 flex justify-center items-center gap-2 flex-wrap px-2">
                        {weapons
                            .slice()
                            .sort((a, b) => a.type.localeCompare(b.type))
                            .map(weapon => (
                                <div key={weapon.type} className="flex items-center gap-1.5 bg-gray-900/50 p-1 rounded-md border border-gray-600 backdrop-blur-sm">
                                    <img src={WEAPON_ICONS[weapon.type]} alt={weapon.type} className="w-6 h-6" style={{ imageRendering: 'pixelated' }} />
                                    <span className={`text-sm font-bold pr-1 ${isBonked ? 'text-red-400 animate-pulse' : 'text-yellow-300'}`}>
                                        {isBonked ? 'BONK' : `L${weapon.level}`}
                                    </span>
                                </div>
                        ))}
                    </div>

                    {/* BONK Mode Timer Bar */}
                    {bonkMode && (
                        <div className="mt-2 w-full max-w-[240px] mx-auto">
                            <div className="text-center text-sm font-bold text-red-400 animate-pulse">BONK MODE</div>
                            <div className="w-full bg-gray-700 rounded-full h-2.5 border border-gray-600">
                                <div
                                    className="bg-red-500 h-full rounded-full"
                                    style={{ width: `${(bonkMode.timer / bonkMode.duration) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                    
                    {/* DEV LOCK Timer Bar */}
                    {devLockMode && (
                        <div className="mt-2 w-full max-w-[240px] mx-auto">
                            <div className="text-center text-sm font-bold text-yellow-400 animate-pulse">DEV LOCK ACTIVE</div>
                            <div className="w-full bg-gray-700 rounded-full h-2.5 border border-gray-600">
                                <div
                                    className="bg-yellow-400 h-full rounded-full"
                                    style={{ width: `${(devLockMode.timer / devLockMode.duration) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Activated Skill Name & Special Events */}
                    <div className="relative h-20 pointer-events-none -mb-4">
                        {lastSkillUsed && (
                            <div 
                                key={lastSkillUsed.id} // Re-triggers animation on new use
                                className="absolute inset-0 flex items-center justify-center animate-skill-pop"
                            >
                                <h3 className="font-cinzel text-5xl text-green-400 text-shadow">
                                    {lastSkillUsed.name}
                                </h3>
                            </div>
                        )}
                        {specialEventMessage && (
                            <div 
                                key={specialEventMessage.id} // Re-triggers animation on new use
                                className="absolute inset-0 flex items-center justify-center animate-skill-pop"
                            >
                                <h3 className="font-cinzel text-6xl text-yellow-300 text-shadow">
                                    {specialEventMessage.text}
                                </h3>
                            </div>
                        )}
                    </div>
                </div>

                {status === GameStatus.BossFight && (
                     <div className="absolute top-32 left-1/2 -translate-x-1/2">
                        <p className="text-5xl font-cinzel text-red-500 animate-pulse text-shadow">WARNING: MIGRATING BOSS</p>
                     </div>
                )}
            </div>
        </>
    );
};