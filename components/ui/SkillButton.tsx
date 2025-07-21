
import React, { useRef, useEffect } from 'react';
import { Player, ItemType } from '../../types';
import { ITEM_DATA } from '../../constants';

interface SkillButtonProps {
    player: Player;
}

/**
 * A component for the skill button that is responsible for display and for
 * registering its hitbox with the global touch system.
 */
const SkillButton: React.FC<SkillButtonProps> = ({ player }) => {
    const { heldItem } = player;
    const buttonRef = useRef<HTMLDivElement>(null);

    // Effect for registering the hitbox for the global touch handler.
    useEffect(() => {
        const updateGeometry = () => {
            if (buttonRef.current && (window as any).controlGeometries) {
                (window as any).controlGeometries.skillButton = buttonRef.current.getBoundingClientRect();
            }
        };
        
        // If there's an item, the button is visible. Register its geometry.
        if (heldItem) {
            // A small delay to ensure layout is stable before getting the rect.
            const timeoutId = setTimeout(updateGeometry, 50);
            window.addEventListener('resize', updateGeometry);
            
            return () => {
                clearTimeout(timeoutId);
                window.removeEventListener('resize', updateGeometry);
                // Clean up global state when component unmounts or becomes hidden
                if ((window as any).controlGeometries) {
                    (window as any).controlGeometries.skillButton = null;
                }
            };
        } else {
             // If no item, ensure the geometry is cleared from the global state.
            if ((window as any).controlGeometries) {
                (window as any).controlGeometries.skillButton = null;
            }
        }
    }, [heldItem]); // Rerun this effect if the heldItem changes.


    if (!heldItem || heldItem.type !== ItemType.Candle || !heldItem.variant) {
        return null;
    }

    const variantData = ITEM_DATA[ItemType.Candle].variants![heldItem.variant];

    return (
        // This is a non-interactive div. `pointer-events-none` ensures that it
        // doesn't interfere with the global touch listeners on the window.
        <div
           ref={buttonRef}
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
