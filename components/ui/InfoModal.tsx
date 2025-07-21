import React from 'react';
import { ENEMY_DATA, CROCODILE_ICON } from '../../constants';
import { WeaponType, EnemyType, ItemType } from '../../types';
import { STATIC_DESCRIPTIONS } from '../../services/geminiService';

interface InfoModalProps {
    onClose: () => void;
}

const ICONS: Record<string, string> = {
    [WeaponType.ShillTweet]: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cG9seWdvbiBwb2ludHM9IjEwLDEwIDkwLDUwIDEwLDkwIDI1LDUwIiBmaWxsPSIjMzhiZGY4Ii8+PC9zdmc+",
    [WeaponType.HODLerArea]: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utb3BhY2l0eT0iMC42IiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utb3BhY2l0eT0iMC4zIiBzdHJva2Utd2lkdGg9IjQiLz48L3N2Zz4=",
    [WeaponType.TradingBot]: CROCODILE_ICON,
    [WeaponType.LaserEyes]: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNIDEwIDUwIEMgMTAgMjAsIDkwIDIwLCA5MCA1MCBDIDkwIDgwLCAxMCA4MCwgMTAgNTBaIiBmaWxsPSIjZmZmIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMyIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjI1IiBmaWxsPSIjZjAwIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMTAiIGZpbGw9IiMwMDAiLz48Y2lyY2xlIGN4PSI0NSIgY3k9IjQwIiByPSI4IiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjciLz48L3N2Zz4=",
    [WeaponType.Airdrop]: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNNjAsODBIODVWMzBINjBWNDVINDVWODBIOSIgc3Ryb2tlPSIjODc2MjQxIiBmaWxsPSIjQjU4NDU5IiBzdHJva2Utd2lkdGg9IjYiLz48cGF0aCBkPSJNMjUsMzAgaDIwIHYtMjAgYTEwIDEwIDAgMSAxIDIwIDAgdjIwIGgyMCIgc3Ryb2tlPSIjRUZFRkZGIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==",
    [EnemyType.FUD]: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMjAsNzAgQzEwLDUwIDE1LDIwIDMwLDIwIEM0MCwxNSA2MCwxNSA3MCwyMCBDODUsMjUgOTAsNTAgODAsNzAgQzkwLDgwIDgwLDk1IDY1LDkwIEwzNSw5MCBDMjAsOTUgMTAsODAgMjAsNzAgWiIgZmlsbD0iI0EwNTIyRCIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iNDUiIHI9IjUiIGZpbGw9ImJsYWNrIi8+PGNpcmNsZSBjeD0iNjUiIGN5PSI0NSIgcj0iNSIgZmlsbD0iYmxhY2siLz48cGF0aCBkPSJNNDUsNjUgUTUwLDc1IDU1LDY1IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjQiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjUiIHI9IjEyIiBmaWxsPSIjQTA1MjJEIi8+PGNpcmNsZSBjeD0iODAiIGN5PSIyNSIgcj0iMTIiIGZpbGw9IiNBNTAyMkQiLz48L3N2Zz4=",
    [EnemyType.PaperHands]: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMjAsMjAgTDgwLDI1IEwgNzUsODAgTDI1LDc1IFoiIGZpbGw9IiNDQ0MiIHN0cm9rZT0iIzk5OSIgc3Ryb2tlLXdpZHRoPSIzIi8+PHBhdGggZD0iTTgwLDI1IEw3OCw0NSBMNTAsNDAgTDQ4LDMwIHogTTI1LDc1IEwzMCw1NSBMNTUsNjAgTDQ1LDcwIHoiIGZpbGw9IiNEREQiLz48cGF0aCBkPSJNMzUsMzUgQzQ1LDI1LDU1LDI1LDY1LDM1IiBmaWxsPSJub25lIiBzdHJva2U9IiMxMTIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTQ1LDYwIEw1NSw2MCIgc3Ryb2tlPSIjMTExIiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==",
    [EnemyType.RivalWhale]: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMTAgNTBDOCAzMCAzMCwxMCA1MCwxMUM3MCwxMCA5MiwyNSA5MCA1MEM5NSw4MCA2NSw5NSA1MCw5NUMzNSw5NSAxMiw3NSAxMCA1MFoiIGZpbGw9IiMxRTQxN0YiLz48cGF0aCBkPSJNMTAgNTBDMTUgNTUgMjAgNTIgMjUgNTdMMjUgNzBINyBaIiBmaWxsPSIjN0JBQ0UyIi8+PGNpcmNsZSBjeD0iNzUiIGN5PSIzNSIgcj0iOCIgZmlsbD0id2hpdGUiLz48Y2lyY2xlIGN4PSI3NyIgY3k9IjM1IiByPSI0IiBmaWxsPSJibGFjayIvPjxsaW5lIHgxPSI5MCIgeTE9IjUwIiB4Mj0iODUiIHkyPSI3MCIgc3Ryb2tlPSIjN0JBQ0UyIiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=",
    [EnemyType.MigratingBoss]: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQxIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzJkMzc0ODtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxYTIwMmM7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48ZmlsdGVyIGlkPSJnbG93Ij48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIzLjUiIHJlc3VsdD0iY29sb3JlZEJsdXIiLz48ZmVNZXJnZT48ZmVNZXJnZU5vZGUgaW49ImNvbG9yZWRCbHVyIi8+PGZlTWVyZ2VOb2RlIGluPSJTb3VyY2VHcmFwaGljIi8+PC9mZU1lcmdlPjwvZmlsdGVyPjwvZGVmcz48cGF0aCBkPSJNICAyMCA5NSBMIDMwIDEwIEwgNzAgMTAgTCA4MCA5NSBaIiBmaWxsPSJ1cmwoI2dyYWQxKSIgc3Ryb2tlPSIjNGE1NTY4IiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNIDQwIDQwIEwgNjAgNDAgTCA1OCA1NSBMIDQyIDU1IFoiIGZpbGw9IiNlZjQ0NDQiIGZpbHRlcj0idXJsKCNnbG93KSIvPjxsaW5lIHgxPSI1MCIgeTE9IjEwIiB4Mj0iNTAiIHkyPSI5NSIgc3Ryb2tlPSIjNGE1NTY4IiBzdHJva2Utd2lkdGg9IjAuNSIvPjxsaW5lIHgxPSIzNSIgeTE9IjEwIiB4Mj0iMjUiIHkyPSI5NSIgc3Ryb2tlPSIjNGE1NTY4IiBzdHJva2Utd2lkdGg9IjAuNSIvPjxsaW5lIHgxPSI2NSIgeTE9IjEwIiB4Mj0iNzUiIHkyPSI5NSIgc3Ryb2tlPSIjNGE1NTY4IiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvc3ZnPg==",
    [ItemType.Candle]: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNDAgMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9IiMxMEI5ODEiPjxyZWN0IHg9IjE4IiB5PSIwIiB3aWR0aD0iNCIgaGVpZ2h0PSIxMDAiIC8+PHJlY3QgeD0iNSIgeT0iMjAiIHdpZHRoPSIzMCIgaGVpZ2h0PSI2MCIgLz48L3N2Zz4=",
};

const Section: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-3xl font-cinzel text-green-300 mb-4 border-b-2 border-gray-600 pb-2">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {children}
        </div>
    </div>
);

const InfoItem: React.FC<{icon: string; name: string; children: React.ReactNode}> = ({ icon, name, children }) => (
    <div className="flex items-start space-x-4 p-3 bg-gray-800/50 rounded-lg">
        <img src={icon} alt={name} className="w-12 h-12 flex-shrink-0" style={{ imageRendering: 'pixelated' }} />
        <div>
            <h3 className="font-bold text-lg text-white">{name}</h3>
            <p className="text-gray-400 text-sm">{children}</p>
        </div>
    </div>
);


const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50" onClick={onClose}>
            <div 
                className="bg-gray-900 text-white border-2 border-green-400 rounded-lg shadow-2xl shadow-green-500/20 w-full max-w-4xl h-[90vh] overflow-y-auto p-8"
                onClick={e => e.stopPropagation()}
                style={{ touchAction: 'pan-y' }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-cinzel text-green-400">Whitepaper</h1>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </div>
                
                <Section title="Tech Arsenal">
                    {Object.values(WeaponType).map(type => (
                            <InfoItem key={type} icon={ICONS[type]} name={type}>
                                {STATIC_DESCRIPTIONS[type][0]}
                            </InfoItem>
                        ))}
                </Section>
                
                <Section title="Market Threats">
                     {Object.keys(ENEMY_DATA).map(key => {
                        const type = Number(key) as EnemyType;
                        const data = ENEMY_DATA[type];
                        let description = '';
                        switch(data.name) {
                            case 'FUD': description = 'Spreads Fear, Uncertainty, and Doubt to lower your balance.'; break;
                            case 'Paper Hands': description = 'Dumps their bags at the slightest dip, fast but weak.'; break;
                            case 'Rival Whale': description = 'A powerful market manipulator, slow but tough with high impact.'; break;
                            case 'Migrating Boss': description = 'A destabilizing market force. While active, your MC will not grow and will instead drop until the boss is defeated.'; break;
                        }

                        return (
                            <InfoItem key={data.name} icon={ICONS[type]} name={data.name}>
                                {description}
                            </InfoItem>
                        )
                    })}
                </Section>

                <Section title="Special Items">
                    {Object.values(ItemType)
                        .filter(type => type !== ItemType.BONKAura)
                        .map(type => {
                        return (
                            <InfoItem key={type} icon={ICONS[type]} name={type}>
                                A powerful, one-time use item dropped by enemies. It activates automatically when you walk over it.
                            </InfoItem>
                        )
                    })}
                </Section>
            </div>
        </div>
    );
};

export default InfoModal;