import React from 'react';
import { Player, ItemType } from '../../types';
import { ITEM_DATA } from '../../constants';

interface SkillButtonProps {
    player: Player;
}

/**
 * A purely visual component for the skill button.
 * Touch interactions are handled globally by the `useTouch` hook to support
 * multi-touch scenarios with the joystick.
 */
const SkillButton: React.FC<SkillButtonProps> = ({ player }) => {
    const { heldItem } = player;

    if (!heldItem || heldItem.type !== ItemType.Candle || !heldItem.variant) {
        return null;
    }

    const variantData = ITEM_DATA[ItemType.Candle].variants![heldItem.variant];

    return (
        // This is a non-interactive div. `pointer-events-none` ensures that it
        // doesn't interfere with the global touch listeners on the window.
        <div
           className="absolute bottom-[124px] right-[48px] z-50 w-24 h-24 bg-gray-800/80 border-4 border-yellow-300 rounded-full shadow-lg flex items-center justify-center select-none pointer-events-none"
           aria-hidden="true"
        >
           <img
               src={ITEM_DATA[ItemType.Candle].svg}
               alt={variantData.name}
               className="h-14 w-auto"
               style={{ filter: 'drop-shadow(0 0 5px #10B981)'}}
           />
       </div>
    );
};

export default SkillButton;