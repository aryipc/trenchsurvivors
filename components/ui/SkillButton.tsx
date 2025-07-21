import React from 'react';
import { Player, ItemType } from '../../types';
import { ITEM_DATA } from '../../constants';

interface SkillButtonProps {
    player: Player;
    onUseItem: () => void;
}

const SkillButton: React.FC<SkillButtonProps> = ({ player, onUseItem }) => {
    const { heldItem } = player;

    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onUseItem();
    };

    if (!heldItem || heldItem.type !== ItemType.Candle || !heldItem.variant) {
        return null;
    }

    const variantData = ITEM_DATA[ItemType.Candle].variants![heldItem.variant];

    return (
        <button
           onPointerDown={handlePointerDown}
           type="button"
           className="absolute bottom-[124px] right-12 z-50 w-24 h-24 bg-gray-800/80 border-4 border-yellow-300 rounded-full shadow-lg flex items-center justify-center active:bg-yellow-400/50 p-0 appearance-none"
           aria-label="Use Item"
           style={{ touchAction: 'none' }}
        >
           <img
               src={ITEM_DATA[ItemType.Candle].svg}
               alt={variantData.name}
               className="h-14 w-auto pointer-events-none"
               style={{ filter: 'drop-shadow(0 0 5px #10B981)'}}
           />
       </button>
    );
};

export default SkillButton;
