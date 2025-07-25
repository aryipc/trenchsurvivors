import React from 'react';
import { Player } from '../types';
import { SHIBA_HELMET_ICON, GROUND_CRACK_ICON } from '../constants';

interface PlayerProps {
    player: Player;
    auraRadius: number;
    isBonked: boolean;
}

const PlayerComponent: React.FC<PlayerProps> = ({ player, auraRadius, isBonked }) => {
    const style: React.CSSProperties = {
        left: player.x - player.width / 2,
        top: player.y - player.height / 2,
        width: player.width,
        height: player.height,
    };

    const auraStyle: React.CSSProperties = {
      width: auraRadius * 2,
      height: auraRadius * 2,
      left: player.x - auraRadius,
      top: player.y - auraRadius,
    };

    const iconSrc = player.avatarUrl || SHIBA_HELMET_ICON;
    const useDefaultIcon = !player.avatarUrl;

    return (
        <>
            {auraRadius > 0 && (
                <>
                    {/* Always render the base aura if the weapon is active */}
                    <div
                        className="absolute bg-yellow-400/20 rounded-full border-2 border-yellow-300 animate-pulse-aura"
                        style={auraStyle}
                    ></div>
                    {/* Add a shimmering blue ring to signify the slow effect */}
                    <div
                        className="absolute rounded-full border-2 border-cyan-300 animate-pulse-slow"
                        style={{ ...auraStyle, boxShadow: 'inset 0 0 15px 2px rgba(34, 211, 238, 0.3), 0 0 15px 2px rgba(34, 211, 238, 0.3)' }}
                    ></div>
                    
                    {/* Conditionally render the bonk effect on top */}
                    {isBonked && (
                         <div
                            className="absolute animate-bonk-crack"
                            style={auraStyle}
                        >
                            <img src={GROUND_CRACK_ICON} alt="Bonk Effect" className="w-full h-full" />
                        </div>
                    )}
                </>
            )}
            <div className="absolute z-10" style={style}>
                {/* This outer div creates the circular frame and clips the inner content. */}
                <div
                    className="w-full h-full rounded-full bg-gray-700 border-2 border-yellow-300 overflow-hidden flex items-center justify-center"
                >
                    <img
                        src={iconSrc}
                        alt="Player"
                        className="w-full h-full object-cover"
                        style={{ transform: useDefaultIcon ? 'scale(1.4)' : 'none' }}
                    />
                </div>
            </div>
        </>
    );
};

export default React.memo(PlayerComponent);