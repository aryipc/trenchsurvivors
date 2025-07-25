
import React from 'react';

const ENEMY_ICONS = [
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMjAsNzAgQzEwLDUwIDE1LDI1IDMwLDIwIEM0MCwxNSA2MCwxNSA3MCwyMCBDODUsMjUgOTAsNTAgODAsNzAgQzkwLDgwIDgwLDk1IDY1LDkwIEwzNSw5MCBDMjAsOTUgMTAsODAgMjAsNzAgWiIgZmlsbD0iI0EwNTIyRCIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iNDUiIHI9IjUiIGZpbGw9ImJsYWNrIi8+PGNpcmNsZSBjeD0iNjUiIGN5PSI0NSIgcj0iNSIgZmlsbD0iYmxhY2siLz48cGF0aCBkPSJNNDUsNjUgUTUwLDc1IDU1LDY1IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjQiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjUiIHI9IjEyIiBmaWxsPSIjQTA1MjJEIi8+PGNpcmNsZSBjeD0iODAiIGN5PSIyNSIgcj0iMTIiIGZpbGw9IiNBNTAyMkQiLz48L3N2Zz4=", // FUD
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMjAsMjAgTDgwLDI1IEwgNzUsODAgTDI1LDc1IFoiIGZpbGw9IiNDQ0MiIHN0cm9rZT0iIzk5OSIgc3Ryb2tlLXdpZHRoPSIzIi8+PHBhdGggZD0iTTgwLDI1IEw3OCw0NSBMNTAsNDAgTDQ4LDMwIHogTTI1LDc1IEwzMCw1NSBMNTUsNjAgTDQ1LDcwIHoiIGZpbGw9IiNEREQiLz48cGF0aCBkPSJNMzUsMzUgQzQ1LDI1LDU1LDI1LDY1LDM1IiBmaWxsPSJub25lIiBzdHJva2U9IiMxMTIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTQ1LDYwIEw1NSw2MCIgc3Ryb2tlPSIjMTExIiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==", // PaperHands
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMTAgNTBDOCAzMCAzMCwxMCA1MCwxMUM3MCwxMCA5MiwyNSA5MCA1MEM5NSw4MCA2NSw5NSA1MCw5NUMzNSw5NSAxMiw3NSAxMCA1MFoiIGZpbGw9IiMxRTQxN0YiLz48cGF0aCBkPSJNMTAgNTBDMTUgNTUgMjAgNTIgMjUgNTdMMjUgNzBINyBaIiBmaWxsPSIjN0JBQ0UyIi8+PGNpcmNsZSBjeD0iNzUiIGN5PSIzNSIgcj0iOCIgZmlsbD0id2hpdGUiLz48Y2lyY2xlIGN4PSI3NyIgY3k9IjM1IiByPSI0IiBmaWxsPSJibGFjayIvPjxsaW5lIHgxPSI5MCIgeTE9IjUwIiB4Mj0iODUiIHkyPSI3MCIgc3Ryb2tlPSIjN0JBQ0UyIiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=", // Rival Whale
];

const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    icon: ENEMY_ICONS[i % ENEMY_ICONS.length],
    style: {
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 60 + 40}px`,
        animationDuration: `${Math.random() * 20 + 15}s`,
        animationDelay: `${Math.random() * -35}s`, // Negative delay starts animations partway through
        opacity: Math.random() * 0.08 + 0.02,
    }
}));

const StartScreenBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
            {particles.map(p => (
                <div key={p.id} className="absolute animate-float-background" style={p.style}>
                    <img src={p.icon} alt="" className="w-full h-full"/>
                </div>
            ))}
        </div>
    );
};

export default React.memo(StartScreenBackground);
