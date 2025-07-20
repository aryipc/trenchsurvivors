

import React from 'react';
import { Player } from '../types';

interface PlayerProps {
    player: Player;
    auraRadius: number;
}

const PLAYER_SVG_BASE64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0iI0Y5RTA0QyIvPjxyZWN0IHg9IjIwIiB5PSI0MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjI1IiByeD0iMTAiIGZpbGw9IiMyMjIiLz48cmVjdCB4PSIyNSIgeT0iNDUiIHdpZHRoPSIyMiIgaGVpZ2h0PSIxNSIgZmlsbD0iIzU1NSIvPjxyZWN0IHg9IjUzIiB5PSI0NSIgd2lkdGg9IjIyIiBoZWlnaHQ9IjE1IiBmaWxsPSIjNTU1Ii8+PHBhdGggZD0iTTMwIDc1IFEgNTAgODUgNzAgNzUiIHN0cm9rZT0iIzIyMiIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=";

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

    return (
        <>
            {auraRadius > 0 && (
                <div 
                    className="absolute bg-yellow-400/20 rounded-full border-2 border-yellow-300 animate-pulse-aura"
                    style={auraStyle}
                ></div>
            )}
            <div className="absolute z-10" style={style}>
                <img 
                    src={player.avatarUrl || PLAYER_SVG_BASE64} 
                    alt="Player" 
                    className="w-full h-full rounded-full bg-gray-700 border-2 border-yellow-300 object-cover" 
                />
            </div>
        </>
    );
};

export default React.memo(PlayerComponent);