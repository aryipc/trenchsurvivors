





import React from 'react';
import { Enemy, EnemyType } from '../types';
import { ENEMY_DATA } from '../constants';

interface EnemyProps {
    enemy: Enemy;
}

const ENEMY_SVGS: Record<string, string> = {
    [`${EnemyType.FUD}_1`]: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMjAsNzAgQzEwLDUwIDE1LDI1IDMwLDIwIEM0MCwxNSA2MCwxNSA3MCwyMCBDODUsMjUgOTAsNTAgODAsNzAgQzkwLDgwIDgwLDk1IDY1LDkwIEwzNSw5MCBDMjAsOTUgMTAsODAgMjAsNzAgWiIgZmlsbD0iI0EwNTIyRCIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iNDUiIHI9IjUiIGZpbGw9ImJsYWNrIi8+PGNpcmNsZSBjeD0iNjUiIGN5PSI0NSIgcj0iNSIgZmlsbD0iYmxhY2siLz48cGF0aCBkPSJNNDUsNjUgUTUwLDc1IDU1LDY1IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjQiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjUiIHI9IjEyIiBmaWxsPSIjQTA1MjJEIi8+PGNpcmNsZSBjeD0iODAiIGN5PSIyNSIgcj0iMTIiIGZpbGw9IiNBNTAyMkQiLz48L3N2Zz4=",
    [`${EnemyType.FUD}_2`]: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMjAsNzAgQzEwLDUwIDE1LDI1IDMwLDIwIEM0MCwxNSA2MCwxNSA3MCwyMCBDODUsMjUgOTAsNTAgODAsNzAgQzkwLDgwIDgwLDk1IDY1LDkwIEwzNSw5MCBDMjAsOTUgMTAsODAgMjAsNzAgWiIgZmlsbD0iIzZCMzcxRCIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iNDUiIHI9IjUiIGZpbGw9ImJsYWNrIi8+PGNpcmNsZSBjeD0iNjUiIGN5PSI0NSIgcj0iNSIgZmlsbD0iYmxhY2siLz48cGF0aCBkPSJNNDUsNjUgUTUwLDc1IDU1LDY1IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjQiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjUiIHI9IjEyIiBmaWxsPSIjNkIzNzFEIi8+PGNpcmNsZSBjeD0iODAiIGN5PSIyNSIgcj0iMTIiIGZpbGw9IiM2QjM3MUQiLz48L3N2Zz4=",
    [`${EnemyType.PaperHands}_1`]: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMjAsMjAgTDgwLDI1IEwgNzUsODAgTDI1LDc1IFoiIGZpbGw9IiNDQ0MiIHN0cm9rZT0iIzk5OSIgc3Ryb2tlLXdpZHRoPSIzIi8+PHBhdGggZD0iTTgwLDI1IEw3OCw0NSBMNTAsNDAgTDQ4LDMwIHogTTI1LDc1IEwzMCw1NSBMNTUsNjAgTDQ1LDcwIHoiIGZpbGw9IiNEREQiLz48cGF0aCBkPSJNMzUsMzUgQzQ1LDI1LDU1LDI1LDY1LDM1IiBmaWxsPSJub25lIiBzdHJva2U9IiMxMTIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTQ1LDYwIEw1NSw2MCIgc3Ryb2tlPSIjMTExIiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==",
    [`${EnemyType.PaperHands}_2`]: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMjAsMjAgTDgwLDI1IEwgNzUsODAgTDI1LDc1IFoiIGZpbGw9IiNhMGEwYTAiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIzIi8+PHBhdGggZD0iTTgwLDI1IEw3OCw0NSBMNTAsNDAgTDQ4LDMwIHogTTI1LDc1IEwzMCw1NSBMNTUsNjAgTDQ1LDcwIHoiIGZpbGw9IiNiMGIwYjAiLz48cGF0aCBkPSJNMzUsMzUgQzQ1LDI1LDU1LDI1LDY1LDM1IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTQ1LDYwIEw1NSw2MCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==",
    [`${EnemyType.RivalWhale}_1`]: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMTAgNTBDOCAzMCAzMCwxMCA1MCwxMUM3MCwxMCA5MiwyNSA5MCA1MEM5NSw4MCA2NSw5NSA1MCw5NUMzNSw5NSAxMiw3NSAxMCA1MFoiIGZpbGw9IiMxRTQxN0YiLz48cGF0aCBkPSJNMTAgNTBDMTUgNTUgMjAgNTIgMjUgNTdMMjUgNzBINyBaIiBmaWxsPSIjN0JBQ0UyIi8+PGNpcmNsZSBjeD0iNzUiIGN5PSIzNSIgcj0iOCIgZmlsbD0id2hpdGUiLz48Y2lyY2xlIGN4PSI3NyIgY3k9IjM1IiByPSI0IiBmaWxsPSJibGFjayIvPjxsaW5lIHgxPSI5MCIgeTE9IjUwIiB4Mj0iODUiIHkyPSI3MCIgc3Ryb2tlPSIjN0JBQ0UyIiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=",
    [`${EnemyType.MigratingBoss}_1`]: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQxIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzJkMzc0ODtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxYTIwMmM7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48ZmlsdGVyIGlkPSJnbG93Ij48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIzLjUiIHJlc3VsdD0iY29sb3JlZEJsdXIiLz48ZmVNZXJnZT48ZmVNZXJnZU5vZGUgaW49ImNvbG9yZWRCbHVyIi8+PGZlTWVyZ2VOb2RlIGluPSJTb3VyY2VHcmFwaGljIi8+PC9mZU1lcmdlPjwvZmlsdGVyPjwvZGVmcz48cGF0aCBkPSJNICAyMCA5NSBMIDMwIDEwIEwgNzAgMTAgTCA4MCA5NSBaIiBmaWxsPSJ1cmwoI2dyYWQxKSIgc3Ryb2tlPSIjNGE1NTY4IiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNIDQwIDQwIEwgNjAgNDAgTCA1OCA1NSBMIDQyIDU1IFoiIGZpbGw9IiNlZjQ0NDQiIGZpbHRlcj0idXJsKCNnbG93KSIvPjxsaW5lIHgxPSI1MCIgeTE9IjEwIiB4Mj0iNTAiIHkyPSI5NSIgc3Ryb2tlPSIjNGE1NTY4IiBzdHJva2Utd2lkdGg9IjAuNSIvPjxsaW5lIHgxPSIzNSIgeTE9IjEwIiB4Mj0iMjUiIHkyPSI5NSIgc3Ryb2tlPSIjNGE1NTY4IiBzdHJva2Utd2lkdGg9IjAuNSIvPjxsaW5lIHgxPSI2NSIgeTE9IjEwIiB4Mj0iNzUiIHkyPSI5NSIgc3Ryb2tlPSIjNGE1NTY4IiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvc3ZnPg==",
};

const EnemyComponent: React.FC<EnemyProps> = ({ enemy }) => {
    const bossGlow = enemy.isBoss ? 'drop-shadow(0 0 20px #ef4444aa)' : '';
    const slowGlow = enemy.isSlowed ? 'drop-shadow(0 0 8px #38bdf8)' : '';

    const style: React.CSSProperties = {
        left: enemy.x - enemy.width / 2,
        top: enemy.y - enemy.height / 2,
        width: enemy.width,
        height: enemy.height,
        // Combine filters: boss glow and slow glow
        filter: [bossGlow, slowGlow].filter(Boolean).join(' ') || undefined,
    };

    const maxHealth = (enemy.level === 2 && enemy.type === EnemyType.FUD)
        ? ENEMY_DATA[enemy.type].levelData![2]!.health!
        : (enemy.level === 2 && enemy.type === EnemyType.PaperHands)
        ? ENEMY_DATA[enemy.type].levelData![2]!.health!
        : ENEMY_DATA[enemy.type].health;
        
    const healthPercentage = (enemy.health / maxHealth) * 100;
    
    const level = enemy.level || 1;
    const svgKey = `${enemy.type}_${level}`;
    const defaultSvgKey = `${enemy.type}_1`;
    const svgToUse = ENEMY_SVGS[svgKey] || ENEMY_SVGS[defaultSvgKey];

    return (
        <div className="absolute z-5" style={style}>
            {enemy.chatBubble && (
                <div 
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-3 py-1 bg-white text-black text-sm font-bold rounded-lg shadow-lg"
                    style={{
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
                    }}
                >
                    {enemy.chatBubble.text}
                    {/* Speech bubble arrow */}
                    <div 
                        className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 h-0"
                        style={{
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderTop: '8px solid white',
                        }}
                    ></div>
                </div>
            )}

            <img src={svgToUse} alt={ENEMY_DATA[enemy.type].name} className="w-full h-full" />
            
            {enemy.isBoss && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-[150px] h-4 bg-red-900 border-2 border-red-500 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-red-500 rounded-full transition-all duration-200"
                        style={{ width: `${healthPercentage}%` }}
                    ></div>
                    <div className="absolute inset-0 w-full flex justify-center items-center text-xs font-bold text-white text-shadow">
                        {Math.ceil(enemy.health)} / {maxHealth}
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(EnemyComponent);