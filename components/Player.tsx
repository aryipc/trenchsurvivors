
import React from 'react';
import { Player } from '../types';
import { SHIBA_HELMET_ICON } from '../constants';

interface PlayerProps {
    player: Player;
    auraRadius: number;
}

const PlayerComponent: React.FC<PlayerProps> = ({ player, auraRadius }) => {
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
                <div 
                    className="absolute bg-yellow-400/20 rounded-full border-2 border-yellow-300 animate-pulse-aura"
                    style={auraStyle}
                ></div>
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
