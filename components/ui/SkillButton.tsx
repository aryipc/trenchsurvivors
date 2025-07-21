import React, { useEffect, useRef } from 'react';
import { Player, ItemType } from '../../types';
import { ITEM_DATA } from '../../constants';

interface SkillButtonProps {
    player: Player;
    onUseItem: () => void;
}

const SkillButton: React.FC<SkillButtonProps> = ({ player, onUseItem }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { heldItem } = player;

    useEffect(() => {
        const buttonElement = buttonRef.current;
        if (!buttonElement) return;

        const handlePointerDown = (e: PointerEvent) => {
            // Prevent default browser actions like text selection or context menu.
            e.preventDefault();
            // Stop the event from bubbling up to parent elements.
            e.stopPropagation();
            onUseItem();
        };

        // Using a native event listener to bypass React's synthetic event system.
        // This can resolve conflicts with other complex touch handlers like the joystick.
        buttonElement.addEventListener('pointerdown', handlePointerDown);

        return () => {
            if (buttonElement) {
                buttonElement.removeEventListener('pointerdown', handlePointerDown);
            }
        };
    }, [onUseItem]); // Dependency array ensures the effect is managed correctly.

    if (!heldItem || heldItem.type !== ItemType.Candle || !heldItem.variant) {
        return null;
    }

    const variantData = ITEM_DATA[ItemType.Candle].variants![heldItem.variant];

    return (
        <button
           ref={buttonRef}
           type="button"
           className="absolute bottom-[124px] right-12 z-50 w-24 h-24 bg-gray-800/80 border-4 border-yellow-300 rounded-full shadow-lg flex items-center justify-center active:bg-yellow-400/50 p-0 appearance-none"
           aria-label="Use Item"
           style={{ touchAction: 'none' }} // Crucial for pointer events
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