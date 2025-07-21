

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

    const useDefaultIcon = !player.avatarUrl;

    // Use a background image for the default icon to get better control over size and position.
    // This avoids transform/scaling issues and ensures perfect centering.
    const iconContainerStyle: React.CSSProperties = useDefaultIcon
        ? {
              backgroundImage: `url(${SHIBA_HELMET_ICON})`,
              backgroundSize: '140%', // Make the icon appear larger inside the circle
              backgroundPosition: 'center', // Vertically and horizontally center the logo
              backgroundRepeat: 'no-repeat',
          }
        : {};

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
                    className="w-full h-full rounded-full bg-gray-700 border-2 border-yellow-300 overflow-hidden"
                    style={iconContainerStyle}
                >
                    {/* Only render the img tag for user avatars, not for the default icon */}
                    {!useDefaultIcon && (
                         <img 
                            src={player.avatarUrl} 
                            alt="Player" 
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default React.memo(PlayerComponent);